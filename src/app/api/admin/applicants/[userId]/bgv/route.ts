import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, validateUserId } from '@/lib/admin/auth';
import { logActivity } from '@/lib/admin/activity';
import { createAdminClient } from '@/lib/supabase/admin';

const BGV_CHECK_TYPES = [
  'aadhaar', 'pan', 'bank_account', 'credit_check', 'employment',
  'education', 'professional_reference', 'court_records', 'criminal_records',
  'global_database', 'address_digital', 'address_physical', 'social_media',
] as const;

const VALID_STATUSES = ['pending', 'in_progress', 'verified', 'flagged'] as const;

/**
 * GET — Fetch BGV checks for an applicant (auto-creates 13 rows if none exist)
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const result = await requireAdmin();
  if (result.error) return result.error;

  const { userId } = await params;
  const idError = validateUserId(userId);
  if (idError) return idError;

  const adminSupabase = createAdminClient();

  // Verify user exists
  const { data: user } = await adminSupabase
    .from('users')
    .select('id, payment_status, bgv_consent, is_bgv_complete, bgv_flagged')
    .eq('id', userId)
    .single();

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Fetch existing checks
  let { data: checks } = await adminSupabase
    .from('bgv_checks' as never)
    .select('*')
    .eq('user_id', userId as never)
    .order('created_at' as never);

  const existingChecks = (checks || []) as Array<{
    id: string;
    check_type: string;
    status: string;
    notes: string | null;
    document_path: string | null;
    updated_by: string | null;
    created_at: string;
    updated_at: string;
  }>;

  // Auto-init: create missing check rows (upsert to handle concurrent requests)
  if (existingChecks.length < 13) {
    const existingTypes = new Set(existingChecks.map((c) => c.check_type));
    const missing = BGV_CHECK_TYPES.filter((t) => !existingTypes.has(t));

    if (missing.length > 0) {
      await adminSupabase.from('bgv_checks' as never).upsert(
        missing.map((check_type) => ({
          user_id: userId,
          check_type,
          status: 'pending',
        })) as never,
        { onConflict: 'user_id,check_type', ignoreDuplicates: true }
      );

      // Re-fetch
      const refetchResult = await adminSupabase
        .from('bgv_checks' as never)
        .select('*')
        .eq('user_id', userId as never)
        .order('created_at' as never);
      checks = refetchResult.data;
    }
  }

  return NextResponse.json({
    checks: checks || existingChecks,
    user: {
      paymentStatus: user.payment_status,
      bgvConsent: user.bgv_consent,
      isBgvComplete: user.is_bgv_complete,
      bgvFlagged: user.bgv_flagged,
    },
  });
}

/**
 * POST — Update a specific BGV check
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const result = await requireAdmin();
  if (result.error) return result.error;
  const { admin } = result;

  const { userId } = await params;
  const postIdError = validateUserId(userId);
  if (postIdError) return postIdError;

  let body: { checkType?: string; status?: string; notes?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { checkType, status, notes } = body;

  if (!checkType || !BGV_CHECK_TYPES.includes(checkType as typeof BGV_CHECK_TYPES[number])) {
    return NextResponse.json({ error: 'Invalid check type' }, { status: 400 });
  }

  if (status && !VALID_STATUSES.includes(status as typeof VALID_STATUSES[number])) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const adminSupabase = createAdminClient();

  // Verify prerequisites: fee paid AND consent given
  const { data: user } = await adminSupabase
    .from('users')
    .select('payment_status, bgv_consent')
    .eq('id', userId)
    .single();

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Check payment record for verification_fee_paid
  const { data: payment } = await adminSupabase
    .from('payments')
    .select('verification_fee_paid')
    .eq('user_id', userId)
    .eq('payment_type', 'verification_fee' as never)
    .maybeSingle();

  const feePaid = payment?.verification_fee_paid === true;
  const consentGiven = user.bgv_consent === 'consented' || user.bgv_consent === 'consented_wants_call';

  if (!feePaid || !consentGiven) {
    return NextResponse.json(
      { error: `BGV requires both fee paid (${feePaid}) and consent (${consentGiven}).` },
      { status: 400 }
    );
  }

  // Update the check
  const updateData: Record<string, unknown> = { updated_by: admin.id };
  if (status) updateData.status = status;
  if (notes !== undefined) updateData.notes = notes;

  const { error: updateError } = await adminSupabase
    .from('bgv_checks' as never)
    .update(updateData as never)
    .eq('user_id', userId as never)
    .eq('check_type', checkType as never);

  if (updateError) {
    console.error('Failed to update BGV check:', updateError);
    return NextResponse.json({ error: 'Failed to update check' }, { status: 500 });
  }

  // Check if all 13 are now verified (to update is_bgv_complete)
  const { data: allChecks } = await adminSupabase
    .from('bgv_checks' as never)
    .select('status')
    .eq('user_id', userId as never);

  const allChecksList = (allChecks || []) as Array<{ status: string }>;
  const allVerified = allChecksList.length === 13 && allChecksList.every((c) => c.status === 'verified');
  const anyFlagged = allChecksList.some((c) => c.status === 'flagged');

  await adminSupabase
    .from('users')
    .update({
      is_bgv_complete: allVerified,
      bgv_flagged: anyFlagged,
    } as never)
    .eq('id', userId);

  await logActivity(admin.id, 'updated_bgv_check', 'user', userId, {
    checkType,
    newStatus: status,
  });

  return NextResponse.json({
    success: true,
    isBgvComplete: allVerified,
    bgvFlagged: anyFlagged,
  });
}
