import { NextRequest, NextResponse } from 'next/server';
import { requireApplicant } from '@/lib/app/auth';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/rate-limit';

export async function GET() {
  const result = await requireApplicant();
  if (result.error) return result.error;

  const userId = result.user.id;

  const { allowed } = checkRateLimit(`settings-read:${userId}`, 60, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests. Please try again in a moment.' }, { status: 429 });
  }

  const supabase = await createClient();

  // Fetch pause status
  const { data: user } = await supabase
    .from('users')
    .select('is_paused, paused_at')
    .eq('id', userId)
    .single();

  // Fetch notification preferences (create default if doesn't exist)
  let { data: prefs } = await supabase
    .from('notification_preferences' as never)
    .select('*')
    .eq('user_id', userId)
    .single();

  if (!prefs) {
    const { data: newPrefs } = await supabase
      .from('notification_preferences' as never)
      .insert({ user_id: userId } as never)
      .select()
      .single();
    prefs = newPrefs;
  }

  return NextResponse.json({
    isPaused: (user as Record<string, unknown> | null)?.is_paused ?? false,
    pausedAt: (user as Record<string, unknown> | null)?.paused_at ?? null,
    notificationPreferences: prefs ?? {
      email_new_match: true,
      email_match_response: true,
      email_status_update: true,
      email_promotions: false,
      push_new_match: true,
      push_match_response: true,
      push_status_update: true,
    },
  });
}

export async function PATCH(request: NextRequest) {
  const result = await requireApplicant();
  if (result.error) return result.error;

  const userId = result.user.id;

  const { allowed } = checkRateLimit(`settings-update:${userId}`, 20, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests. Please try again in a moment.' }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const supabase = await createClient();

  // Handle pause toggle (is_paused column added in migration 20260327000005)
  if (typeof body.isPaused === 'boolean') {
    const { error } = await supabase
      .from('users')
      .update({
        is_paused: body.isPaused,
        paused_at: body.isPaused ? new Date().toISOString() : null,
      } as never)
      .eq('id', userId);

    if (error) {
      return NextResponse.json({ error: 'Failed to update pause status' }, { status: 500 });
    }
  }

  // Handle notification preferences update
  if (body.notificationPreferences && typeof body.notificationPreferences === 'object') {
    const allowedFields = new Set([
      'email_new_match',
      'email_match_response',
      'email_status_update',
      'email_promotions',
      'push_new_match',
      'push_match_response',
      'push_status_update',
    ]);

    const updates: Record<string, boolean> = {};
    for (const [key, value] of Object.entries(body.notificationPreferences)) {
      if (allowedFields.has(key) && typeof value === 'boolean') {
        updates[key] = value;
      }
    }

    if (Object.keys(updates).length > 0) {
      // Upsert: update if exists, insert if not
      const { data: existing } = await supabase
        .from('notification_preferences' as never)
        .select('id')
        .eq('user_id', userId)
        .single();

      if (existing) {
        const { error } = await supabase
          .from('notification_preferences' as never)
          .update(updates as never)
          .eq('user_id', userId);
        if (error) {
          return NextResponse.json({ error: 'Failed to update notification preferences' }, { status: 500 });
        }
      } else {
        const { error } = await supabase
          .from('notification_preferences' as never)
          .insert({ user_id: userId, ...updates } as never);
        if (error) {
          return NextResponse.json({ error: 'Failed to create notification preferences' }, { status: 500 });
        }
      }
    }
  }

  return NextResponse.json({ success: true });
}
