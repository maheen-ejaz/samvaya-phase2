import { NextRequest, NextResponse } from 'next/server';
import { requireApplicant } from '@/lib/app/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  const result = await requireApplicant();
  if (result.error) return result.error;

  const userId = result.user.id;
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.endpoint || !(body.keys as Record<string, unknown>)?.p256dh || !(body.keys as Record<string, unknown>)?.auth) {
    return NextResponse.json({ error: 'Invalid subscription data' }, { status: 400 });
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
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.endpoint) {
    return NextResponse.json({ error: 'Missing endpoint' }, { status: 400 });
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
