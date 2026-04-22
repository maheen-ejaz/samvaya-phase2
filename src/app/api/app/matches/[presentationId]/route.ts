import { NextRequest, NextResponse } from 'next/server';
import { requireApplicant } from '@/lib/app/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { calculateAge } from '@/lib/utils';
import { checkRateLimit } from '@/lib/rate-limit';
import { isValidUUID } from '@/lib/validation';

// PII allowlist — only these fields are exposed to the user
const PROFILE_ALLOWLIST = [
  'date_of_birth',
  'gender',
  'height_cm',
  'current_city',
  'current_state',
  'current_country',
  'hometown_city',
  'hometown_state',
  'religion',
  'caste',
  'sub_caste',
  'mother_tongue',
  'diet',
  'smoking',
  'drinking',
  'exercise_frequency',
  'marriage_timeline',
  'children_preference',
  'living_arrangement_preference',
  'settlement_preference',
  'ai_personality_summary',
] as const;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ presentationId: string }> }
) {
  const result = await requireApplicant();
  if (result.error) return result.error;

  const userId = result.user.id;

  const { allowed } = await checkRateLimit(`match-detail:${userId}`, 60, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests. Please try again in a moment.' }, { status: 429 });
  }

  const { presentationId } = await params;

  if (!isValidUUID(presentationId)) {
    return NextResponse.json({ error: 'Invalid presentation ID format' }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Fetch presentation with suggestion
  const { data: presentation, error } = await supabase
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
        id,
        profile_a_id,
        profile_b_id,
        overall_compatibility_score,
        compatibility_report,
        match_narrative,
        recommendation
      )
    `)
    .eq('id', presentationId)
    .single();

  if (error || !presentation) {
    return NextResponse.json(
      { error: 'Match not found' },
      { status: 404 }
    );
  }

  const p = presentation as Record<string, unknown>;
  const s = p.match_suggestions as Record<string, unknown>;

  // Verify user is part of this match
  const isA = s.profile_a_id === userId;
  const isB = s.profile_b_id === userId;
  if (!isA && !isB) {
    return NextResponse.json(
      { error: 'Match not found' },
      { status: 404 }
    );
  }

  const otherUserId = isA ? (s.profile_b_id as string) : (s.profile_a_id as string);
  const myUserId = userId;

  // Fetch other profile — only allowlisted fields
  const { data: otherProfileRaw } = await supabase
    .from('profiles')
    .select(PROFILE_ALLOWLIST.join(','))
    .eq('user_id', otherUserId)
    .single();
  const otherProfile = otherProfileRaw as Record<string, unknown> | null;

  // Fetch other medical credentials
  const { data: otherCredsRaw } = await supabase
    .from('medical_credentials')
    .select('medical_degree, primary_specialty, years_of_experience, current_designation')
    .eq('user_id', otherUserId)
    .single();
  const otherCreds = otherCredsRaw as Record<string, unknown> | null;

  // Fetch compatibility profiles (spider web scores) for both users
  const { data: otherCompat } = await supabase
    .from('compatibility_profiles' as never)
    .select('spider_web_scores')
    .eq('user_id', otherUserId)
    .single();

  const { data: myCompat } = await supabase
    .from('compatibility_profiles' as never)
    .select('spider_web_scores')
    .eq('user_id', myUserId)
    .single();

  // Fetch hobbies/interests
  const { data: otherInterestsRaw } = await supabase
    .from('profiles')
    .select('hobbies')
    .eq('user_id', otherUserId)
    .single();
  const otherInterests = otherInterestsRaw as Record<string, unknown> | null;

  // Photo logic: blurred unless mutual interest + active member
  const canSeeOriginal =
    (p.is_mutual_interest === true) &&
    (result.user.paymentStatus === 'active_member');

  // Fetch reveal data (first name, contact info) when full reveal is available
  let revealData: { firstName: string | null; email: string | null; phone: string | null } | null = null;
  if (canSeeOriginal) {
    const [nameResult, authResult] = await Promise.all([
      supabase
        .from('profiles')
        .select('first_name')
        .eq('user_id', otherUserId)
        .single(),
      supabase.auth.admin.getUserById(otherUserId),
    ]);

    revealData = {
      firstName: (nameResult.data as Record<string, unknown> | null)?.first_name as string | null,
      email: authResult.data?.user?.email ?? null,
      phone: authResult.data?.user?.phone ?? null,
    };
  }

  const { data: photos } = await supabase
    .from('photos')
    .select('storage_path, blurred_path, is_primary, display_order')
    .eq('user_id', otherUserId)
    .order('is_primary', { ascending: false })
    .order('display_order', { ascending: true });

  const photoUrls: string[] = [];
  if (photos && (photos as Array<Record<string, unknown>>).length > 0) {
    const photoPaths: string[] = [];
    for (const photo of photos as Array<Record<string, unknown>>) {
      // Prefer original if allowed, fall back to blurred, skip if neither exists
      const path = canSeeOriginal
        ? ((photo.storage_path as string | null) ?? (photo.blurred_path as string | null))
        : ((photo.blurred_path as string | null) ?? null);
      if (path) {
        photoPaths.push(path);
      }
    }

    if (photoPaths.length > 0) {
      const { data: signedUrls } = await supabase.storage
        .from('photos')
        .createSignedUrls(photoPaths, 3600);
      if (signedUrls) {
        for (const signed of signedUrls) {
          if (signed.signedUrl) {
            photoUrls.push(signed.signedUrl);
          }
        }
      }
    }
  }

  // Calculate age
  const age = calculateAge(otherProfile?.date_of_birth as string | null);

  // Build compatibility report (strip internal fields)
  const report = s.compatibility_report as Record<string, unknown> | null;
  const dimensionScores = report?.dimension_scores ?? null;
  const highlights = report?.highlights ?? [];
  const concerns = report?.concerns ?? [];

  return NextResponse.json({
    id: p.id,
    status: p.status,
    myResponse: isA ? p.member_a_response : p.member_b_response,
    theirResponse: p.is_mutual_interest !== null ? (isA ? p.member_b_response : p.member_a_response) : 'hidden',
    isMutualInterest: p.is_mutual_interest,
    presentedAt: p.presented_at,
    expiresAt: p.expires_at,
    canSeeOriginal,
    revealData,
    score: s.overall_compatibility_score,
    narrative: s.match_narrative,
    recommendation: s.recommendation,
    dimensionScores,
    highlights,
    concerns,
    spiderWeb: {
      mine: (myCompat as Record<string, unknown> | null)?.spider_web_scores ?? null,
      theirs: (otherCompat as Record<string, unknown> | null)?.spider_web_scores ?? null,
    },
    otherProfile: {
      age,
      gender: otherProfile?.gender ?? null,
      heightCm: otherProfile?.height_cm ?? null,
      city: canSeeOriginal ? (otherProfile?.current_city ?? null) : null,
      state: otherProfile?.current_state ?? null,
      country: otherProfile?.current_country ?? null,
      religion: otherProfile?.religion ?? null,
      caste: otherProfile?.caste ?? null,
      motherTongue: otherProfile?.mother_tongue ?? null,
      diet: otherProfile?.diet ?? null,
      smoking: otherProfile?.smoking ?? null,
      drinking: otherProfile?.drinking ?? null,
      exerciseFrequency: otherProfile?.exercise_frequency ?? null,
      marriageTimeline: otherProfile?.marriage_timeline ?? null,
      childrenPreference: otherProfile?.children_preference ?? null,
      livingArrangement: otherProfile?.living_arrangement_preference ?? null,
      settlementPreference: otherProfile?.settlement_preference ?? null,
      personalitySummary: otherProfile?.ai_personality_summary ?? null,
      medicalDegree: otherCreds?.medical_degree ?? null,
      specialty: otherCreds?.primary_specialty ?? null,
      yearsOfExperience: otherCreds?.years_of_experience ?? null,
      designation: otherCreds?.current_designation ?? null,
      hobbies: otherInterests?.hobbies ?? [],
      photos: photoUrls,
    },
  });
}
