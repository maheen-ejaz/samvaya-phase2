import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, validateUserId } from '@/lib/admin/auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { logActivity } from '@/lib/admin/activity';
import { createAdminClient } from '@/lib/supabase/admin';
import { validateString } from '@/lib/validation';

const KNOWN_VARIABLES = ['first_name', 'last_name', 'email', 'payment_status', 'next_step', 'verification_fee', 'membership_fee'];

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ templateId: string }> }
) {
  const result = await requireAdmin();
  if (result.error) return result.error;

  const { templateId } = await params;
  const idError = validateUserId(templateId);
  if (idError) return idError;

  const adminSupabase = createAdminClient();
  const { data, error } = await adminSupabase
    .from('email_templates' as never)
    .select('*')
    .eq('id' as never, templateId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Template not found' }, { status: 404 });
  }

  return NextResponse.json({ template: data });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ templateId: string }> }
) {
  const result = await requireAdmin();
  if (result.error) return result.error;
  const { admin } = result;

  const { allowed } = await checkRateLimit(`template-edit:${admin.id}`, 20, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests. Please try again in a moment.' }, { status: 429 });
  }

  const { templateId } = await params;
  const idError = validateUserId(templateId);
  if (idError) return idError;

  let body: { name?: string; subject?: string; body?: string; category?: string; variables?: string[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};

  if (body.name !== undefined) {
    const nameError = validateString(body.name, 'name', { required: true, maxLength: 100 });
    if (nameError) return NextResponse.json({ error: nameError }, { status: 400 });
    updates.name = body.name.trim();
  }
  if (body.subject !== undefined) {
    const subjectError = validateString(body.subject, 'subject', { required: true, maxLength: 255 });
    if (subjectError) return NextResponse.json({ error: subjectError }, { status: 400 });
    updates.subject = body.subject.trim();
  }
  if (body.body !== undefined) {
    const bodyError = validateString(body.body, 'body', { required: true, maxLength: 50000 });
    if (bodyError) return NextResponse.json({ error: bodyError }, { status: 400 });
    // Validate variables
    const usedVars = body.body.match(/\{\{(\w+)\}\}/g)?.map((v: string) => v.replace(/[{}]/g, '')) || [];
    const unknownVars = usedVars.filter((v: string) => !KNOWN_VARIABLES.includes(v));
    if (unknownVars.length > 0) {
      return NextResponse.json(
        { error: `Unknown variables: ${unknownVars.join(', ')}` },
        { status: 400 }
      );
    }
    updates.body = body.body;
    updates.variables = body.variables || usedVars;
  }
  if (body.category !== undefined) {
    updates.category = body.category;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }

  const adminSupabase = createAdminClient();
  const { data, error } = await adminSupabase
    .from('email_templates' as never)
    .update(updates as never)
    .eq('id' as never, templateId)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'A template with this name already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to update template' }, { status: 500 });
  }

  await logActivity(admin.id, 'updated_email_template', 'email_template', templateId, { updates: Object.keys(updates) });

  return NextResponse.json({ template: data });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ templateId: string }> }
) {
  const result = await requireAdmin();
  if (result.error) return result.error;
  const { admin } = result;

  const { allowed } = await checkRateLimit(`template-edit:${admin.id}`, 20, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests. Please try again in a moment.' }, { status: 429 });
  }

  const { templateId } = await params;
  const idError = validateUserId(templateId);
  if (idError) return idError;

  const adminSupabase = createAdminClient();

  // Fetch name for activity log
  const { data: existing } = await adminSupabase
    .from('email_templates' as never)
    .select('name' as never)
    .eq('id' as never, templateId)
    .single();

  const { error } = await adminSupabase
    .from('email_templates' as never)
    .delete()
    .eq('id' as never, templateId);

  if (error) {
    return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 });
  }

  await logActivity(admin.id, 'deleted_email_template', 'email_template', templateId, {
    name: existing ? (existing as Record<string, string>).name : 'Unknown',
  });

  return NextResponse.json({ success: true });
}
