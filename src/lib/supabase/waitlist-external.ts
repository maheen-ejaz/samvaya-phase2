import 'server-only';
import { createClient } from '@supabase/supabase-js';

function createWaitlistClient() {
  const url = process.env.WAITLIST_SUPABASE_URL;
  const key = process.env.WAITLIST_SUPABASE_SERVICE_ROLE_KEY;
  // Fail loudly if the feature flag is on but creds are missing — silent null
  // would hide the config error behind wrong-looking admin dashboard data.
  if (process.env.USE_LIVE_WAITLIST === 'true' && (!url || !key)) {
    throw new Error(
      'USE_LIVE_WAITLIST=true but WAITLIST_SUPABASE_URL / WAITLIST_SUPABASE_SERVICE_ROLE_KEY are not set',
    );
  }
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function fetchLiveWaitlistCount(): Promise<number | null> {
  const client = createWaitlistClient();
  if (!client) return null;
  const { count, error } = await client
    .from('waitlist')
    .select('*', { count: 'exact', head: true });
  if (error) {
    console.error('[waitlist-external] Failed to fetch waitlist count:', error.message);
    return null;
  }
  return count ?? 0;
}
