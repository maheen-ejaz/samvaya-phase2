import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, validateUserId } from '@/lib/admin/auth';
import { logActivity } from '@/lib/admin/activity';
import { createAdminClient } from '@/lib/supabase/admin';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ presentationId: string }> }
) {
  const result = await requireAdmin();
  if (result.error) return result.error;

  const { allowed } = await checkRateLimit(`feedback-submit:${result.admin.id}`, 20, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests. Please try again in a moment.' }, { status: 429 });
  }

  const { presentationId } = await params;
  const validation = validateUserId(presentationId);
  if (validation) return validation;

  try {
    const body = await request.json();
    const {
      userId,
      response,
      rating,
      feedbackText,
      whatWorked,
      whatDidntWork,
      wouldLikeMoreLikeThis,
      specificConcern,
    } = body;

    if (!userId || !response) {
      return NextResponse.json(
        { error: 'userId and response are required' },
        { status: 400 }
      );
    }

    if (feedbackText && feedbackText.length > 2_000) {
      return NextResponse.json(
        { error: 'Feedback text exceeds 2,000 character limit' },
        { status: 400 }
      );
    }

    if (specificConcern && specificConcern.length > 500) {
      return NextResponse.json(
        { error: 'Specific concern exceeds 500 character limit' },
        { status: 400 }
      );
    }

    const userValidation = validateUserId(userId);
    if (userValidation) return userValidation;

    if (response !== 'interested' && response !== 'not_interested') {
      return NextResponse.json(
        { error: 'response must be "interested" or "not_interested"' },
        { status: 400 }
      );
    }

    if (rating !== undefined && (typeof rating !== 'number' || rating < 1 || rating > 5)) {
      return NextResponse.json(
        { error: 'rating must be 1-5' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Verify presentation exists and user is part of it
    const { data: presentation, error: fetchError } = await supabase
      .from('match_presentations' as never)
      .select('id, match_suggestions!inner(profile_a_id, profile_b_id)')
      .eq('id', presentationId)
      .single();

    if (fetchError || !presentation) {
      return NextResponse.json(
        { error: 'Match presentation not found' },
        { status: 404 }
      );
    }

    const s = (presentation as Record<string, unknown>).match_suggestions as Record<string, unknown>;
    if (userId !== s.profile_a_id && userId !== s.profile_b_id) {
      return NextResponse.json(
        { error: 'User is not part of this match presentation' },
        { status: 400 }
      );
    }

    const { data: feedback, error: insertError } = await supabase
      .from('match_feedback' as never)
      .insert({
        match_presentation_id: presentationId,
        user_id: userId,
        response,
        feedback_rating: rating ?? null,
        feedback_text: feedbackText?.trim() || null,
        what_worked: whatWorked ?? [],
        what_didnt_work: whatDidntWork ?? [],
        would_like_more_like_this: wouldLikeMoreLikeThis ?? null,
        specific_concern: specificConcern?.trim() || null,
      } as never)
      .select()
      .single();

    if (insertError) {
      if (insertError.code === '23505') {
        return NextResponse.json(
          { error: 'Feedback already submitted for this user on this presentation' },
          { status: 409 }
        );
      }
      console.error('Failed to submit feedback:', insertError);
      return NextResponse.json(
        { error: 'Failed to submit feedback' },
        { status: 500 }
      );
    }

    await logActivity(
      result.admin.id,
      'match_feedback_recorded',
      'match_feedback',
      (feedback as Record<string, unknown>).id as string,
      {
        presentation_id: presentationId,
        user_id: userId,
        response,
        rating: rating ?? null,
      }
    );

    return NextResponse.json({ success: true, feedback });
  } catch (err) {
    console.error('Submit feedback error:', err);
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}
