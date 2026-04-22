import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, validateUserId } from '@/lib/admin/auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { logActivity } from '@/lib/admin/activity';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendNotificationEmail } from '@/lib/email/notifications';
import { statusUpdateEmail } from '@/lib/email/templates';
import { PRICING } from '@/lib/constants';
import { createBgvInitiateTask } from '@/lib/admin/sync-tasks';

type Action = 'mark_verification_paid' | 'mark_goocampus_verified' | 'move_to_pool' | 'mark_membership_paid';

const VALID_ACTIONS: Action[] = ['mark_verification_paid', 'mark_goocampus_verified', 'move_to_pool', 'mark_membership_paid'];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const result = await requireAdmin();
  if (result.error) return result.error;
  const { admin } = result;

  const { allowed } = checkRateLimit(`status-change:${admin.id}`, 10, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests. Please try again in a moment.' }, { status: 429 });
  }

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
        amount: PRICING.VERIFICATION_FEE_PAISE,
      }).eq('id', existingPayment.id);
    } else {
      await adminSupabase.from('payments').insert({
        user_id: userId,
        payment_type: 'verification_fee' as never,
        amount: PRICING.VERIFICATION_FEE_PAISE,
        currency: 'INR',
        verification_fee_paid: true,
        paid_at: new Date().toISOString(),
        status: 'captured' as never,
        is_goocampus_member: false,
      });
    }

    await adminSupabase.from('users').update({ payment_status: 'verification_pending' as never }).eq('id', userId);
    await logActivity(admin.id, 'marked_verification_paid', 'user', userId, { amount: PRICING.VERIFICATION_FEE_PAISE });

    // Auto-create a task to initiate BGV
    createBgvInitiateTaskForUser(adminSupabase, userId);

    notifyStatusChange(adminSupabase, userId, 'verification_pending');
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

    notifyStatusChange(adminSupabase, userId, 'in_pool');
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

    notifyStatusChange(adminSupabase, userId, 'in_pool');
    return NextResponse.json({ success: true, newPaymentStatus: 'in_pool' });
  }

  // --- mark_membership_paid ---
  if (action === 'mark_membership_paid') {
    if (targetUser.payment_status !== 'awaiting_payment') {
      return NextResponse.json({ error: `Cannot mark membership paid: status is "${targetUser.payment_status}".` }, { status: 400 });
    }

    // Create/update membership payment record
    const { data: existingMembership } = await adminSupabase
      .from('payments')
      .select('id')
      .eq('user_id', userId)
      .eq('payment_type', 'membership_fee' as never)
      .maybeSingle();

    if (existingMembership) {
      await adminSupabase.from('payments').update({
        paid_at: new Date().toISOString(),
        status: 'captured' as never,
        amount: PRICING.MEMBERSHIP_FEE_PAISE,
      }).eq('id', existingMembership.id);
    } else {
      await adminSupabase.from('payments').insert({
        user_id: userId,
        payment_type: 'membership_fee' as never,
        amount: PRICING.MEMBERSHIP_FEE_PAISE,
        currency: 'INR',
        paid_at: new Date().toISOString(),
        status: 'captured' as never,
        is_goocampus_member: targetUser.is_goocampus_member,
      });
    }

    await adminSupabase.from('users').update({ payment_status: 'active_member' as never }).eq('id', userId);
    await logActivity(admin.id, 'marked_membership_paid', 'user', userId, { amount: PRICING.MEMBERSHIP_FEE_PAISE });

    notifyStatusChange(adminSupabase, userId, 'active_member');
    return NextResponse.json({ success: true, newPaymentStatus: 'active_member' });
  }

  return NextResponse.json({ error: 'Unhandled action' }, { status: 400 });
}

/** Fire-and-forget: create BGV initiate task after payment confirmed */
function createBgvInitiateTaskForUser(
  supabase: ReturnType<typeof createAdminClient>,
  userId: string
) {
  (async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('user_id', userId)
        .single();
      const { data: authUser } = await supabase.auth.admin.getUserById(userId);
      const name = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || 'Applicant';
      await createBgvInitiateTask({
        userId,
        name,
        phone: null,
        email: authUser?.user?.email ?? null,
      });
    } catch (err) {
      console.error('createBgvInitiateTaskForUser failed:', err);
    }
  })();
}

/** Fire-and-forget status change notification */
function notifyStatusChange(
  supabase: ReturnType<typeof createAdminClient>,
  userId: string,
  newStatus: string
) {
  (async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name')
        .eq('user_id', userId)
        .single();
      const name = profile?.first_name || 'there';
      await sendNotificationEmail(userId, 'status_update', () => statusUpdateEmail(name, newStatus));
    } catch (err) {
      console.error('Status notification failed:', err);
    }
  })();
}
