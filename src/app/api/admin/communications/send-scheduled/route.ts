import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email/client';

/**
 * Cron endpoint to process scheduled emails.
 * Triggered by Vercel Cron every 5 minutes.
 * Validates via CRON_SECRET to prevent unauthorized access.
 */
export async function POST(request: NextRequest) {
  // Validate cron secret
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  const expectedValue = `Bearer ${cronSecret}`;
  if (
    !cronSecret ||
    !authHeader ||
    authHeader.length !== expectedValue.length ||
    !timingSafeEqual(Buffer.from(authHeader), Buffer.from(expectedValue))
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const adminSupabase = createAdminClient();

  // Fetch pending scheduled emails that are due
  const { data: pendingEmails, error } = await adminSupabase
    .from('communication_log' as never)
    .select('*')
    .eq('status' as never, 'pending')
    .not('scheduled_at' as never, 'is', null)
    .lte('scheduled_at' as never, new Date().toISOString())
    .limit(50);

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch scheduled emails' }, { status: 500 });
  }

  if (!pendingEmails || pendingEmails.length === 0) {
    return NextResponse.json({ processed: 0 });
  }

  let processed = 0;
  let failed = 0;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const email of pendingEmails as any[]) {
    // Get recipient email from auth
    const { data: authUser } = await adminSupabase.auth.admin.getUserById(email.user_id);
    const recipientEmail = authUser?.user?.email;

    if (!recipientEmail) {
      await adminSupabase
        .from('communication_log' as never)
        .update({ status: 'failed' } as never)
        .eq('id' as never, email.id);
      failed++;
      continue;
    }

    // Wrap in HTML
    const htmlBody = `<!DOCTYPE html><html><body style="font-family:-apple-system,sans-serif;color:#1a1a1a;max-width:600px;margin:0 auto;padding:24px;">${(email.body as string).replace(/\n/g, '<br/>')}</body></html>`;

    const success = await sendEmail(recipientEmail, email.subject || '', htmlBody);

    await adminSupabase
      .from('communication_log' as never)
      .update({
        status: success ? 'sent' : 'failed',
        sent_at: success ? new Date().toISOString() : null,
      } as never)
      .eq('id' as never, email.id);

    if (success) processed++;
    else failed++;
  }

  return NextResponse.json({ processed, failed });
}
