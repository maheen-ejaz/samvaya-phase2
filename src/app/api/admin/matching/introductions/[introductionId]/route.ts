import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, validateUserId } from '@/lib/admin/auth';
import { logActivity } from '@/lib/admin/activity';
import { createAdminClient } from '@/lib/supabase/admin';

export async function PATCH(
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
    const { scheduledAt, meetingLink, facilitatorId, status } = body;

    const supabase = createAdminClient();

    const update: Record<string, unknown> = {};
    if (scheduledAt !== undefined) update.scheduled_at = scheduledAt;
    if (meetingLink !== undefined) update.meeting_link = meetingLink;
    if (facilitatorId !== undefined) {
      if (facilitatorId) {
        const facilValidation = validateUserId(facilitatorId);
        if (facilValidation) return facilValidation;
      }
      update.facilitator_id = facilitatorId;
    }
    if (status !== undefined) {
      const validStatuses = ['scheduled', 'rescheduled', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
          { status: 400 }
        );
      }
      update.status = status;
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('introductions' as never)
      .update(update as never)
      .eq('id', introductionId)
      .select()
      .single();

    if (error) {
      console.error('Failed to update introduction:', error);
      return NextResponse.json(
        { error: 'Failed to update introduction' },
        { status: 500 }
      );
    }

    await logActivity(
      result.admin.id,
      'introduction_updated',
      'introduction',
      introductionId,
      update
    );

    return NextResponse.json({ success: true, introduction: data });
  } catch (err) {
    console.error('Update introduction error:', err);
    return NextResponse.json(
      { error: 'Failed to update introduction' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ introductionId: string }> }
) {
  const result = await requireAdmin();
  if (result.error) return result.error;

  const { introductionId } = await params;
  const validation = validateUserId(introductionId);
  if (validation) return validation;

  try {
    const supabase = createAdminClient();

    const { error } = await supabase
      .from('introductions' as never)
      .update({ status: 'cancelled' } as never)
      .eq('id', introductionId);

    if (error) {
      console.error('Failed to cancel introduction:', error);
      return NextResponse.json(
        { error: 'Failed to cancel introduction' },
        { status: 500 }
      );
    }

    await logActivity(
      result.admin.id,
      'introduction_cancelled',
      'introduction',
      introductionId,
      {}
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Cancel introduction error:', err);
    return NextResponse.json(
      { error: 'Failed to cancel introduction' },
      { status: 500 }
    );
  }
}
