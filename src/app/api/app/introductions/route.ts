import { NextRequest, NextResponse } from 'next/server';
import { requireApplicant } from '@/lib/app/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  const result = await requireApplicant();
  if (result.error) return result.error;

  if (result.user.paymentStatus !== 'active_member') {
    return NextResponse.json({ error: 'Active membership required' }, { status: 403 });
  }

  const userId = result.user.id;
  const supabase = createAdminClient();
  const url = new URL(request.url);
  const presentationId = url.searchParams.get('presentationId');

  if (!presentationId) {
    return NextResponse.json({ error: 'Missing presentationId' }, { status: 400 });
  }

  // Verify this presentation belongs to the user and is mutual interest + active member
  const { data: presentation } = await supabase
    .from('match_presentations' as never)
    .select(`
      id,
      is_mutual_interest,
      match_suggestions!inner (
        profile_a_id,
        profile_b_id
      )
    `)
    .eq('id', presentationId)
    .single();

  if (!presentation) {
    return NextResponse.json({ error: 'Match not found' }, { status: 404 });
  }

  const p = presentation as Record<string, unknown>;
  const s = p.match_suggestions as Record<string, unknown>;
  const isPartOfMatch = s.profile_a_id === userId || s.profile_b_id === userId;

  if (!isPartOfMatch) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  if (!p.is_mutual_interest) {
    return NextResponse.json({ error: 'Mutual interest not yet confirmed' }, { status: 400 });
  }

  // Fetch existing availability slots
  const { data: slots } = await supabase
    .from('introduction_availability' as never)
    .select('id, available_date, time_slot, notes, created_at')
    .eq('user_id', userId)
    .eq('match_presentation_id', presentationId)
    .order('available_date', { ascending: true });

  // Fetch existing introductions for this match
  const { data: introductions } = await supabase
    .from('introductions' as never)
    .select('id, scheduled_at, status, meeting_link')
    .eq('match_presentation_id', presentationId)
    .order('scheduled_at', { ascending: true });

  return NextResponse.json({
    slots: slots ?? [],
    introductions: introductions ?? [],
  });
}

export async function POST(request: NextRequest) {
  const result = await requireApplicant();
  if (result.error) return result.error;

  if (result.user.paymentStatus !== 'active_member') {
    return NextResponse.json({ error: 'Active membership required' }, { status: 403 });
  }

  const userId = result.user.id;
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const supabase = createAdminClient();

  const { presentationId, slots } = body as {
    presentationId: string;
    slots: Array<{ date: string; timeSlot: string; notes?: string }>;
  };

  if (!presentationId || !slots || !Array.isArray(slots) || slots.length === 0) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  // Validate slot count and values
  const VALID_TIME_SLOTS = new Set(['morning', 'afternoon', 'evening']);
  const MAX_SLOTS = 42; // 14 days x 3 slots
  if (slots.length > MAX_SLOTS) {
    return NextResponse.json({ error: 'Too many slots' }, { status: 400 });
  }
  for (const slot of slots) {
    if (!slot.date || !slot.timeSlot) {
      return NextResponse.json({ error: 'Each slot must have date and timeSlot' }, { status: 400 });
    }
    if (!VALID_TIME_SLOTS.has(slot.timeSlot)) {
      return NextResponse.json({ error: 'Invalid time slot value' }, { status: 400 });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(slot.date) || isNaN(Date.parse(slot.date))) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
    }
  }

  // Verify presentation and mutual interest
  const { data: presentation } = await supabase
    .from('match_presentations' as never)
    .select('id, is_mutual_interest, match_suggestions!inner (profile_a_id, profile_b_id)')
    .eq('id', presentationId)
    .single();

  if (!presentation) {
    return NextResponse.json({ error: 'Match not found' }, { status: 404 });
  }

  const p = presentation as Record<string, unknown>;
  const s = p.match_suggestions as Record<string, unknown>;
  const isPartOfMatch = s.profile_a_id === userId || s.profile_b_id === userId;

  if (!isPartOfMatch || !p.is_mutual_interest) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  // Delete existing slots and insert new ones
  await supabase
    .from('introduction_availability' as never)
    .delete()
    .eq('user_id', userId)
    .eq('match_presentation_id', presentationId);

  const rows = slots.map((slot) => ({
    user_id: userId,
    match_presentation_id: presentationId,
    available_date: slot.date,
    time_slot: slot.timeSlot,
    notes: slot.notes || null,
  }));

  const { error } = await supabase
    .from('introduction_availability' as never)
    .insert(rows as never);

  if (error) {
    return NextResponse.json({ error: 'Failed to save availability' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
