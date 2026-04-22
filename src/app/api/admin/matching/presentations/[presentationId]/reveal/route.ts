import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { logActivity } from '@/lib/admin/activity';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ presentationId: string }> }
) {
  const result = await requireAdmin();
  if (result.error) return result.error;

  const { presentationId } = await params;

  const supabase = createAdminClient();

  // Fetch current state
  const { data: pres } = await (supabase as unknown as {
    from: (t: string) => {
      select: (s: string) => {
        eq: (c: string, v: string) => {
          single: () => Promise<{ data: Record<string, unknown> | null }>
        }
      }
    }
  })
    .from('match_presentations')
    .select('id, is_mutual_interest, is_full_revealed')
    .eq('id', presentationId)
    .single();

  if (!pres) {
    return NextResponse.json({ error: 'Presentation not found' }, { status: 404 });
  }

  if (!pres.is_mutual_interest) {
    return NextResponse.json(
      { error: 'Cannot reveal full profiles before mutual interest is confirmed' },
      { status: 422 }
    );
  }

  if (pres.is_full_revealed) {
    // Idempotent — already revealed
    return NextResponse.json({ success: true, already_revealed: true });
  }

  const { error } = await (supabase as unknown as {
    from: (t: string) => {
      update: (data: object) => {
        eq: (c: string, v: string) => Promise<{ error: { message: string } | null }>
      }
    }
  })
    .from('match_presentations')
    .update({ is_full_revealed: true })
    .eq('id', presentationId);

  if (error) {
    console.error('Failed to reveal profiles:', error);
    return NextResponse.json({ error: 'Failed to reveal profiles' }, { status: 500 });
  }

  await logActivity(
    result.admin.id,
    'match_profiles_revealed',
    'match_presentation',
    presentationId,
    {}
  );

  return NextResponse.json({ success: true });
}
