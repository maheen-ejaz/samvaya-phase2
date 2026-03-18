import { NextRequest, NextResponse } from 'next/server';
import { requireApplicant } from '@/lib/app/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendNotificationEmail } from '@/lib/email/notifications';
import { matchResponseReceivedEmail } from '@/lib/email/templates';
import { checkRateLimit } from '@/lib/rate-limit';
import { isValidUUID } from '@/lib/validation';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ presentationId: string }> }
) {
  const result = await requireApplicant();
  if (result.error) return result.error;

  const userId = result.user.id;

  const { allowed } = checkRateLimit(`match-respond:${userId}`, 10, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests. Please try again in a moment.' }, { status: 429 });
  }

  const { presentationId } = await params;

  if (!isValidUUID(presentationId)) {
    return NextResponse.json({ error: 'Invalid presentation ID format' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { response } = body;

    // Validate input before calling RPC
    if (response !== 'interested' && response !== 'not_interested') {
      return NextResponse.json(
        { error: 'response must be "interested" or "not_interested"' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Call atomic RPC — handles locking, validation, expiry, mutual interest in one transaction
    const { data, error: rpcError } = await supabase.rpc(
      'handle_match_response' as never,
      {
        p_presentation_id: presentationId,
        p_user_id: userId,
        p_response: response,
      } as never
    );

    if (rpcError) {
      console.error('RPC error:', rpcError);
      return NextResponse.json(
        { error: 'Failed to record response' },
        { status: 500 }
      );
    }

    const rpcResult = data as Record<string, unknown>;

    // RPC returns error objects for validation failures
    if (rpcResult.error) {
      return NextResponse.json(
        { error: rpcResult.error },
        { status: (rpcResult.status_code as number) || 400 }
      );
    }

    // Send notification emails (fire-and-forget)
    const isMutual = rpcResult.is_mutual_interest === true;

    // Find the other user from the match suggestion
    (async () => {
      try {
        const { data: presentation } = await supabase
          .from('match_presentations' as never)
          .select('match_suggestion_id')
          .eq('id', presentationId)
          .single();

        if (!presentation) return;
        const suggestionId = (presentation as Record<string, unknown>).match_suggestion_id as string;

        const { data: suggestion } = await supabase
          .from('match_suggestions' as never)
          .select('profile_a_id, profile_b_id')
          .eq('id', suggestionId)
          .single();

        if (!suggestion) return;
        const sg = suggestion as Record<string, unknown>;
        const otherUserId = sg.profile_a_id === userId
          ? sg.profile_b_id as string
          : sg.profile_a_id as string;

        // Notify the other user
        const { data: otherProfile } = await supabase
          .from('profiles')
          .select('first_name')
          .eq('user_id', otherUserId)
          .single();
        const otherName = otherProfile?.first_name || 'there';
        await sendNotificationEmail(otherUserId, 'match_response', () =>
          matchResponseReceivedEmail(otherName, isMutual)
        );

        // If mutual interest, also notify the responding user
        if (isMutual) {
          const { data: myProfile } = await supabase
            .from('profiles')
            .select('first_name')
            .eq('user_id', userId)
            .single();
          const myName = myProfile?.first_name || 'there';
          await sendNotificationEmail(userId, 'match_response', () =>
            matchResponseReceivedEmail(myName, true)
          );
        }
      } catch (notifErr) {
        console.error('Match response notification failed:', notifErr);
      }
    })();

    return NextResponse.json({
      success: rpcResult.success,
      status: rpcResult.status,
      is_mutual_interest: rpcResult.is_mutual_interest,
    });
  } catch (err) {
    console.error('User respond error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
