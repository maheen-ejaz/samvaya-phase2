import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { logActivity } from '@/lib/admin/activity';
import { createAdminClient } from '@/lib/supabase/admin';
import { fullSync } from '@/lib/airtable/sync';

export async function GET() {
  const result = await requireAdmin();
  if (result.error) return result.error;

  const adminSupabase = createAdminClient();
  const { data } = await adminSupabase
    .from('system_config' as never)
    .select('value' as never)
    .eq('key' as never, 'airtable_last_sync')
    .single();

  return NextResponse.json({
    last_sync: data ? (data as Record<string, unknown>).value : null,
  });
}

export async function POST() {
  const result = await requireAdmin();
  if (result.error) return result.error;
  const { admin } = result;

  const { allowed } = await checkRateLimit(`airtable-sync:${admin.id}`, 3, 3_600_000);
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests. Please try again in a moment.' }, { status: 429 });
  }

  try {
    const syncResult = await fullSync();

    // Update last sync timestamp
    const adminSupabase = createAdminClient();
    await adminSupabase
      .from('system_config' as never)
      .update({
        value: {
          synced_at: new Date().toISOString(),
          status: 'success',
          records_synced: syncResult.total,
          breakdown: {
            applicants: syncResult.applicants,
            credentials: syncResult.credentials,
            preferences: syncResult.preferences,
            bgv: syncResult.bgv,
          },
        },
        updated_by: admin.id,
        updated_at: new Date().toISOString(),
      } as never)
      .eq('key' as never, 'airtable_last_sync');

    await logActivity(admin.id, 'airtable_full_sync', 'system', 'airtable', {
      records_synced: syncResult.total,
    });

    return NextResponse.json({
      success: true,
      records_synced: syncResult.total,
      breakdown: syncResult,
    });
  } catch (err) {
    console.error('Airtable sync failed:', err);

    // Update sync status to failed
    const adminSupabase = createAdminClient();
    await adminSupabase
      .from('system_config' as never)
      .update({
        value: {
          synced_at: new Date().toISOString(),
          status: 'failed',
          error: 'Sync failed',
        },
      } as never)
      .eq('key' as never, 'airtable_last_sync');

    return NextResponse.json(
      { error: 'Sync failed' },
      { status: 500 }
    );
  }
}
