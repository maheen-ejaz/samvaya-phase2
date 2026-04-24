import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/admin/auth';
import { logActivity } from '@/lib/admin/activity';
import { checkRateLimit } from '@/lib/rate-limit';
import { sendEmail } from '@/lib/email/client';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function POST(request: Request) {
  try {
    const result = await requireAdmin();
    if (result.error) return result.error;
    const { admin } = result;

    const { allowed } = await checkRateLimit(`admin-send-email:${admin.id}`, 50, 3600_000);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many emails sent. Please try again later.' },
        { status: 429 },
      );
    }

    const body = await request.json();
    const { to, subject, text_body, applicant_user_id, task_id } = body;

    if (!to || !subject || !text_body) {
      return NextResponse.json(
        { error: 'to, subject, and text_body are required' },
        { status: 400 },
      );
    }

    // HTML-escape each line before wrapping in <p> tags to prevent email-embedded
    // script/tracking injection from pasted content.
    const htmlBody = `<div style="font-family: sans-serif; font-size: 15px; line-height: 1.6; color: #111; max-width: 600px; margin: 0 auto; padding: 24px;">${String(
      text_body,
    )
      .split('\n')
      .map((line: string) => (line.trim() === '' ? '<br/>' : `<p style="margin: 0 0 8px;">${escapeHtml(line)}</p>`))
      .join('')}</div>`;

    const success = await sendEmail(to, subject, htmlBody);

    const supabase = await createClient();
    await supabase.from('communication_log' as never).insert({
      user_id: applicant_user_id ?? null,
      sent_by: admin.id,
      channel: 'email',
      subject,
      body: text_body,
      status: success ? 'sent' : 'failed',
      sent_at: success ? new Date().toISOString() : null,
      batch_id: task_id ? `task_${task_id}` : null,
    } as never);

    const logOk = await logActivity(
      admin.id,
      success ? 'sent_task_email' : 'failed_task_email',
      'admin_task',
      task_id ?? applicant_user_id ?? 'unknown',
      { recipient: to, subject, applicant_user_id: applicant_user_id ?? null },
    );
    if (!logOk) {
      return NextResponse.json(
        { error: 'Audit log write failed. Please retry.' },
        { status: 500 },
      );
    }

    if (!success) {
      return NextResponse.json({ error: 'Email delivery failed' }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[POST /api/admin/tasks/send-email]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
