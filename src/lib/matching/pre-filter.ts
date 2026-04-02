import { createAdminClient } from '@/lib/supabase/admin';
import type { PreFilterStats } from '@/types/matching';

/**
 * Run pre-filtering for a single user against all pool members.
 * Calls the Postgres RPC function `get_prefiltered_candidates`.
 */
export async function preFilterForUser(userId: string): Promise<string[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase.rpc(
    'get_prefiltered_candidates' as never,
    { target_user_id: userId } as never
  );

  if (error) {
    throw new Error(`Pre-filter failed for user ${userId}: ${error.message}`);
  }

  return (data as unknown as Array<{ candidate_id: string }>).map(
    (row) => row.candidate_id
  );
}

/**
 * Run pre-filtering for all pool members and return deduplicated pairs.
 * Pairs are canonical: profile_a_id < profile_b_id (UUID string comparison).
 */
export async function preFilterAllPairs(): Promise<{
  pairs: Array<{ userA: string; userB: string }>;
  userErrors: number;
}> {
  const supabase = createAdminClient();

  // Get all users in the pool
  const { data: poolUsers, error: poolError } = await supabase
    .from('users')
    .select('id')
    .eq('is_bgv_complete', true)
    .in('payment_status', ['in_pool', 'match_presented'])
    .eq('is_paused', false);

  if (poolError) {
    throw new Error(`Failed to fetch pool users: ${poolError.message}`);
  }

  if (!poolUsers || poolUsers.length === 0) {
    return { pairs: [], userErrors: 0 };
  }

  // Run pre-filter for each pool user — isolate failures per user
  const pairSet = new Set<string>();
  const pairs: Array<{ userA: string; userB: string }> = [];
  let userErrors = 0;

  for (const user of poolUsers) {
    try {
      const candidates = await preFilterForUser(user.id);
      for (const candidateId of candidates) {
        // Canonical ordering
        const [a, b] =
          user.id < candidateId
            ? [user.id, candidateId]
            : [candidateId, user.id];
        const key = `${a}:${b}`;
        if (!pairSet.has(key)) {
          pairSet.add(key);
          pairs.push({ userA: a, userB: b });
        }
      }
    } catch (err) {
      console.error(`Pre-filter failed for user ${user.id}, skipping:`, err);
      userErrors++;
    }
  }

  return { pairs, userErrors };
}

/**
 * Get pool statistics for the admin dashboard.
 */
export async function getPoolStats(
  filteredPairCount?: number
): Promise<PreFilterStats> {
  const supabase = createAdminClient();

  const { count, error } = await supabase
    .from('users')
    .select('id', { count: 'exact', head: true })
    .eq('is_bgv_complete', true)
    .in('payment_status', ['in_pool', 'match_presented'])
    .eq('is_paused', false);

  if (error) {
    throw new Error(`Failed to get pool stats: ${error.message}`);
  }

  const totalInPool = count ?? 0;
  // Maximum possible pairs = n*(n-1)/2
  const maxPairs = (totalInPool * (totalInPool - 1)) / 2;
  const pairsAfterFilter = filteredPairCount ?? 0;
  const reductionPct =
    maxPairs > 0
      ? Math.round(((maxPairs - pairsAfterFilter) / maxPairs) * 100)
      : 0;

  return {
    total_in_pool: totalInPool,
    pairs_after_filter: pairsAfterFilter,
    reduction_pct: reductionPct,
  };
}
