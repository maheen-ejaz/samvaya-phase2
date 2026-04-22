import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual, createHmac } from 'crypto';
import { checkRateLimit } from '@/lib/rate-limit';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email/client';
import {
  formReminder1Email,
  formReminder2Email,
  formReminder3Email,
  formReminder4Email,
  formReminder5Email,
} from '@/lib/email/templates';

/**
 * Cron endpoint to send abandonment reminder emails.
 * Triggered by Vercel Cron every 6 hours.
 *
 * Reminder schedule (time since last form activity):
 *   1 → 24 hours
 *   2 → 3 days
 *   3 → 7 days
 *   4 → 14 days
 *   5 → 21 days (final)
 */

const REMINDER_THRESHOLDS: Array<{ afterMs: number; count: number }> = [
  { afterMs: 21 * 24 * 60 * 60 * 1000, count: 4 }, // 21 days → send #5
  { afterMs: 14 * 24 * 60 * 60 * 1000, count: 3 }, // 14 days → send #4
  { afterMs:  7 * 24 * 60 * 60 * 1000, count: 2 }, //  7 days → send #3
  { afterMs:  3 * 24 * 60 * 60 * 1000, count: 1 }, //  3 days → send #2
  { afterMs:  1 * 24 * 60 * 60 * 1000, count: 0 }, // 24 hours → send #1
];

const REMINDER_TEMPLATES = [
  formReminder1Email, // #1
  formReminder2Email, // #2
  formReminder3Email, // #3
  formReminder4Email, // #4
  formReminder5Email, // #5
];

const MAX_REMINDERS = 5;

export async function POST(request: NextRequest) {
  // Validate cron secret
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  const expectedValue = `Bearer ${cronSecret}`;
  if (!cronSecret || !authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const key = 'samvaya-cron-verify';
  const a = createHmac('sha256', key).update(authHeader).digest();
  const b = createHmac('sha256', key).update(expectedValue).digest();
  if (!timingSafeEqual(a, b)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { allowed } = await checkRateLimit('send-abandonment:cron', 10, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const adminSupabase = createAdminClient();

  // Fetch in-progress users who have form activity and haven't received all reminders
  const { data: users, error } = await adminSupabase
    .from('users' as never)
    .select('id, last_form_activity_at, abandonment_reminder_count')
    .eq('membership_status' as never, 'onboarding_in_progress')
    .not('last_form_activity_at' as never, 'is', null)
    .lt('abandonment_reminder_count' as never, MAX_REMINDERS)
    .limit(100);

  if (error) {
    console.error('Failed to fetch abandonment candidates:', error);
    return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
  }

  if (!users || users.length === 0) {
    return NextResponse.json({ processed: 0 });
  }

  const now = Date.now();
  let sent = 0;
  let failed = 0;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const user of users as any[]) {
    const lastActivity = new Date(user.last_form_activity_at).getTime();
    const timeSinceActivity = now - lastActivity;
    const reminderCount = user.abandonment_reminder_count ?? 0;

    // Find the next reminder to send: check thresholds from longest to shortest
    let reminderNumber = 0;
    for (const threshold of REMINDER_THRESHOLDS) {
      if (timeSinceActivity >= threshold.afterMs && reminderCount === threshold.count) {
        reminderNumber = threshold.count + 1;
        break;
      }
    }

    if (reminderNumber === 0) continue;

    // Get user email from auth
    const { data: authUser } = await adminSupabase.auth.admin.getUserById(user.id);
    const recipientEmail = authUser?.user?.email;
    if (!recipientEmail) {
      failed++;
      continue;
    }

    // Get first name from profiles
    const { data: profileData } = await adminSupabase
      .from('profiles' as never)
      .select('first_name')
      .eq('user_id' as never, user.id)
      .maybeSingle();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const firstName = (profileData as any)?.first_name || 'there';

    const templateFn = REMINDER_TEMPLATES[reminderNumber - 1];
    const template = templateFn(firstName);

    const success = await sendEmail(recipientEmail, template.subject, template.html);

    if (success) {
      await adminSupabase
        .from('users' as never)
        .update({ abandonment_reminder_count: reminderNumber } as never)
        .eq('id' as never, user.id);
      sent++;
    } else {
      failed++;
    }
  }

  return NextResponse.json({ sent, failed });
}
