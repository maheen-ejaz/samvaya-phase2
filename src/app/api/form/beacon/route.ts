import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Tables the beacon endpoint is allowed to write. Intentionally narrower than
// the full ALLOWED_TABLES in auto-save.ts — photos/documents/payments are never
// in the dirty queue (they have their own upload pipelines).
const ALLOWED_TABLES = new Set([
  'users',
  'profiles',
  'medical_credentials',
  'partner_preferences',
  'compatibility_profiles',
]);

/**
 * Receives dirty-field snapshots from navigator.sendBeacon() on page unload.
 * Best-effort: always returns 200 so the browser doesn't retry. Failures are
 * silent because the localStorage backup will recover them on the next session.
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Return 200 so the browser doesn't retry — localStorage is the real backup
    return NextResponse.json({ ok: false, reason: 'unauth' });
  }

  let body: { dirty?: Record<string, Record<string, unknown>> } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: true }); // malformed payload — nothing to save
  }

  if (!body.dirty || typeof body.dirty !== 'object') {
    return NextResponse.json({ ok: true });
  }

  const saves: Promise<unknown>[] = [];

  for (const [table, fields] of Object.entries(body.dirty)) {
    if (!ALLOWED_TABLES.has(table) || !fields || typeof fields !== 'object') continue;

    if (table === 'users') {
      saves.push(
        (async () => supabase.from('users').update(fields as never).eq('id', user.id))()
      );
    } else {
      saves.push(
        (async () =>
          supabase
            .from(table as 'profiles')
            .upsert({ user_id: user.id, ...fields } as never, { onConflict: 'user_id' })
        )()
      );
    }
  }

  // Best-effort — don't throw on partial failure
  await Promise.allSettled(saves);

  return NextResponse.json({ ok: true });
}
