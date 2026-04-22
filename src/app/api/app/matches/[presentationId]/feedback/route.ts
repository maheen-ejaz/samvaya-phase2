import { NextRequest, NextResponse } from 'next/server';
import { requireApplicant } from '@/lib/app/auth';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { isValidUUID } from '@/lib/validation';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ presentationId: string }> }
) {
  const result = await requireApplicant();
  if (result.error) return result.error;

  const userId = result.user.id;

  const { allowed } = await checkRateLimit(`match-feedback:${userId}`, 10, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests. Please try again in a moment.' }, { status: 429 });
  }

  const { presentationId } = await params;

  if (!isValidUUID(presentationId)) {
    return NextResponse.json({ error: 'Invalid presentation ID format' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const {
      rating,
      whatWorked,
      whatDidntWork,
      wouldLikeMoreLikeThis,
      specificConcern,
    } = body;

    // Validate rating
    if (rating !== undefined && (typeof rating !== 'number' || rating < 1 || rating > 5)) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Validate array fields
    if (Array.isArray(whatWorked) && (whatWorked.length > 20 || whatWorked.some((w: unknown) => typeof w !== 'string' || w.length > 200))) {
      return NextResponse.json(
        { error: 'whatWorked must be at most 20 items, each under 200 chars' },
        { status: 400 }
      );
    }
    if (Array.isArray(whatDidntWork) && (whatDidntWork.length > 20 || whatDidntWork.some((w: unknown) => typeof w !== 'string' || w.length > 200))) {
      return NextResponse.json(
        { error: 'whatDidntWork must be at most 20 items, each under 200 chars' },
        { status: 400 }
      );
    }

    if (whatWorked !== undefined && whatWorked !== null && !Array.isArray(whatWorked)) {
      return NextResponse.json({ error: 'whatWorked must be an array' }, { status: 400 });
    }
    if (whatDidntWork !== undefined && whatDidntWork !== null && !Array.isArray(whatDidntWork)) {
      return NextResponse.json({ error: 'whatDidntWork must be an array' }, { status: 400 });
    }

    // Use user's own session — RLS INSERT policy exists for match_feedback
    const supabase = await createClient();

    // Verify user is part of this match and has responded
    const { data: presentation } = await supabase
      .from('match_presentations' as never)
      .select('id, member_a_response, member_b_response, match_suggestions!inner(profile_a_id, profile_b_id)')
      .eq('id', presentationId)
      .single();

    if (!presentation) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      );
    }

    const p = presentation as Record<string, unknown>;
    const s = p.match_suggestions as Record<string, unknown>;

    const isA = s.profile_a_id === userId;
    const isB = s.profile_b_id === userId;
    if (!isA && !isB) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      );
    }

    const myResponse = isA ? p.member_a_response : p.member_b_response;
    if (myResponse === 'pending') {
      return NextResponse.json(
        { error: 'You must respond to the match before leaving feedback' },
        { status: 400 }
      );
    }

    // Check for existing feedback
    const { data: existing } = await supabase
      .from('match_feedback' as never)
      .select('id')
      .eq('match_presentation_id', presentationId)
      .eq('user_id', userId)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Feedback already submitted for this match' },
        { status: 409 }
      );
    }

    const { error: insertError } = await supabase
      .from('match_feedback' as never)
      .insert({
        match_presentation_id: presentationId,
        user_id: userId,
        response: myResponse,
        feedback_rating: rating ?? null,
        what_worked: whatWorked ?? [],
        what_didnt_work: whatDidntWork ?? [],
        would_like_more_like_this: wouldLikeMoreLikeThis ?? null,
        specific_concern: specificConcern?.slice(0, 500) ?? null,
      } as never);

    if (insertError) {
      console.error('Feedback insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to submit feedback' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Feedback error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
