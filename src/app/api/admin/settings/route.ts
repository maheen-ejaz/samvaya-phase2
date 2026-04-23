import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { logActivity } from '@/lib/admin/activity';
import { createAdminClient } from '@/lib/supabase/admin';
import { validateString } from '@/lib/validation';

// Per-key allowlist with a schema validator. Any key not listed here is rejected.
// theme_config has its own route (/api/admin/theme). Fees, sync timestamps, and
// matching_* counters are system-managed — not editable via this endpoint.
const ALLOWED_KEYS: Record<string, (v: unknown) => boolean> = {
  feature_flags: (v) => {
    if (!v || typeof v !== 'object' || Array.isArray(v)) return false;
    for (const val of Object.values(v as Record<string, unknown>)) {
      if (typeof val !== 'boolean') return false;
    }
    return true;
  },
};

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

  const { allowed } = await checkRateLimit(`admin-settings:${admin.id}`, 10, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests. Please try again in a moment.' }, { status: 429 });
  }

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

  const keyError = validateString(key, 'key', { required: true, maxLength: 100 });
  if (keyError) return NextResponse.json({ error: keyError }, { status: 400 });

  if (value === undefined || value === null) {
    return NextResponse.json({ error: 'Missing value' }, { status: 400 });
  }

  try {
    if (JSON.stringify(value).length > 10_240) {
      return NextResponse.json({ error: 'value exceeds 10KB limit' }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: 'Invalid value format' }, { status: 400 });
  }

  const validator = ALLOWED_KEYS[key];
  if (!validator) {
    return NextResponse.json(
      { error: `"${key}" cannot be modified via this endpoint.` },
      { status: 400 }
    );
  }

  if (!validator(value)) {
    return NextResponse.json(
      { error: `Invalid value for "${key}".` },
      { status: 400 }
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
