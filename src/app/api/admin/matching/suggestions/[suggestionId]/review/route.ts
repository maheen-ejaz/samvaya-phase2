import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, validateUserId } from '@/lib/admin/auth';
import { logActivity } from '@/lib/admin/activity';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendNotificationEmail } from '@/lib/email/notifications';
import { matchPresentedEmail } from '@/lib/email/templates';
import type { MatchingConfig } from '@/types/matching';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ suggestionId: string }> }
) {
  const result = await requireAdmin();
  if (result.error) return result.error;

  const { suggestionId } = await params;
  const validation = validateUserId(suggestionId);
  if (validation) return validation;

  try {
    const body = await request.json();
    const { action, narrative, notes } = body;

    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json(
        { error: 'action must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    if (narrative && narrative.length > 5_000) {
      return NextResponse.json(
        { error: 'Narrative exceeds 5,000 character limit' },
        { status: 400 }
      );
    }

    if (notes && notes.length > 2_000) {
      return NextResponse.json(
        { error: 'Notes exceed 2,000 character limit' },
        { status: 400 }
      );
    }

    if (action === 'reject' && !notes?.trim()) {
      return NextResponse.json(
        { error: 'Rejection reason (notes) is required' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Fetch the suggestion
    const { data: suggestion, error: fetchError } = await supabase
      .from('match_suggestions' as never)
      .select('*')
      .eq('id', suggestionId)
      .single();

    if (fetchError || !suggestion) {
      return NextResponse.json(
        { error: 'Match suggestion not found' },
        { status: 404 }
      );
    }

    const s = suggestion as Record<string, unknown>;
    if (s.admin_status !== 'pending_review') {
      return NextResponse.json(
        { error: `Suggestion is already ${s.admin_status}` },
        { status: 409 }
      );
    }

    if (action === 'approve') {
      // 1. Update suggestion status
      const { error: updateError } = await supabase
        .from('match_suggestions' as never)
        .update({
          admin_status: 'approved',
          reviewed_by: result.admin.id,
          reviewed_at: new Date().toISOString(),
          admin_notes: notes ?? null,
          match_narrative: narrative ?? s.match_narrative,
        } as never)
        .eq('id', suggestionId);

      if (updateError) {
        console.error('Failed to update suggestion:', updateError);
        return NextResponse.json(
          { error: 'Failed to update suggestion' },
          { status: 500 }
        );
      }

      // 2. Create match presentation
      const config = await getMatchingConfigValue(supabase);
      const expiryDays = config?.presentation_expiry_days ?? 7;

      const { data: presentation, error: presentationError } = await supabase
        .from('match_presentations' as never)
        .insert({
          match_suggestion_id: suggestionId,
          expires_at: new Date(
            Date.now() + expiryDays * 24 * 60 * 60 * 1000
          ).toISOString(),
        } as never)
        .select()
        .single();

      if (presentationError) {
        // Rollback: revert suggestion to pending_review
        await supabase
          .from('match_suggestions' as never)
          .update({
            admin_status: 'pending_review',
            reviewed_by: null,
            reviewed_at: null,
          } as never)
          .eq('id', suggestionId);

        console.error('Failed to create presentation:', presentationError);
        return NextResponse.json(
          { error: 'Failed to create presentation' },
          { status: 500 }
        );
      }

      // 3. Update both users' payment_status to 'match_presented' if currently 'in_pool'
      const profileAId = s.profile_a_id as string;
      const profileBId = s.profile_b_id as string;

      for (const userId of [profileAId, profileBId]) {
        await supabase
          .from('users')
          .update({ payment_status: 'match_presented' })
          .eq('id', userId)
          .eq('payment_status', 'in_pool');
      }

      await logActivity(
        result.admin.id,
        'match_approved',
        'match_suggestion',
        suggestionId,
        {
          profile_a_id: profileAId,
          profile_b_id: profileBId,
          presentation_id: (presentation as Record<string, unknown>).id,
          overall_score: s.overall_compatibility_score,
        }
      );

      // Send notification emails to both users (fire-and-forget)
      for (const userId of [profileAId, profileBId]) {
        supabase
          .from('profiles')
          .select('first_name')
          .eq('user_id', userId)
          .single()
          .then(({ data: profile }) => {
            const name = (profile as Record<string, unknown>)?.first_name as string || 'there';
            sendNotificationEmail(userId, 'new_match', () => matchPresentedEmail(name));
          });
      }

      return NextResponse.json({
        success: true,
        action: 'approved',
        presentation,
      });
    } else {
      // Reject
      const { error: updateError } = await supabase
        .from('match_suggestions' as never)
        .update({
          admin_status: 'rejected',
          reviewed_by: result.admin.id,
          reviewed_at: new Date().toISOString(),
          admin_notes: notes,
        } as never)
        .eq('id', suggestionId);

      if (updateError) {
        console.error('Failed to reject suggestion:', updateError);
        return NextResponse.json(
          { error: 'Failed to reject suggestion' },
          { status: 500 }
        );
      }

      await logActivity(
        result.admin.id,
        'match_rejected',
        'match_suggestion',
        suggestionId,
        {
          profile_a_id: s.profile_a_id,
          profile_b_id: s.profile_b_id,
          reason: notes,
        }
      );

      return NextResponse.json({ success: true, action: 'rejected' });
    }
  } catch (err) {
    console.error('Review suggestion error:', err);
    return NextResponse.json(
      { error: 'Review failed' },
      { status: 500 }
    );
  }
}

async function getMatchingConfigValue(
  supabase: ReturnType<typeof createAdminClient>
): Promise<MatchingConfig | null> {
  const { data } = await supabase
    .from('system_config' as never)
    .select('value')
    .eq('key', 'matching_config')
    .single();

  return data ? (data as { value: MatchingConfig }).value : null;
}
