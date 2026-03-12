import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  const result = await requireAdmin();
  if (result.error) return result.error;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending_review';
    const minScore = parseInt(searchParams.get('minScore') || '0', 10);
    const maxScore = parseInt(searchParams.get('maxScore') || '100', 10);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const offset = (page - 1) * limit;

    const supabase = createAdminClient();

    let query = supabase
      .from('match_suggestions' as never)
      .select('*', { count: 'exact' })
      .gte('overall_compatibility_score', minScore)
      .lte('overall_compatibility_score', maxScore)
      .order('overall_compatibility_score', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status !== 'all') {
      query = query.eq('admin_status', status);
    }

    const { data, count, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Enrich with profile data for both members
    const suggestions = data as Array<Record<string, unknown>>;
    const enriched = await Promise.all(
      suggestions.map(async (s) => {
        const aId = s.profile_a_id as string;
        const bId = s.profile_b_id as string;

        const [profileA, profileB] = await Promise.all([
          supabase
            .from('profiles')
            .select('user_id, first_name, last_name, gender, date_of_birth, current_city, current_state')
            .eq('user_id', aId)
            .single(),
          supabase
            .from('profiles')
            .select('user_id, first_name, last_name, gender, date_of_birth, current_city, current_state')
            .eq('user_id', bId)
            .single(),
        ]);

        const [medA, medB] = await Promise.all([
          supabase
            .from('medical_credentials')
            .select('specialty')
            .eq('user_id', aId)
            .single(),
          supabase
            .from('medical_credentials')
            .select('specialty')
            .eq('user_id', bId)
            .single(),
        ]);

        const calcAge = (dob: string | null) => {
          if (!dob) return null;
          return Math.floor(
            (Date.now() - new Date(dob).getTime()) /
              (365.25 * 24 * 60 * 60 * 1000)
          );
        };

        return {
          ...s,
          profile_a: {
            full_name: profileA.data
              ? `${profileA.data.first_name || ''} ${profileA.data.last_name || ''}`.trim()
              : 'Unknown',
            age: calcAge(profileA.data?.date_of_birth ?? null),
            gender: profileA.data?.gender ?? null,
            specialty: medA.data?.specialty ?? [],
            current_city: profileA.data?.current_city ?? null,
            current_state: profileA.data?.current_state ?? null,
          },
          profile_b: {
            full_name: profileB.data
              ? `${profileB.data.first_name || ''} ${profileB.data.last_name || ''}`.trim()
              : 'Unknown',
            age: calcAge(profileB.data?.date_of_birth ?? null),
            gender: profileB.data?.gender ?? null,
            specialty: medB.data?.specialty ?? [],
            current_city: profileB.data?.current_city ?? null,
            current_state: profileB.data?.current_state ?? null,
          },
        };
      })
    );

    return NextResponse.json({
      suggestions: enriched,
      total: count ?? 0,
      page,
      limit,
    });
  } catch (err) {
    console.error('List suggestions error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to list suggestions' },
      { status: 500 }
    );
  }
}
