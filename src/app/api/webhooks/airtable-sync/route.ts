import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual, createHmac } from 'crypto';
import { syncSingleUser } from '@/lib/airtable/sync';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Webhook endpoint for Supabase database webhooks.
 * Receives INSERT/UPDATE events on relevant tables and syncs to Airtable.
 * Validates via AIRTABLE_WEBHOOK_SECRET.
 */
export async function POST(request: NextRequest) {
  // Validate webhook secret
  const secret = request.headers.get('x-webhook-secret');
  const expectedSecret = process.env.AIRTABLE_WEBHOOK_SECRET;

  if (!expectedSecret || !secret) {
    return NextResponse.json({ error: 'Invalid webhook secret' }, { status: 401 });
  }
  // Use HMAC-based comparison to avoid timing oracle from length differences
  const key = 'samvaya-webhook-verify';
  const a = createHmac('sha256', key).update(secret).digest();
  const b = createHmac('sha256', key).update(expectedSecret).digest();
  if (!timingSafeEqual(a, b)) {
    return NextResponse.json({ error: 'Invalid webhook secret' }, { status: 401 });
  }

  // Check if sync is enabled
  const adminSupabase = createAdminClient();
  const { data: flagConfig } = await adminSupabase
    .from('system_config' as never)
    .select('value' as never)
    .eq('key' as never, 'feature_flags')
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const flags = flagConfig ? (flagConfig as any).value : {};
  if (!flags.airtable_sync_enabled) {
    return NextResponse.json({ skipped: true, reason: 'Airtable sync disabled' });
  }

  let payload: {
    type?: string;
    table?: string;
    record?: Record<string, unknown>;
    old_record?: Record<string, unknown>;
  };

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Extract user_id from the payload
  const record = payload.record || {};
  const userId = (record.user_id as string) || (record.id as string);

  if (!userId) {
    return NextResponse.json({ error: 'No user_id in payload' }, { status: 400 });
  }

  try {
    await syncSingleUser(userId);
    return NextResponse.json({ success: true, user_id: userId });
  } catch (err) {
    console.error('Webhook sync failed:', err);
    return NextResponse.json(
      { error: 'Sync failed' },
      { status: 500 }
    );
  }
}
