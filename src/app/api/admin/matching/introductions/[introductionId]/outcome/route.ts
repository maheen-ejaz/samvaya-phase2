import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, validateUserId } from '@/lib/admin/auth';
import { logActivity } from '@/lib/admin/activity';
import { createAdminClient } from '@/lib/supabase/admin';

const VALID_OUTCOMES = ['want_to_continue', 'not_a_match', 'need_more_time'];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ introductionId: string }> }
) {
  const result = await requireAdmin();
  if (result.error) return result.error;

  const { introductionId } = await params;
  const validation = validateUserId(introductionId);
  if (validation) return validation;

  try {
    const body = await request.json();
    const { outcomeMemberA, outcomeMemberB, teamFeedbackNotes } = body;

    if (!outcomeMemberA || !outcomeMemberB) {
      return NextResponse.json(
        { error: 'outcomeMemberA and outcomeMemberB are required' },
        { status: 400 }
      );
    }

    if (!VALID_OUTCOMES.includes(outcomeMemberA) || !VALID_OUTCOMES.includes(outcomeMemberB)) {
      return NextResponse.json(
        { error: `Outcomes must be one of: ${VALID_OUTCOMES.join(', ')}` },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Verify introduction exists and is scheduled/rescheduled
    const { data: intro, error: fetchError } = await supabase
      .from('introductions' as never)
      .select('id, status')
      .eq('id', introductionId)
      .single();

    if (fetchError || !intro) {
      return NextResponse.json(
        { error: 'Introduction not found' },
        { status: 404 }
      );
    }

    const introStatus = (intro as Record<string, unknown>).status;
    if (introStatus !== 'scheduled' && introStatus !== 'rescheduled') {
      return NextResponse.json(
        { error: `Cannot record outcome for introduction with status: ${introStatus}` },
        { status: 409 }
      );
    }

    const { data, error } = await supabase
      .from('introductions' as never)
      .update({
        status: 'completed',
        outcome_member_a: outcomeMemberA,
        outcome_member_b: outcomeMemberB,
        team_feedback_notes: teamFeedbackNotes?.trim() || null,
      } as never)
      .eq('id', introductionId)
      .select()
      .single();

    if (error) {
      console.error('Failed to record outcome:', error);
      return NextResponse.json(
        { error: 'Failed to record outcome' },
        { status: 500 }
      );
    }

    await logActivity(
      result.admin.id,
      'introduction_outcome_recorded',
      'introduction',
      introductionId,
      {
        outcome_member_a: outcomeMemberA,
        outcome_member_b: outcomeMemberB,
      }
    );

    return NextResponse.json({ success: true, introduction: data });
  } catch (err) {
    console.error('Record outcome error:', err);
    return NextResponse.json(
      { error: 'Failed to record outcome' },
      { status: 500 }
    );
  }
}
