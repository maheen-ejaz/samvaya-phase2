import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';
import { logActivity } from '@/lib/admin/activity';
import { createAdminClient } from '@/lib/supabase/admin';

const KNOWN_VARIABLES = ['first_name', 'last_name', 'email', 'payment_status', 'next_step', 'verification_fee', 'membership_fee'];

export async function GET() {
  const result = await requireAdmin();
  if (result.error) return result.error;

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

  let body: { name?: string; subject?: string; body?: string; category?: string; variables?: string[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { name, subject, body: templateBody, category, variables } = body;

  // Validation
  if (!name || name.length > 100) {
    return NextResponse.json({ error: 'Name is required and must be ≤100 characters' }, { status: 400 });
  }
  if (!subject || subject.length > 255) {
    return NextResponse.json({ error: 'Subject is required and must be ≤255 characters' }, { status: 400 });
  }
  if (!templateBody || templateBody.length > 10000) {
    return NextResponse.json({ error: 'Body is required and must be ≤10,000 characters' }, { status: 400 });
  }

  // Validate variables in body
  const usedVars = templateBody.match(/\{\{(\w+)\}\}/g)?.map((v: string) => v.replace(/[{}]/g, '')) || [];
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
