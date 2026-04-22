import { createClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/email/client';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!userData || (userData.role !== 'admin' && userData.role !== 'super_admin')) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
    }

    const body = await request.json();
    const { to, subject, text_body, applicant_user_id, task_id } = body;

    if (!to || !subject || !text_body) {
      return new Response(JSON.stringify({ error: 'to, subject, and text_body are required' }), {
        status: 400,
      });
    }

    // Convert plain text to simple HTML
    const htmlBody = `<div style="font-family: sans-serif; font-size: 15px; line-height: 1.6; color: #111; max-width: 600px; margin: 0 auto; padding: 24px;">${text_body
      .split('\n')
      .map((line: string) => (line.trim() === '' ? '<br/>' : `<p style="margin: 0 0 8px;">${line}</p>`))
      .join('')}</div>`;

    const success = await sendEmail(to, subject, htmlBody);

    // Log to communication_log regardless of success
    await supabase.from('communication_log' as never).insert({
      user_id: applicant_user_id ?? null,
      sent_by: user.id,
      channel: 'email',
      subject,
      body: text_body,
      status: success ? 'sent' : 'failed',
      sent_at: success ? new Date().toISOString() : null,
      batch_id: task_id ? `task_${task_id}` : null,
    } as never);

    if (!success) {
      return new Response(JSON.stringify({ error: 'Email delivery failed' }), { status: 502 });
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    console.error('[POST /api/admin/tasks/send-email]', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}
