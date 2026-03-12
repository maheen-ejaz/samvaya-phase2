import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, validateUserId } from '@/lib/admin/auth';
import { logActivity } from '@/lib/admin/activity';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ presentationId: string }> }
) {
  const result = await requireAdmin();
  if (result.error) return result.error;

  const { presentationId } = await params;
  const validation = validateUserId(presentationId);
  if (validation) return validation;

  try {
    const body = await request.json();
    const { memberId, response } = body;

    if (!memberId || !response) {
      return NextResponse.json(
        { error: 'memberId and response are required' },
        { status: 400 }
      );
    }

    const memberValidation = validateUserId(memberId);
    if (memberValidation) return memberValidation;

    if (response !== 'interested' && response !== 'not_interested') {
      return NextResponse.json(
        { error: 'response must be "interested" or "not_interested"' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Fetch presentation with suggestion data
    const { data: presentation, error: fetchError } = await supabase
      .from('match_presentations' as never)
      .select('*, match_suggestions!inner(*)')
      .eq('id', presentationId)
      .single();

    if (fetchError || !presentation) {
      return NextResponse.json(
        { error: 'Match presentation not found' },
        { status: 404 }
      );
    }

    const p = presentation as Record<string, unknown>;
    const s = p.match_suggestions as Record<string, unknown>;

    if (p.status !== 'pending') {
      return NextResponse.json(
        { error: `Presentation is already ${p.status}` },
        { status: 409 }
      );
    }

    // Check if presentation has expired
    if (p.expires_at && new Date(p.expires_at as string) < new Date()) {
      await supabase
        .from('match_presentations' as never)
        .update({
          status: 'expired',
          ...(p.member_a_response === 'pending' && { member_a_response: 'expired' }),
          ...(p.member_b_response === 'pending' && { member_b_response: 'expired' }),
        } as never)
        .eq('id', presentationId);

      return NextResponse.json(
        { error: 'This presentation has expired' },
        { status: 410 }
      );
    }

    // Determine which member this is (A or B)
    const isA = memberId === s.profile_a_id;
    const isB = memberId === s.profile_b_id;

    if (!isA && !isB) {
      return NextResponse.json(
        { error: 'memberId does not belong to this match presentation' },
        { status: 400 }
      );
    }

    // Build update
    const now = new Date().toISOString();
    const update: Record<string, unknown> = {};

    if (isA) {
      if (p.member_a_response !== 'pending') {
        return NextResponse.json(
          { error: 'Member A has already responded' },
          { status: 409 }
        );
      }
      update.member_a_response = response;
      update.member_a_responded_at = now;
    } else {
      if (p.member_b_response !== 'pending') {
        return NextResponse.json(
          { error: 'Member B has already responded' },
          { status: 409 }
        );
      }
      update.member_b_response = response;
      update.member_b_responded_at = now;
    }

    // Compute new status if both have responded
    const newAResponse = isA ? response : p.member_a_response;
    const newBResponse = isB ? response : p.member_b_response;

    if (newAResponse !== 'pending' && newBResponse !== 'pending') {
      if (newAResponse === 'interested' && newBResponse === 'interested') {
        update.is_mutual_interest = true;
        update.status = 'mutual_interest';
      } else if (
        newAResponse === 'not_interested' &&
        newBResponse === 'not_interested'
      ) {
        update.status = 'declined';
      } else {
        update.status = 'one_sided';
      }
    }

    const { error: updateError } = await supabase
      .from('match_presentations' as never)
      .update(update as never)
      .eq('id', presentationId);

    if (updateError) {
      console.error('Failed to update presentation:', updateError);
      return NextResponse.json(
        { error: 'Failed to update presentation' },
        { status: 500 }
      );
    }

    // If mutual interest: update payment_status and set membership_start_date
    if (update.status === 'mutual_interest') {
      const profileAId = s.profile_a_id as string;
      const profileBId = s.profile_b_id as string;

      for (const userId of [profileAId, profileBId]) {
        // Update payment_status to awaiting_payment
        await supabase
          .from('users')
          .update({ payment_status: 'awaiting_payment' })
          .eq('id', userId)
          .eq('payment_status', 'match_presented');

        // Set membership_start_date = mutual interest date (CRITICAL RULE)
        await supabase
          .from('payments')
          .update({ membership_start_date: now })
          .eq('user_id', userId)
          .is('membership_start_date', null);
      }

      await logActivity(
        result.admin.id,
        'mutual_interest_confirmed',
        'match_presentation',
        presentationId,
        {
          profile_a_id: profileAId,
          profile_b_id: profileBId,
          membership_start_date: now,
        }
      );
    }

    await logActivity(
      result.admin.id,
      'match_response_recorded',
      'match_presentation',
      presentationId,
      {
        member_id: memberId,
        member_position: isA ? 'A' : 'B',
        response,
        resulting_status: update.status ?? 'pending',
      }
    );

    return NextResponse.json({
      success: true,
      status: update.status ?? 'pending',
      is_mutual_interest: update.is_mutual_interest ?? false,
    });
  } catch (err) {
    console.error('Record response error:', err);
    return NextResponse.json(
      { error: 'Failed to record response' },
      { status: 500 }
    );
  }
}
