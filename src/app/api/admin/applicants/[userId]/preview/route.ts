import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, validateUserId } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const result = await requireAdmin();
  if (result.error) return result.error;

  const { userId } = await params;
  const idError = validateUserId(userId);
  if (idError) return idError;

  const adminSupabase = createAdminClient();

  const [
    userResult,
    profileResult,
    medicalResult,
    photoResult,
    authResult,
    compatResult,
    partnerPrefsResult,
    docsResult,
    latestNoteResult,
    matchSuggestionsResult,
    matchPresentationsResult,
  ] = await Promise.all([
    adminSupabase
      .from('users')
      .select('payment_status, membership_status, is_bgv_complete, bgv_flagged, is_goocampus_member, created_at')
      .eq('id', userId)
      .single(),
    adminSupabase
      .from('profiles')
      .select('first_name, last_name, gender, date_of_birth, current_city, current_state, religion, marital_status, height_cm')
      .eq('user_id', userId)
      .maybeSingle(),
    adminSupabase
      .from('medical_credentials')
      .select('current_status, specialty, current_designation')
      .eq('user_id', userId)
      .maybeSingle(),
    adminSupabase
      .from('photos')
      .select('blurred_path, storage_path')
      .eq('user_id', userId)
      .eq('is_primary', true)
      .maybeSingle(),
    adminSupabase.auth.admin.getUserById(userId),
    adminSupabase
      .from('compatibility_profiles')
      .select('ai_personality_summary, ai_compatibility_keywords')
      .eq('user_id', userId)
      .maybeSingle(),
    adminSupabase
      .from('partner_preferences')
      .select('preferred_age_min, preferred_age_max, preferred_indian_states, no_location_preference, preferred_specialties, prefers_specific_specialty, preferred_mother_tongue, family_type_preference, partner_qualities')
      .eq('user_id', userId)
      .maybeSingle(),
    adminSupabase
      .from('documents')
      .select('verification_status')
      .eq('user_id', userId),
    adminSupabase
      .from('admin_notes' as never)
      .select('note_text, created_at, admin_user_id')
      .eq('entity_type' as never, 'user' as never)
      .eq('entity_id' as never, userId as never)
      .order('created_at' as never, { ascending: false })
      .limit(1)
      .maybeSingle(),
    adminSupabase
      .from('match_suggestions' as never)
      .select('id, admin_status')
      .or(`profile_a_id.eq.${userId},profile_b_id.eq.${userId}` as never),
    adminSupabase
      .from('match_presentations' as never)
      .select('status, match_suggestion_id')
      .in(
        'match_suggestion_id' as never,
        ['00000000-0000-0000-0000-000000000000'] as never
      ),
  ]);

  if (userResult.error || !userResult.data) {
    return NextResponse.json({ error: 'Applicant not found' }, { status: 404 });
  }

  // Signed URL for blurred photo
  let photoUrl: string | null = null;
  const blurredPath = photoResult.data?.blurred_path ?? photoResult.data?.storage_path;
  if (blurredPath) {
    const { data: signed } = await adminSupabase.storage
      .from('photos')
      .createSignedUrl(blurredPath, 3600);
    photoUrl = signed?.signedUrl ?? null;
  }

  // Age from DOB
  let age: number | null = null;
  const dob = profileResult.data?.date_of_birth;
  if (dob) {
    const birth = new Date(dob);
    const now = new Date();
    age = now.getFullYear() - birth.getFullYear();
    if (
      now.getMonth() < birth.getMonth() ||
      (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())
    ) {
      age -= 1;
    }
  }

  // Match stats — re-query presentations with the actual suggestion IDs
  const suggestionIds = ((matchSuggestionsResult.data ?? []) as Array<{ id: string }>).map((s) => s.id);
  let presentationRows: Array<{ status: string }> = [];
  if (suggestionIds.length > 0) {
    const { data: presentations } = await adminSupabase
      .from('match_presentations' as never)
      .select('status')
      .in('match_suggestion_id' as never, suggestionIds as never);
    presentationRows = (presentations ?? []) as Array<{ status: string }>;
  }

  const suggestions = matchSuggestionsResult.data ?? [];
  const totalSuggestions = suggestions.length;
  const approvedSuggestions = suggestions.filter((s: { admin_status: string }) => s.admin_status === 'approved').length;
  const totalPresented = presentationRows.length;
  const mutualInterest = presentationRows.filter((p) => p.status === 'mutual_interest').length;
  const pendingResponse = presentationRows.filter((p) => p.status === 'pending').length;

  // Document stats
  const docs = docsResult.data ?? [];
  const totalDocs = docs.length;
  const verifiedDocs = docs.filter((d: { verification_status: string }) => d.verification_status === 'verified').length;
  const pendingDocs = docs.filter((d: { verification_status: string }) => d.verification_status === 'pending').length;
  const rejectedDocs = docs.filter((d: { verification_status: string }) => d.verification_status === 'rejected').length;

  // Partner prefs snapshot
  const pp = partnerPrefsResult.data;
  const partnerPrefs = pp ? {
    ageMin: pp.preferred_age_min ?? null,
    ageMax: pp.preferred_age_max ?? null,
    states: pp.no_location_preference ? [] : (pp.preferred_indian_states ?? []),
    noLocationPreference: pp.no_location_preference ?? false,
    specialties: pp.preferred_specialties ?? [],
    prefersSpecificSpecialty: pp.prefers_specific_specialty ?? false,
    motherTongue: pp.preferred_mother_tongue ?? [],
    familyType: pp.family_type_preference ?? null,
    partnerQualities: pp.partner_qualities ?? [],
  } : null;

  const specialty = medicalResult.data?.specialty;

  return NextResponse.json({
    id: userId,
    // User flags
    paymentStatus: userResult.data.payment_status,
    membershipStatus: userResult.data.membership_status,
    isBgvComplete: userResult.data.is_bgv_complete,
    bgvFlagged: userResult.data.bgv_flagged,
    isGooCampusMember: userResult.data.is_goocampus_member,
    createdAt: userResult.data.created_at,
    // Profile
    firstName: profileResult.data?.first_name ?? null,
    lastName: profileResult.data?.last_name ?? null,
    gender: profileResult.data?.gender ?? null,
    age,
    city: profileResult.data?.current_city ?? null,
    state: profileResult.data?.current_state ?? null,
    religion: profileResult.data?.religion ?? null,
    maritalStatus: profileResult.data?.marital_status ?? null,
    heightCm: profileResult.data?.height_cm ?? null,
    // Medical
    medicalStatus: medicalResult.data?.current_status ?? null,
    specialty: Array.isArray(specialty) ? specialty.join(', ') : (specialty ?? null),
    designation: medicalResult.data?.current_designation ?? null,
    // Auth
    email: authResult.data.user?.email ?? null,
    phone: authResult.data.user?.phone ?? null,
    // Photo
    photoUrl,
    // Compatibility
    personalitySummary: compatResult.data?.ai_personality_summary ?? null,
    compatibilityKeywords: compatResult.data?.ai_compatibility_keywords ?? [],
    // Partner preferences
    partnerPrefs,
    // Match stats
    matchStats: {
      totalSuggestions,
      approvedSuggestions,
      totalPresented,
      mutualInterest,
      pendingResponse,
    },
    // Document stats
    docStats: { totalDocs, verifiedDocs, pendingDocs, rejectedDocs },
    // Latest team note
    latestNote: latestNoteResult.data
      ? {
          text: (latestNoteResult.data as { note_text: string }).note_text,
          createdAt: (latestNoteResult.data as { created_at: string }).created_at,
        }
      : null,
  });
}
