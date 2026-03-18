import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, validateUserId } from '@/lib/admin/auth';
import { logActivity } from '@/lib/admin/activity';
import { checkRateLimit } from '@/lib/rate-limit';
import {
  preFilterForUser,
  preFilterAllPairs,
  getPoolStats,
} from '@/lib/matching/pre-filter';

export async function POST(request: NextRequest) {
  const result = await requireAdmin();
  if (result.error) return result.error;

  const { allowed } = checkRateLimit(`pre-filter:${result.admin.id}`, 10, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests. Please try again in a moment.' }, { status: 429 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const userId = body.userId as string | undefined;

    let pairs: Array<{ userA: string; userB: string }>;

    if (userId) {
      const validation = validateUserId(userId);
      if (validation) return validation;

      const candidates = await preFilterForUser(userId);
      pairs = candidates.map((candidateId) => {
        const [a, b] =
          userId < candidateId
            ? [userId, candidateId]
            : [candidateId, userId];
        return { userA: a, userB: b };
      });
    } else {
      pairs = await preFilterAllPairs();
    }

    const stats = await getPoolStats(pairs.length);

    await logActivity(
      result.admin.id,
      'pre_filter_run',
      'matching',
      result.admin.id,
      {
        mode: userId ? 'single_user' : 'all',
        user_id: userId ?? null,
        total_in_pool: stats.total_in_pool,
        pairs_found: stats.pairs_after_filter,
        reduction_pct: stats.reduction_pct,
      }
    );

    return NextResponse.json({ pairs, stats });
  } catch (err) {
    console.error('Pre-filter error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Pre-filter failed' },
      { status: 500 }
    );
  }
}
