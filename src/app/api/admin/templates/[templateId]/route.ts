import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, validateUserId } from '@/lib/admin/auth';
import { logActivity } from '@/lib/admin/activity';
import { createAdminClient } from '@/lib/supabase/admin';

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
    if (!body.name.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    if (body.name.length > 100) return NextResponse.json({ error: 'Name must be ≤100 characters' }, { status: 400 });
    updates.name = body.name.trim();
  }
  if (body.subject !== undefined) {
    if (!body.subject.trim()) return NextResponse.json({ error: 'Subject is required' }, { status: 400 });
    if (body.subject.length > 255) return NextResponse.json({ error: 'Subject must be ≤255 characters' }, { status: 400 });
    updates.subject = body.subject.trim();
  }
  if (body.body !== undefined) {
    if (!body.body.trim()) return NextResponse.json({ error: 'Body is required' }, { status: 400 });
    if (body.body.length > 10000) return NextResponse.json({ error: 'Body must be ≤10,000 characters' }, { status: 400 });
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
