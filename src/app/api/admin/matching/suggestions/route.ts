import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  const result = await requireAdmin();
  if (result.error) return result.error;

  const { allowed } = await checkRateLimit(`suggestions-read:${result.admin.id}`, 60, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests. Please try again in a moment.' }, { status: 429 });
  }

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
      console.error('Failed to fetch suggestions:', error.message);
      return NextResponse.json({ error: 'Failed to fetch suggestions' }, { status: 500 });
    }

    // Parallel count queries for all statuses (used for tab badges in UI)
    const [pendingCount, approvedCount, rejectedCount] = await Promise.all([
      supabase.from('match_suggestions' as never).select('id', { count: 'exact', head: true }).eq('admin_status', 'pending_review'),
      supabase.from('match_suggestions' as never).select('id', { count: 'exact', head: true }).eq('admin_status', 'approved'),
      supabase.from('match_suggestions' as never).select('id', { count: 'exact', head: true }).eq('admin_status', 'rejected'),
    ]);

    // Enrich with profile data for both members
    const suggestions = data as Array<Record<string, unknown>>;

    // Collect all user IDs for batch photo fetch
    const allUserIds = new Set<string>();
    for (const s of suggestions) {
      allUserIds.add(s.profile_a_id as string);
      allUserIds.add(s.profile_b_id as string);
    }

    // Batch fetch primary photos + signed URLs
    const photoUrlMap = new Map<string, string>();
    if (allUserIds.size > 0) {
      const { data: photos } = await supabase
        .from('photos')
        .select('user_id, storage_path')
        .eq('is_primary', true as never)
        .in('user_id', Array.from(allUserIds) as never);

      if (photos && photos.length > 0) {
        const paths = photos.map((p) => (p as { user_id: string; storage_path: string }).storage_path);
        const { data: signedData } = await supabase.storage
          .from('photos')
          .createSignedUrls(paths, 3600);
        if (signedData) {
          for (let i = 0; i < photos.length; i++) {
            const photo = photos[i] as { user_id: string; storage_path: string };
            const signed = signedData[i];
            if (signed?.signedUrl) {
              photoUrlMap.set(photo.user_id, signed.signedUrl);
            }
          }
        }
      }
    }

    const enriched = await Promise.all(
      suggestions.map(async (s) => {
        const aId = s.profile_a_id as string;
        const bId = s.profile_b_id as string;

        const [profileA, profileB, medA, medB, userA, userB] = await Promise.all([
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
          supabase
            .from('users')
            .select('is_goocampus_member, payment_status')
            .eq('id', aId)
            .single(),
          supabase
            .from('users')
            .select('is_goocampus_member, payment_status')
            .eq('id', bId)
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
            primary_photo_url: photoUrlMap.get(aId) ?? null,
            is_goocampus_member: userA.data?.is_goocampus_member ?? false,
            payment_status: userA.data?.payment_status ?? null,
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
            primary_photo_url: photoUrlMap.get(bId) ?? null,
            is_goocampus_member: userB.data?.is_goocampus_member ?? false,
            payment_status: userB.data?.payment_status ?? null,
          },
        };
      })
    );

    return NextResponse.json({
      suggestions: enriched,
      total: count ?? 0,
      page,
      limit,
      counts: {
        pending_review: pendingCount.count ?? 0,
        approved: approvedCount.count ?? 0,
        rejected: rejectedCount.count ?? 0,
      },
    });
  } catch (err) {
    console.error('List suggestions error:', err);
    return NextResponse.json(
      { error: 'Failed to list suggestions' },
      { status: 500 }
    );
  }
}
