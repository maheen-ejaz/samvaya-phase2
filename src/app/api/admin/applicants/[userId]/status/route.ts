import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, validateUserId } from '@/lib/admin/auth';
import { logActivity } from '@/lib/admin/activity';
import { createAdminClient } from '@/lib/supabase/admin';

type Action = 'mark_verification_paid' | 'mark_goocampus_verified' | 'move_to_pool';

const VALID_ACTIONS: Action[] = ['mark_verification_paid', 'mark_goocampus_verified', 'move_to_pool'];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const result = await requireAdmin();
  if (result.error) return result.error;
  const { admin } = result;

  const { userId } = await params;
  const idError = validateUserId(userId);
  if (idError) return idError;

  let body: { action?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { action } = body;
  if (!action || !VALID_ACTIONS.includes(action as Action)) {
    return NextResponse.json(
      { error: `Invalid action. Must be one of: ${VALID_ACTIONS.join(', ')}` },
      { status: 400 }
    );
  }

  const adminSupabase = createAdminClient();

  // Fetch target user
  const { data: targetUser, error: fetchError } = await adminSupabase
    .from('users')
    .select('id, payment_status, bgv_consent, is_goocampus_member, membership_status, is_bgv_complete')
    .eq('id', userId)
    .single();

  if (fetchError || !targetUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Guard: form must be complete
  if (targetUser.membership_status !== 'onboarding_complete') {
    return NextResponse.json(
      { error: 'Applicant has not completed the onboarding form yet.' },
      { status: 400 }
    );
  }

  // --- mark_verification_paid ---
  if (action === 'mark_verification_paid') {
    if (targetUser.payment_status !== 'unverified') {
      return NextResponse.json({ error: `Cannot process: status is "${targetUser.payment_status}".` }, { status: 400 });
    }
    if (targetUser.is_goocampus_member) {
      return NextResponse.json({ error: 'GooCampus member — use mark_goocampus_verified instead.' }, { status: 400 });
    }

    // Create/update payment record
    const { data: existingPayment } = await adminSupabase
      .from('payments')
      .select('id')
      .eq('user_id', userId)
      .eq('payment_type', 'verification_fee' as never)
      .maybeSingle();

    if (existingPayment) {
      await adminSupabase.from('payments').update({
        verification_fee_paid: true,
        paid_at: new Date().toISOString(),
        status: 'captured' as never,
        amount: 708000,
      }).eq('id', existingPayment.id);
    } else {
      await adminSupabase.from('payments').insert({
        user_id: userId,
        payment_type: 'verification_fee' as never,
        amount: 708000,
        currency: 'INR',
        verification_fee_paid: true,
        paid_at: new Date().toISOString(),
        status: 'captured' as never,
        is_goocampus_member: false,
      });
    }

    await adminSupabase.from('users').update({ payment_status: 'verification_pending' as never }).eq('id', userId);
    await logActivity(admin.id, 'marked_verification_paid', 'user', userId, { amount: 708000 });

    return NextResponse.json({ success: true, newPaymentStatus: 'verification_pending' });
  }

  // --- mark_goocampus_verified ---
  if (action === 'mark_goocampus_verified') {
    if (targetUser.payment_status !== 'unverified') {
      return NextResponse.json({ error: `Cannot process: status is "${targetUser.payment_status}".` }, { status: 400 });
    }
    if (!targetUser.is_goocampus_member) {
      return NextResponse.json({ error: 'Not a GooCampus member.' }, { status: 400 });
    }

    await adminSupabase.from('users').update({ payment_status: 'in_pool' as never }).eq('id', userId);
    await logActivity(admin.id, 'marked_goocampus_verified', 'user', userId);

    return NextResponse.json({ success: true, newPaymentStatus: 'in_pool' });
  }

  // --- move_to_pool ---
  if (action === 'move_to_pool') {
    if (targetUser.payment_status !== 'verification_pending') {
      return NextResponse.json({ error: `Cannot move to pool: status is "${targetUser.payment_status}".` }, { status: 400 });
    }
    if (!targetUser.is_bgv_complete) {
      return NextResponse.json({ error: 'BGV must be complete before moving to pool.' }, { status: 400 });
    }
    if (targetUser.bgv_consent !== 'consented' && targetUser.bgv_consent !== 'consented_wants_call') {
      return NextResponse.json({ error: 'BGV consent is required before moving to pool.' }, { status: 400 });
    }

    await adminSupabase.from('users').update({ payment_status: 'in_pool' as never }).eq('id', userId);
    await logActivity(admin.id, 'moved_to_pool', 'user', userId);

    return NextResponse.json({ success: true, newPaymentStatus: 'in_pool' });
  }

  return NextResponse.json({ error: 'Unhandled action' }, { status: 400 });
}
