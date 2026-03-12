import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';
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

    // Auto-expire stale presentations (check-on-read pattern)
    await supabase
      .from('match_presentations' as never)
      .update({ status: 'expired' } as never)
      .eq('status', 'pending')
      .lt('expires_at', new Date().toISOString());

    let query = supabase
      .from('match_presentations' as never)
      .select('*, match_suggestions!inner(*)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, count, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Enrich with profile names
    const presentations = data as Array<Record<string, unknown>>;
    const enriched = await Promise.all(
      presentations.map(async (p) => {
        const s = p.match_suggestions as Record<string, unknown>;
        const aId = s.profile_a_id as string;
        const bId = s.profile_b_id as string;
        const [profileA, profileB] = await Promise.all([
          supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('user_id', aId)
            .single(),
          supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('user_id', bId)
            .single(),
        ]);

        return {
          ...p,
          profile_a_name: profileA.data
            ? `${profileA.data.first_name || ''} ${profileA.data.last_name || ''}`.trim()
            : 'Unknown',
          profile_b_name: profileB.data
            ? `${profileB.data.first_name || ''} ${profileB.data.last_name || ''}`.trim()
            : 'Unknown',
        };
      })
    );

    return NextResponse.json({
      presentations: enriched,
      total: count ?? 0,
      page,
      limit,
    });
  } catch (err) {
    console.error('List presentations error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to list presentations' },
      { status: 500 }
    );
  }
}
