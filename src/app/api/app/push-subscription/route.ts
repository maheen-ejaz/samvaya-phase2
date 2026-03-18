import { NextRequest, NextResponse } from 'next/server';
import { requireApplicant } from '@/lib/app/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const result = await requireApplicant();
  if (result.error) return result.error;

  const userId = result.user.id;

  const { allowed } = checkRateLimit(`push-sub:${userId}`, 10, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests. Please try again in a moment.' }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.endpoint || !(body.keys as Record<string, unknown>)?.p256dh || !(body.keys as Record<string, unknown>)?.auth) {
    return NextResponse.json({ error: 'Invalid subscription data' }, { status: 400 });
  }

  // Validate field lengths
  const endpoint = body.endpoint as string;
  const keys = body.keys as Record<string, string>;
  if (typeof endpoint !== 'string' || endpoint.length > 2048) {
    return NextResponse.json({ error: 'Endpoint URL too long (max 2048 chars)' }, { status: 400 });
  }
  if (typeof keys.p256dh !== 'string' || keys.p256dh.length > 512 || typeof keys.auth !== 'string' || keys.auth.length > 512) {
    return NextResponse.json({ error: 'Invalid key data' }, { status: 400 });
  }

  try {
    const url = new URL(endpoint);
    if (url.protocol !== 'https:') {
      return NextResponse.json({ error: 'Endpoint must use HTTPS' }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: 'Invalid endpoint URL' }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Upsert subscription (replace if same endpoint exists)
  const { error } = await supabase
    .from('push_subscriptions' as never)
    .upsert(
      {
        user_id: userId,
        endpoint: body.endpoint,
        p256dh: (body.keys as Record<string, unknown>).p256dh,
        auth: (body.keys as Record<string, unknown>).auth,
      } as never,
      { onConflict: 'user_id,endpoint' }
    );

  if (error) {
    return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const result = await requireApplicant();
  if (result.error) return result.error;

  const userId = result.user.id;

  const { allowed } = checkRateLimit(`push-sub:${userId}`, 10, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests. Please try again in a moment.' }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.endpoint) {
    return NextResponse.json({ error: 'Missing endpoint' }, { status: 400 });
  }

  const endpoint = body.endpoint;
  if (typeof endpoint !== 'string' || endpoint.length > 2048) {
    return NextResponse.json({ error: 'Invalid endpoint' }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { error } = await supabase
    .from('push_subscriptions' as never)
    .delete()
    .eq('user_id', userId)
    .eq('endpoint', body.endpoint);

  if (error) {
    return NextResponse.json({ error: 'Failed to remove subscription' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
