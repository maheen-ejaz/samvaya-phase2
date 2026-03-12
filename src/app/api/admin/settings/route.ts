import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';
import { logActivity } from '@/lib/admin/activity';
import { createAdminClient } from '@/lib/supabase/admin';

const LOCKED_KEYS = ['verification_fee', 'membership_fee'];

export async function GET() {
  const result = await requireAdmin();
  if (result.error) return result.error;

  const adminSupabase = createAdminClient();
  const { data, error } = await adminSupabase
    .from('system_config' as never)
    .select('*')
    .order('key' as never);

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 });
  }

  return NextResponse.json({ config: data });
}

export async function PATCH(request: NextRequest) {
  const result = await requireAdmin();
  if (result.error) return result.error;
  const { admin } = result;

  let body: { key?: string; value?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { key, value } = body;

  if (!key || typeof key !== 'string') {
    return NextResponse.json({ error: 'Missing or invalid key' }, { status: 400 });
  }

  if (value === undefined || value === null) {
    return NextResponse.json({ error: 'Missing value' }, { status: 400 });
  }

  if (LOCKED_KEYS.includes(key)) {
    return NextResponse.json(
      { error: `"${key}" is locked and cannot be modified via the API.` },
      { status: 403 }
    );
  }

  const adminSupabase = createAdminClient();

  // Fetch old value for activity log
  const { data: oldRow } = await adminSupabase
    .from('system_config' as never)
    .select('value' as never)
    .eq('key' as never, key)
    .single();

  const { error: updateError } = await adminSupabase
    .from('system_config' as never)
    .update({
      value,
      updated_by: admin.id,
      updated_at: new Date().toISOString(),
    } as never)
    .eq('key' as never, key);

  if (updateError) {
    return NextResponse.json({ error: 'Failed to update config' }, { status: 500 });
  }

  await logActivity(admin.id, 'updated_system_config', 'system_config', key, {
    old_value: oldRow ? (oldRow as Record<string, unknown>).value : undefined,
    new_value: value,
  });

  return NextResponse.json({ success: true });
}
