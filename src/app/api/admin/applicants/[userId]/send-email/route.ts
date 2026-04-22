import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, validateUserId } from '@/lib/admin/auth';
import { logActivity } from '@/lib/admin/activity';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email/client';
import { checkRateLimit } from '@/lib/rate-limit';
import { escapeHtml } from '@/lib/utils';

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

  // Rate limit: max 100 individual emails per hour per admin
  const { allowed } = await checkRateLimit(`admin-email:${admin.id}`, 100, 3600_000);
  if (!allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded. Max 100 emails per hour.' }, { status: 429 });
  }

  let body: { subject?: string; body?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const subject = body.subject?.trim();
  const emailBody = body.body?.trim();

  if (!subject || !emailBody) {
    return NextResponse.json({ error: 'Subject and body are required' }, { status: 400 });
  }

  if (subject.length > 255) {
    return NextResponse.json({ error: 'Subject must be 255 characters or fewer' }, { status: 400 });
  }

  if (emailBody.length > 5000) {
    return NextResponse.json({ error: 'Body must be 5,000 characters or fewer' }, { status: 400 });
  }

  const adminSupabase = createAdminClient();

  // Get applicant email
  const { data: authData } = await adminSupabase.auth.admin.getUserById(userId);
  const email = authData?.user?.email;

  if (!email) {
    return NextResponse.json({ error: 'Applicant email not found' }, { status: 404 });
  }

  // Send email
  const safeBody = escapeHtml(emailBody).replace(/\n/g, '<br/>');
  const html = `<div style="font-family: sans-serif; max-width: 600px;">
    <p>${safeBody}</p>
    <hr style="margin-top: 24px; border: none; border-top: 1px solid #eee;" />
    <p style="color: #999; font-size: 12px;">Samvaya Matrimony Team</p>
  </div>`;

  const success = await sendEmail(email, subject, html);

  // Log to communication_log
  const { error: logError } = await adminSupabase.from('communication_log' as never).insert({
    user_id: userId,
    sent_by: admin.id,
    channel: 'email',
    subject: escapeHtml(subject),
    body: emailBody,
    status: success ? 'sent' : 'failed',
    sent_at: success ? new Date().toISOString() : null,
  } as never);

  if (logError) {
    console.error('Failed to log communication:', logError);
  }

  await logActivity(admin.id, 'sent_email', 'user', userId, { subject });

  if (!success) {
    return NextResponse.json({ error: 'Email delivery failed' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
