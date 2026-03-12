import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, validateUserId } from '@/lib/admin/auth';
import { logActivity } from '@/lib/admin/activity';
import { runMatchingPipeline } from '@/lib/matching/batch';

export async function POST(request: NextRequest) {
  const result = await requireAdmin();
  if (result.error) return result.error;

  try {
    const body = await request.json().catch(() => ({}));
    const mode = (body.mode as 'all' | 'new_member') || 'all';
    const userId = body.userId as string | undefined;

    if (mode === 'new_member') {
      if (!userId) {
        return NextResponse.json(
          { error: 'userId is required for new_member mode' },
          { status: 400 }
        );
      }
      const validation = validateUserId(userId);
      if (validation) return validation;
    }

    const { preFilter, scoring } = await runMatchingPipeline(mode, userId);

    await logActivity(
      result.admin.id,
      'batch_scoring_run',
      'matching',
      result.admin.id,
      {
        mode,
        user_id: userId ?? null,
        pool_size: preFilter.total_in_pool,
        pairs_found: preFilter.pairs_after_filter,
        scored: scoring.scored,
        cached: scoring.skipped_cached,
        failed: scoring.failed,
        daily_limit_reached: scoring.daily_limit_reached,
      }
    );

    return NextResponse.json({ preFilter, scoring });
  } catch (err) {
    console.error('Batch scoring error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Batch scoring failed' },
      { status: 500 }
    );
  }
}
