import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { logActivity } from '@/lib/admin/activity';
import { createAdminClient } from '@/lib/supabase/admin';
import { validateString } from '@/lib/validation';

const KNOWN_VARIABLES = ['first_name', 'last_name', 'email', 'payment_status', 'next_step', 'verification_fee', 'membership_fee'];

export async function GET() {
  const result = await requireAdmin();
  if (result.error) return result.error;
  const { admin } = result;

  const { allowed } = checkRateLimit(`template-read:${admin.id}`, 60, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests. Please try again in a moment.' }, { status: 429 });
  }

  const adminSupabase = createAdminClient();
  const { data, error } = await adminSupabase
    .from('email_templates' as never)
    .select('*')
    .order('name' as never);

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }

  return NextResponse.json({ templates: data });
}

export async function POST(request: NextRequest) {
  const result = await requireAdmin();
  if (result.error) return result.error;
  const { admin } = result;

  const { allowed } = checkRateLimit(`template-create:${admin.id}`, 10, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests. Please try again in a moment.' }, { status: 429 });
  }

  let body: { name?: string; subject?: string; body?: string; category?: string; variables?: string[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { name, subject, body: templateBody, category, variables } = body;

  // Validation
  const nameError = validateString(name, 'name', { required: true, maxLength: 100 });
  if (nameError) return NextResponse.json({ error: nameError }, { status: 400 });
  const subjectError = validateString(subject, 'subject', { required: true, maxLength: 255 });
  if (subjectError) return NextResponse.json({ error: subjectError }, { status: 400 });
  const bodyError = validateString(templateBody, 'body', { required: true, maxLength: 50000 });
  if (bodyError) return NextResponse.json({ error: bodyError }, { status: 400 });

  // Validate variables in body
  const usedVars = templateBody!.match(/\{\{(\w+)\}\}/g)?.map((v: string) => v.replace(/[{}]/g, '')) || [];
  const unknownVars = usedVars.filter((v: string) => !KNOWN_VARIABLES.includes(v));
  if (unknownVars.length > 0) {
    return NextResponse.json(
      { error: `Unknown variables: ${unknownVars.join(', ')}. Allowed: ${KNOWN_VARIABLES.join(', ')}` },
      { status: 400 }
    );
  }

  const adminSupabase = createAdminClient();
  const { data, error } = await adminSupabase
    .from('email_templates' as never)
    .insert({
      name,
      subject,
      body: templateBody,
      category: category || 'general',
      variables: variables || usedVars,
      created_by: admin.id,
    } as never)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'A template with this name already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
  }

  await logActivity(admin.id, 'created_email_template', 'email_template', (data as Record<string, string>).id, { name });

  return NextResponse.json({ template: data }, { status: 201 });
}
