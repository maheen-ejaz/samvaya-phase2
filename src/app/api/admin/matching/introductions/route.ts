import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, validateUserId } from '@/lib/admin/auth';
import { logActivity } from '@/lib/admin/activity';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  const result = await requireAdmin();
  if (result.error) return result.error;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const offset = (page - 1) * limit;

    const supabase = createAdminClient();

    let query = supabase
      .from('introductions' as never)
      .select(
        '*, match_presentations!inner(*, match_suggestions!inner(profile_a_id, profile_b_id, overall_compatibility_score))',
        { count: 'exact' }
      )
      .order('scheduled_at', { ascending: true, nullsFirst: false })
      .range(offset, offset + limit - 1);

    if (status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, count, error } = await query;

    if (error) {
      console.error('Failed to list introductions:', error);
      return NextResponse.json({ error: 'Failed to list introductions' }, { status: 500 });
    }

    return NextResponse.json({
      introductions: data,
      total: count ?? 0,
      page,
      limit,
    });
  } catch (err) {
    console.error('List introductions error:', err);
    return NextResponse.json(
      { error: 'Failed to list introductions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const result = await requireAdmin();
  if (result.error) return result.error;

  try {
    const body = await request.json();
    const { presentationId, scheduledAt, meetingLink, facilitatorId } = body;

    if (!presentationId) {
      return NextResponse.json(
        { error: 'presentationId is required' },
        { status: 400 }
      );
    }

    const presentationValidation = validateUserId(presentationId);
    if (presentationValidation) return presentationValidation;

    if (facilitatorId) {
      const facilValidation = validateUserId(facilitatorId);
      if (facilValidation) return facilValidation;
    }

    const supabase = createAdminClient();

    // Verify presentation exists and is mutual_interest
    const { data: presentation, error: fetchError } = await supabase
      .from('match_presentations' as never)
      .select('id, status')
      .eq('id', presentationId)
      .single();

    if (fetchError || !presentation) {
      return NextResponse.json(
        { error: 'Match presentation not found' },
        { status: 404 }
      );
    }

    if ((presentation as Record<string, unknown>).status !== 'mutual_interest') {
      return NextResponse.json(
        { error: 'Can only schedule introductions for mutual interest matches' },
        { status: 400 }
      );
    }

    // Get next introduction number
    const { count: existingCount } = await supabase
      .from('introductions' as never)
      .select('id', { count: 'exact', head: true })
      .eq('match_presentation_id', presentationId);

    const introNumber = (existingCount ?? 0) + 1;

    const { data: introduction, error: insertError } = await supabase
      .from('introductions' as never)
      .insert({
        match_presentation_id: presentationId,
        introduction_number: introNumber,
        scheduled_at: scheduledAt ?? null,
        meeting_link: meetingLink ?? null,
        is_team_facilitated: introNumber === 1, // First is always facilitated
        facilitator_id: facilitatorId ?? null,
      } as never)
      .select()
      .single();

    if (insertError) {
      console.error('Failed to create introduction:', insertError);
      return NextResponse.json(
        { error: 'Failed to create introduction' },
        { status: 500 }
      );
    }

    await logActivity(
      result.admin.id,
      'introduction_scheduled',
      'introduction',
      (introduction as Record<string, unknown>).id as string,
      {
        presentation_id: presentationId,
        introduction_number: introNumber,
        scheduled_at: scheduledAt,
        is_team_facilitated: introNumber === 1,
      }
    );

    return NextResponse.json({ success: true, introduction });
  } catch (err) {
    console.error('Create introduction error:', err);
    return NextResponse.json(
      { error: 'Failed to create introduction' },
      { status: 500 }
    );
  }
}
