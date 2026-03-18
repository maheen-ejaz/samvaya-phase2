import { NextResponse } from 'next/server';
import { requireApplicant } from '@/lib/app/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { checkRateLimit } from '@/lib/rate-limit';

export async function GET() {
  const result = await requireApplicant();
  if (result.error) return result.error;

  const userId = result.user.id;

  const { allowed } = checkRateLimit(`matches-read:${userId}`, 30, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests. Please try again in a moment.' }, { status: 429 });
  }

  const supabase = createAdminClient();

  // Fetch presentations where user is either profile A or B
  const { data: presentations, error } = await supabase
    .from('match_presentations' as never)
    .select(`
      id,
      status,
      member_a_response,
      member_b_response,
      is_mutual_interest,
      presented_at,
      expires_at,
      match_suggestions!inner (
        profile_a_id,
        profile_b_id,
        overall_compatibility_score
      )
    `)
    .or(
      `match_suggestions.profile_a_id.eq.${userId},match_suggestions.profile_b_id.eq.${userId}`
    )
    .order('presented_at', { ascending: false })
    .limit(20);

  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch matches' },
      { status: 500 }
    );
  }

  const items = (presentations as Record<string, unknown>[]) ?? [];
  if (items.length === 0) {
    return NextResponse.json({ matches: [] });
  }

  // Collect all "other" user IDs for batch fetching
  const otherUserIds: string[] = [];
  const presentationMeta = items.map((p) => {
    const s = p.match_suggestions as Record<string, unknown>;
    const isA = s.profile_a_id === userId;
    const otherUserId = (isA ? s.profile_b_id : s.profile_a_id) as string;
    if (!otherUserIds.includes(otherUserId)) {
      otherUserIds.push(otherUserId);
    }
    return { p, s, isA, otherUserId };
  });

  // Batch fetch: profiles, medical creds, primary photos (3 queries instead of 3*N)
  const [profilesResult, credsResult, photosResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('user_id, date_of_birth, current_state, current_country')
      .in('user_id', otherUserIds),
    supabase
      .from('medical_credentials')
      .select('user_id, primary_specialty')
      .in('user_id', otherUserIds),
    supabase
      .from('photos')
      .select('user_id, blurred_path')
      .in('user_id', otherUserIds)
      .eq('is_primary', true),
  ]);

  // Build lookup maps
  const profileMap = new Map<string, Record<string, unknown>>();
  for (const row of (profilesResult.data as Record<string, unknown>[] | null) ?? []) {
    profileMap.set(row.user_id as string, row);
  }

  const credsMap = new Map<string, Record<string, unknown>>();
  for (const row of (credsResult.data as Record<string, unknown>[] | null) ?? []) {
    credsMap.set(row.user_id as string, row);
  }

  const photoMap = new Map<string, Record<string, unknown>>();
  for (const row of (photosResult.data as Record<string, unknown>[] | null) ?? []) {
    photoMap.set(row.user_id as string, row);
  }

  // Batch sign blurred photo URLs
  const photoPaths: { userId: string; path: string }[] = [];
  for (const uid of otherUserIds) {
    const photo = photoMap.get(uid);
    if (photo?.blurred_path) {
      photoPaths.push({ userId: uid, path: photo.blurred_path as string });
    }
  }

  const signedUrlMap = new Map<string, string>();
  if (photoPaths.length > 0) {
    const { data: signedUrls } = await supabase.storage
      .from('photos')
      .createSignedUrls(
        photoPaths.map((p) => p.path),
        3600
      );
    if (signedUrls) {
      for (let i = 0; i < signedUrls.length; i++) {
        if (signedUrls[i].signedUrl) {
          signedUrlMap.set(photoPaths[i].userId, signedUrls[i].signedUrl);
        }
      }
    }
  }

  // Build enriched response
  const enriched = presentationMeta.map(({ p, s, isA, otherUserId }) => {
    const otherProfile = profileMap.get(otherUserId);
    const otherCreds = credsMap.get(otherUserId);

    // Calculate age
    let age: number | null = null;
    if (otherProfile?.date_of_birth) {
      const dob = new Date(otherProfile.date_of_birth as string);
      const today = new Date();
      age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
    }

    return {
      id: p.id,
      status: p.status,
      myResponse: isA ? p.member_a_response : p.member_b_response,
      theirResponse: (p.status as string) !== 'pending' ? (isA ? p.member_b_response : p.member_a_response) : 'hidden',
      isMutualInterest: p.is_mutual_interest,
      presentedAt: p.presented_at,
      expiresAt: p.expires_at,
      score: s.overall_compatibility_score,
      otherProfile: {
        age,
        state: otherProfile?.current_state ?? null,
        country: otherProfile?.current_country ?? null,
        specialty: otherCreds?.primary_specialty ?? null,
        blurredPhotoUrl: signedUrlMap.get(otherUserId) ?? null,
      },
    };
  });

  return NextResponse.json({ matches: enriched });
}
