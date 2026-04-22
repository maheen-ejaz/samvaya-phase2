import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, validateUserId } from '@/lib/admin/auth';
import { logActivity } from '@/lib/admin/activity';
import { scoreCompatibility } from '@/lib/matching/scoring';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const result = await requireAdmin();
  if (result.error) return result.error;

  // Rate limit: 10 scoring requests per minute per admin
  const rateCheck = checkRateLimit(`scoring:${result.admin.id}`, 10, 60_000);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Max 10 scoring requests per minute.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { userAId, userBId } = body;

    if (!userAId || !userBId) {
      return NextResponse.json(
        { error: 'userAId and userBId are required' },
        { status: 400 }
      );
    }

    const validationA = validateUserId(userAId);
    if (validationA) return validationA;
    const validationB = validateUserId(userBId);
    if (validationB) return validationB;

    if (userAId === userBId) {
      return NextResponse.json(
        { error: 'Cannot score a user against themselves' },
        { status: 400 }
      );
    }

    const { suggestion, report, belowThreshold } = await scoreCompatibility(userAId, userBId);

    if (belowThreshold || !suggestion) {
      await logActivity(
        result.admin.id,
        'compatibility_scored_below_threshold',
        'matching',
        userAId,
        {
          profile_a_id: userAId < userBId ? userAId : userBId,
          profile_b_id: userAId < userBId ? userBId : userAId,
          overall_score: report.overall_score,
          recommendation: report.recommendation,
        }
      );

      return NextResponse.json({
        suggestion: null,
        report,
        belowThreshold: true,
        message: `Score ${report.overall_score} is below minimum threshold. Suggestion not saved.`,
      });
    }

    await logActivity(
      result.admin.id,
      'compatibility_scored',
      'match_suggestion',
      suggestion.id,
      {
        profile_a_id: suggestion.profile_a_id,
        profile_b_id: suggestion.profile_b_id,
        overall_score: report.overall_score,
        recommendation: report.recommendation,
        model: suggestion.ai_model_version,
      }
    );

    return NextResponse.json({ suggestion, report });
  } catch (err) {
    console.error('Scoring error:', err);
    return NextResponse.json(
      { error: 'Scoring failed' },
      { status: 500 }
    );
  }
}
