import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';
import { logActivity } from '@/lib/admin/activity';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email/client';
import { checkRateLimit } from '@/lib/rate-limit';
import { PRICING } from '@/lib/constants';
import { randomUUID } from 'crypto';
import { validateString } from '@/lib/validation';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function substituteVariables(
  text: string,
  vars: Record<string, string>
): string {
  return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return key in vars ? escapeHtml(vars[key]) : match;
  });
}

export async function GET(request: NextRequest) {
  const result = await requireAdmin();
  if (result.error) return result.error;

  const { searchParams } = new URL(request.url);
  const adminSupabase = createAdminClient();

  // History mode: return batches
  if (searchParams.get('history') === 'true') {
    const { data: logs } = await adminSupabase
      .from('communication_log' as never)
      .select('batch_id, subject, status, created_at' as never)
      .not('batch_id' as never, 'is', null)
      .order('created_at' as never, { ascending: false })
      .limit(5000);

    // Group by batch_id
    const batchMap = new Map<string, { count: number; sent: number; failed: number; pending: number; first_sent: string; subject: string }>();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const log of (logs || []) as any[]) {
      const existing = batchMap.get(log.batch_id) || {
        count: 0, sent: 0, failed: 0, pending: 0,
        first_sent: log.created_at, subject: log.subject || '',
      };
      existing.count++;
      if (log.status === 'sent') existing.sent++;
      else if (log.status === 'failed') existing.failed++;
      else existing.pending++;
      batchMap.set(log.batch_id, existing);
    }

    const batches = Array.from(batchMap.entries()).map(([batch_id, data]) => ({
      batch_id,
      ...data,
    }));

    return NextResponse.json({ batches });
  }

  // Preview mode: return matching recipients
  const paymentStatus = searchParams.get('payment_status')?.split(',').filter(Boolean) || [];
  const goocampus = searchParams.get('goocampus');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query: any = adminSupabase
    .from('users')
    .select('id, is_goocampus_member')
    .eq('role', 'applicant' as never);

  if (paymentStatus.length > 0) {
    query = query.in('payment_status', paymentStatus);
  }
  if (goocampus === 'yes') {
    query = query.eq('is_goocampus_member', true);
  } else if (goocampus === 'no') {
    query = query.eq('is_goocampus_member', false);
  }

  const { data: users } = await query;
  const userIds = (users || []).map((u: Record<string, string>) => u.id);

  if (userIds.length === 0) {
    return NextResponse.json({ recipients: [] });
  }

  const { data: profiles } = await adminSupabase
    .from('profiles')
    .select('user_id, first_name, last_name')
    .in('user_id', userIds);

  // Get emails from auth
  const { data: authUsers } = await adminSupabase.auth.admin.listUsers({ perPage: 1000 });

  const emailMap = new Map(
    (authUsers?.users || []).map((u) => [u.id, u.email || ''])
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recipients = (profiles || []).map((p: any) => ({
    id: p.user_id,
    first_name: p.first_name || '',
    last_name: p.last_name || '',
    email: emailMap.get(p.user_id) || '',
  })).filter((r: Record<string, string>) => r.email);

  return NextResponse.json({ recipients });
}

