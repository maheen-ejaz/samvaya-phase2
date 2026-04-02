import { createAdminClient } from '@/lib/supabase/admin';
import { preFilterForUser, preFilterAllPairs, getPoolStats } from './pre-filter';
import { scoreCompatibility, getMatchingConfig } from './scoring';
import type { BatchScoreResult, PreFilterStats } from '@/types/matching';

/**
 * Check if a pair already has a non-stale score with the current model.
 */
async function isPairScored(
  profileAId: string,
  profileBId: string,
  modelVersion: string
): Promise<boolean> {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from('match_suggestions' as never)
    .select('id, is_stale, ai_model_version')
    .eq('profile_a_id', profileAId)
    .eq('profile_b_id', profileBId)
    .single();

  if (!data) return false;

  const row = data as { id: string; is_stale: boolean; ai_model_version: string };
  // Consider scored if same model and not stale
  return row.ai_model_version === modelVersion && !row.is_stale;
}

/**
 * Get the count of pairs scored today (for daily limit enforcement).
 */
async function getTodayScoredCount(): Promise<number> {
  const supabase = createAdminClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { count, error } = await supabase
    .from('match_suggestions' as never)
    .select('id', { count: 'exact', head: true })
    .gte('created_at', today.toISOString());

  if (error) return 0;
  return count ?? 0;
}

/**
 * Process items with concurrency control using a semaphore pattern.
 */
async function processWithConcurrency<T>(
  items: T[],
  concurrency: number,
  processor: (item: T) => Promise<void>
): Promise<void> {
  let index = 0;

  async function worker(): Promise<void> {
    while (index < items.length) {
      const currentIndex = index++;
      await processor(items[currentIndex]);
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => worker()
  );
  await Promise.all(workers);
}

/**
 * Batch score pairs from pre-filtering.
 * Respects cache, daily limits, and concurrency controls.
 */
export async function batchScorePairs(
  pairs: Array<{ userA: string; userB: string }>
): Promise<BatchScoreResult> {
  const config = await getMatchingConfig();
  const todayCount = await getTodayScoredCount();
  const remaining = Math.max(0, config.max_pairs_per_day - todayCount);

  const result: BatchScoreResult = {
    queued: pairs.length,
    scored: 0,
    skipped_cached: 0,
    skipped_below_threshold: 0,
    failed: 0,
    daily_limit_reached: false,
  };

  if (remaining === 0) {
    result.daily_limit_reached = true;
    return result;
  }

  // Filter out already-scored pairs
  const toScore: Array<{ userA: string; userB: string }> = [];
  for (const pair of pairs) {
    const cached = await isPairScored(
      pair.userA,
      pair.userB,
      config.scoring_model
    );
    if (cached) {
      result.skipped_cached++;
    } else {
      toScore.push(pair);
    }
  }

  // Enforce daily limit
  const batch = toScore.slice(0, remaining);
  if (toScore.length > remaining) {
    result.daily_limit_reached = true;
  }

  // Score with concurrency control
  await processWithConcurrency(
    batch,
    config.batch_concurrency,
    async (pair) => {
      try {
        const { belowThreshold } = await scoreCompatibility(pair.userA, pair.userB);
        if (belowThreshold) {
          result.skipped_below_threshold++;
        } else {
          result.scored++;
        }
      } catch (err) {
        console.error(
          `Failed to score pair ${pair.userA} - ${pair.userB}:`,
          err
        );
        result.failed++;
      }
    }
  );

  return result;
}

/**
 * Run the full matching pipeline.
 * 1. Pre-filter all pairs (or for a single user)
 * 2. Check cache
 * 3. Batch score
 * 4. Return stats
 */
export async function runMatchingPipeline(
  mode: 'all' | 'new_member',
  userId?: string
): Promise<{
  preFilter: PreFilterStats;
  scoring: BatchScoreResult;
}> {
  let pairs: Array<{ userA: string; userB: string }>;

  if (mode === 'new_member' && userId) {
    const candidates = await preFilterForUser(userId);
    pairs = candidates.map((candidateId) => {
      const [a, b] =
        userId < candidateId
          ? [userId, candidateId]
          : [candidateId, userId];
      return { userA: a, userB: b };
    });
  } else {
    const { pairs: allPairs } = await preFilterAllPairs();
    pairs = allPairs;
  }

  const preFilter = await getPoolStats(pairs.length);
  const scoring = await batchScorePairs(pairs);

  // Update last run timestamp in system_config
  const supabase = createAdminClient();
  await supabase
    .from('system_config' as never)
    .upsert({
      key: 'matching_last_run',
      value: {
        ran_at: new Date().toISOString(),
        mode,
        user_id: userId ?? null,
        pairs_found: pairs.length,
        scored: scoring.scored,
        cached: scoring.skipped_cached,
        failed: scoring.failed,
      },
      description: 'Last matching pipeline run metadata',
    } as never);

  return { preFilter, scoring };
}

/**
 * Mark match suggestions as stale when profiles are updated.
 * Called when a user's profile/preferences/compatibility data changes.
 */
export async function markSuggestionsStale(userId: string): Promise<void> {
  const supabase = createAdminClient();

  await supabase
    .from('match_suggestions' as never)
    .update({ is_stale: true } as never)
    .or(`profile_a_id.eq.${userId},profile_b_id.eq.${userId}`)
    .eq('admin_status', 'pending_review');
}
