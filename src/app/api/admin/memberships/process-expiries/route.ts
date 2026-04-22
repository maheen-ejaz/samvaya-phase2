import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual, createHmac } from 'crypto';
import { checkRateLimit } from '@/lib/rate-limit';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email/client';
import { membershipExpiredEmail } from '@/lib/email/templates';

/**
 * Cron endpoint to process expired memberships.
 * Triggered by Vercel Cron daily at 10:00 AM IST.
 *
 * Finds all active_member users whose membership_start_date is >= 1 year ago,
 * transitions them to membership_expired, and sends the expiry notification email.
 */
export async function POST(request: NextRequest) {
  // Validate cron secret
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || !authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const expectedValue = `Bearer ${cronSecret}`;
  const key = 'samvaya-cron-verify';
  const a = createHmac('sha256', key).update(authHeader).digest();
  const b = createHmac('sha256', key).update(expectedValue).digest();
  if (!timingSafeEqual(a, b)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { allowed } = checkRateLimit('process-expiries:cron', 10, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const adminSupabase = createAdminClient();

  // membership_start_date is set at mutual interest confirmation (per CLAUDE.md).
  // Membership window = 1 year from that date.
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const { data: expiredUsers, error } = await adminSupabase
    .from('users' as never)
    .select('id, membership_start_date')
    .eq('payment_status' as never, 'active_member')
    .lte('membership_start_date' as never, oneYearAgo.toISOString())
    .limit(100);

  if (error) {
    console.error('Failed to fetch expired memberships:', error);
    return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
  }

  if (!expiredUsers || expiredUsers.length === 0) {
    return NextResponse.json({ expired: 0, failed: 0 });
  }

  let expired = 0;
  let failed = 0;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const user of expiredUsers as any[]) {
    try {
      // Transition to membership_expired
      const { error: updateError } = await adminSupabase
        .from('users' as never)
        .update({ payment_status: 'membership_expired' as never } as never)
        .eq('id' as never, user.id);

      if (updateError) {
        console.error(`Failed to expire membership for user ${user.id}:`, updateError);
        failed++;
        continue;
      }

      // Get email from auth
      const { data: authUser } = await adminSupabase.auth.admin.getUserById(user.id);
      const recipientEmail = authUser?.user?.email;
      if (!recipientEmail) {
        failed++;
        continue;
      }

      // Get first name
      const { data: profileData } = await adminSupabase
        .from('profiles' as never)
        .select('first_name')
        .eq('user_id' as never, user.id)
        .maybeSingle();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const firstName = (profileData as any)?.first_name || 'there';

      const template = membershipExpiredEmail(firstName);
      await sendEmail(recipientEmail, template.subject, template.html);

      expired++;
    } catch (err) {
      console.error(`Unexpected error processing expiry for user ${user.id}:`, err);
      failed++;
    }
  }

  return NextResponse.json({ expired, failed });
}