export async function POST(request: NextRequest) {
  const result = await requireAdmin();
  if (result.error) return result.error;
  const { admin } = result;

  let body: {
    template_id?: string;
    subject?: string;
    body?: string;
    payment_status?: string[];
    goocampus?: string;
    scheduled_at?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Rate limit: max 5 bulk sends per hour per admin
  const { allowed } = checkRateLimit(`admin-bulk:${admin.id}`, 5, 3600_000);
  if (!allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded. Max 5 bulk sends per hour.' }, { status: 429 });
  }

  const adminSupabase = createAdminClient();
  let emailSubject: string;
  let emailBody: string;

  // Get template or custom content
  if (body.template_id) {
    const { data: template } = await adminSupabase
      .from('email_templates' as never)
      .select('*')
      .eq('id' as never, body.template_id)
      .single();

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }
    emailSubject = (template as Record<string, string>).subject;
    emailBody = (template as Record<string, string>).body;
  } else if (body.subject && body.body) {
    const subjectError = validateString(body.subject, 'subject', { maxLength: 255 });
    if (subjectError) return NextResponse.json({ error: subjectError }, { status: 400 });
    const bodyError = validateString(body.body, 'body', { maxLength: 10000 });
    if (bodyError) return NextResponse.json({ error: bodyError }, { status: 400 });
    emailSubject = body.subject;
    emailBody = body.body;
  } else {
    return NextResponse.json({ error: 'Either template_id or subject+body required' }, { status: 400 });
  }

  // Fetch recipients
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let userQuery: any = adminSupabase
    .from('users')
    .select('id, payment_status, is_goocampus_member')
    .eq('role', 'applicant' as never);

  if (body.payment_status && body.payment_status.length > 0) {
    userQuery = userQuery.in('payment_status', body.payment_status);
  }
  if (body.goocampus === 'yes') {
    userQuery = userQuery.eq('is_goocampus_member', true);
  } else if (body.goocampus === 'no') {
    userQuery = userQuery.eq('is_goocampus_member', false);
  }

  const { data: users } = await userQuery;
  if (!users || users.length === 0) {
    return NextResponse.json({ error: 'No recipients match the filters' }, { status: 400 });
  }

  const MAX_RECIPIENTS = 500;
  if (users.length > MAX_RECIPIENTS) {
    return NextResponse.json(
      { error: `Too many recipients (${users.length}). Maximum is ${MAX_RECIPIENTS}.` },
      { status: 400 }
    );
  }

  const userIds = users.map((u: Record<string, string>) => u.id);

  const { data: profiles } = await adminSupabase
    .from('profiles')
    .select('user_id, first_name, last_name')
    .in('user_id', userIds);

  const { data: authUsers } = await adminSupabase.auth.admin.listUsers({ perPage: 1000 });
  const emailMap = new Map(
    (authUsers?.users || []).map((u) => [u.id, u.email || ''])
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));

  const batchId = randomUUID();
  const isScheduled = !!body.scheduled_at;
  let sentCount = 0;
  let failedCount = 0;

  for (const user of users as Array<Record<string, string>>) {
    const email = emailMap.get(user.id);
    if (!email) continue;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const profile = profileMap.get(user.id) as any;
    const vars: Record<string, string> = {
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
      email,
      payment_status: (user.payment_status || '').replace(/_/g, ' '),
      next_step: 'Check your Samvaya dashboard for updates',
      verification_fee: PRICING.VERIFICATION_FEE_DISPLAY,
      membership_fee: PRICING.MEMBERSHIP_FEE_DISPLAY,
    };

    // Subject should not be HTML-escaped — it's plain text in email headers
    const finalSubject = emailSubject.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return key in vars ? vars[key] : match;
    });
    const finalBody = substituteVariables(emailBody, vars);

    // Wrap plain text body in simple HTML
    const htmlBody = `<!DOCTYPE html><html><body style="font-family:-apple-system,sans-serif;color:#1a1a1a;max-width:600px;margin:0 auto;padding:24px;">${finalBody.replace(/\n/g, '<br/>')}</body></html>`;

    let status: 'sent' | 'failed' | 'pending' = 'pending';

    if (!isScheduled) {
      const success = await sendEmail(email, finalSubject, htmlBody);
      status = success ? 'sent' : 'failed';
      if (success) sentCount++;
      else failedCount++;
    } else {
      sentCount++;
    }

    await adminSupabase.from('communication_log' as never).insert({
      user_id: user.id,
      sent_by: admin.id,
      channel: 'email',
      subject: finalSubject,
      body: finalBody,
      status,
      sent_at: !isScheduled && status === 'sent' ? new Date().toISOString() : null,
      batch_id: batchId,
      scheduled_at: isScheduled ? body.scheduled_at : null,
    } as never);
  }

  await logActivity(admin.id, 'bulk_email_sent', 'communication', batchId, {
    sent: sentCount,
    failed: failedCount,
    scheduled: isScheduled,
    scheduled_at: body.scheduled_at || null,
  });

  return NextResponse.json({ success: true, sent: sentCount, failed: failedCount, batch_id: batchId });
}
