import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { ProfileHeader } from '@/components/admin/profile/ProfileHeader';
import { IdentitySnapshot } from '@/components/admin/profile/IdentitySnapshot';
import { FamilyBackground } from '@/components/admin/profile/FamilyBackground';
import { EducationCareer } from '@/components/admin/profile/EducationCareer';
import { LifestyleSnapshot } from '@/components/admin/profile/LifestyleSnapshot';
import { InterestsBlock } from '@/components/admin/profile/InterestsBlock';
import { GoalsValues } from '@/components/admin/profile/GoalsValues';
import { CompatibilityProfile } from '@/components/admin/profile/CompatibilityProfile';
import { PersonalitySummary } from '@/components/admin/profile/PersonalitySummary';
import { PartnerPreferences } from '@/components/admin/profile/PartnerPreferences';
import { TeamNotes } from '@/components/admin/profile/TeamNotes';
import { ClosingNote } from '@/components/admin/profile/ClosingNote';
import { StatusManagement } from '@/components/admin/profile/StatusManagement';
import type { WorkExperienceEntry } from '@/lib/form/types';

export default async function ApplicantDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;

  // Auth check
  const supabase = await createClient();
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();
  if (!currentUser) redirect('/auth/login');

  const adminSupabase = createAdminClient();

  // Fetch all data in parallel
  const [
    userResult,
    profileResult,
    medicalResult,
    partnerPrefsResult,
    compatResult,
    photosResult,
    notesResult,
    authUserResult,
  ] = await Promise.all([
    adminSupabase.from('users').select('*').eq('id', userId).single(),
    adminSupabase.from('profiles').select('*').eq('user_id', userId).single(),
    adminSupabase.from('medical_credentials').select('*').eq('user_id', userId).single(),
    adminSupabase.from('partner_preferences').select('*').eq('user_id', userId).single(),
    adminSupabase.from('compatibility_profiles').select('*').eq('user_id', userId).single(),
    adminSupabase.from('photos').select('*').eq('user_id', userId).order('display_order'),
    adminSupabase.from('admin_notes' as never).select('*').eq('entity_type', 'user' as never).eq('entity_id', userId as never).order('created_at' as never, { ascending: false }),
    adminSupabase.auth.admin.getUserById(userId),
  ]);

  const userData = userResult.data;
  if (!userData) notFound();

  const profile = profileResult.data;
  const medical = medicalResult.data;
  const partnerPrefs = partnerPrefsResult.data;
  const compat = compatResult.data;
  const photos = photosResult.data || [];
  const rawNotes = (notesResult as { data: Array<{ id: string; note_text: string; admin_user_id: string; created_at: string }> | null }).data || [];
  const authUser = authUserResult.data?.user;

  // Get signed URLs for all photos (admin sees originals/unblurred)
  const allPhotoUrls: Array<{ id: string; url: string; photoType: string; isPrimary: boolean }> = [];
  for (const photo of photos) {
    if (!photo.storage_path) continue;
    const { data: signedData } = await adminSupabase.storage
      .from('photos')
      .createSignedUrl(photo.storage_path, 86400); // 24 hours
    const rowAny = photo as typeof photo & { photo_type?: string | null };
    allPhotoUrls.push({
      id: photo.id,
      url: signedData?.signedUrl || '',
      photoType: rowAny.photo_type || 'additional',
      isPrimary: photo.is_primary,
    });
  }
  const photoUrl = allPhotoUrls.find((p) => p.isPrimary)?.url || allPhotoUrls[0]?.url || null;

  // Calculate age from DOB (server component — Date access is safe here)
  const dob = profile?.date_of_birth;
  // eslint-disable-next-line react-hooks/purity
  const age = dob ? Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : null;

  // Parse work experience
  const workExperience: WorkExperienceEntry[] = Array.isArray(medical?.work_experience)
    ? (medical.work_experience as unknown as WorkExperienceEntry[])
    : [];

  // Build compatibility dimensions
  const dimensions = [
    { label: 'Family', score: compat?.family_orientation_score ?? null, notes: compat?.family_orientation_notes ?? null },
    { label: 'Career', score: compat?.career_ambition_score ?? null, notes: compat?.career_ambition_notes ?? null },
    { label: 'Independence', score: compat?.independence_vs_togetherness_score ?? null, notes: compat?.independence_vs_togetherness_notes ?? null },
    { label: 'Emotional', score: compat?.emotional_expressiveness_score ?? null, notes: compat?.emotional_expressiveness_notes ?? null },
    { label: 'Social', score: compat?.social_orientation_score ?? null, notes: compat?.social_orientation_notes ?? null },
    { label: 'Traditional', score: compat?.traditionalism_score ?? null, notes: compat?.traditionalism_notes ?? null },
    { label: 'Relocation', score: compat?.relocation_openness_score ?? null, notes: compat?.relocation_openness_notes ?? null },
    { label: 'Life Pace', score: compat?.life_pace_score ?? null, notes: compat?.life_pace_notes ?? null },
  ];

  // Format notes
  const formattedNotes = rawNotes.map((n) => ({
    id: n.id,
    noteText: n.note_text,
    adminName: n.admin_user_id === currentUser.id ? 'You' : 'Admin',
    createdAt: n.created_at,
  }));

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <Link
          href="/admin/applicants"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          &larr; Back to Applicants
        </Link>
      </div>

      <div className="space-y-4">
        <ProfileHeader
          firstName={profile?.first_name || 'Unknown'}
          lastName={profile?.last_name || ''}
          age={age}
          gender={profile?.gender || null}
          currentCity={profile?.current_city || null}
          currentState={profile?.current_state || null}
          currentCountry={profile?.current_country || null}
          medicalStatus={medical?.current_status || null}
          specialty={Array.isArray(medical?.specialty) ? medical.specialty : []}
          paymentStatus={userData.payment_status || 'unverified'}
          isGooCampusMember={userData.is_goocampus_member || false}
          isBgvComplete={userData.is_bgv_complete || false}
          bgvFlagged={userData.bgv_flagged || false}
          photoUrl={photoUrl}
          email={authUser?.email || ''}
          phone={authUser?.phone || ''}
        />

        {/* All Photos Gallery */}
        {allPhotoUrls.length > 1 && (
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900">All Photos ({allPhotoUrls.length})</h3>
            <div className="mt-3 grid grid-cols-4 gap-3">
              {allPhotoUrls.map((photo) => (
                <div key={photo.id} className="space-y-1">
                  <div className="overflow-hidden rounded-lg border border-gray-200">
                    <img src={photo.url} alt="" className="aspect-[3/4] w-full object-cover" />
                  </div>
                  <p className="text-center text-xs capitalize text-gray-500">
                    {photo.photoType.replace(/_/g, ' ')}
                    {photo.isPrimary && <span className="ml-1 text-rose-500">(Primary)</span>}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <IdentitySnapshot
          religion={profile?.religion || null}
          religiousObservance={profile?.religious_observance || null}
          motherTongue={profile?.mother_tongue || null}
          languagesSpoken={Array.isArray(profile?.languages_spoken) ? profile.languages_spoken : []}
          maritalStatus={profile?.marital_status || null}
          bloodGroup={profile?.blood_group || null}
          referralSource={profile?.referral_source || null}
          dateOfBirth={profile?.date_of_birth || null}
          believesInKundali={profile?.believes_in_kundali ?? null}
          casteComfort={profile?.caste_comfort ?? null}
          caste={profile?.caste || null}
        />

        <FamilyBackground
          fatherName={profile?.father_name || null}
          fatherOccupation={profile?.father_occupation || null}
          motherName={profile?.mother_name || null}
          motherOccupation={profile?.mother_occupation || null}
          siblingsCount={profile?.siblings_count ?? null}
          keyQuote={compat?.key_quote || null}
        />

        <EducationCareer
          medicalStatus={medical?.current_status || null}
          pgPlans={medical?.pg_plans || null}
          additionalQualifications={Array.isArray(medical?.additional_qualifications) ? medical.additional_qualifications : []}
          specialty={Array.isArray(medical?.specialty) ? medical.specialty : []}
          hasWorkExperience={medical?.has_work_experience ?? null}
          workExperience={workExperience}
          currentDesignation={medical?.current_designation || null}
          totalExperienceMonths={medical?.total_experience_months ?? null}
          linkedinUrl={medical?.linkedin_url || null}
          instagramHandle={medical?.instagram_handle || null}
        />

        <LifestyleSnapshot
          diet={profile?.diet || null}
          attire={profile?.attire_preference || null}
          fitness={profile?.fitness_habits || null}
          smoking={profile?.smoking || null}
          drinking={profile?.drinking || null}
          tattoos={profile?.tattoos_piercings || null}
          disability={profile?.has_disability || null}
          disabilityDescription={profile?.disability_description || null}
          hasAllergies={profile?.has_allergies ?? null}
          allergyDescription={profile?.allergy_description || null}
        />

        <InterestsBlock
          hobbies={Array.isArray(profile?.hobbies_interests) ? profile.hobbies_interests : []}
          hobbiesRegular={profile?.hobbies_regular || null}
        />

        <GoalsValues
          marriageTimeline={profile?.marriage_timeline || null}
          longDistanceComfort={profile?.long_distance_comfort || null}
          familyArrangement={profile?.post_marriage_family_arrangement || null}
          workingExpectation={profile?.both_partners_working_expectation || null}
          wantsChildren={profile?.wants_children || null}
          childrenCount={profile?.children_count_preference || null}
          childrenTiming={profile?.children_timing_preference || null}
          openToPartnerWithChildren={profile?.open_to_partner_with_children || null}
          settlementCountries={Array.isArray(profile?.preferred_settlement_countries) ? profile.preferred_settlement_countries : []}
          relocationOpenness={profile?.open_to_immediate_relocation || null}
          plansToGoAbroad={profile?.plans_to_go_abroad ?? null}
          abroadCountries={Array.isArray(profile?.abroad_countries) ? profile.abroad_countries : []}
        />

        <CompatibilityProfile
          dimensions={dimensions}
          communicationStyle={compat?.communication_style || null}
          conflictApproach={compat?.conflict_approach || null}
          partnerRoleVision={compat?.partner_role_vision || null}
          financialValues={compat?.financial_values || null}
        />

        <PersonalitySummary
          aiSummary={compat?.ai_personality_summary || null}
          compatibilityKeywords={Array.isArray(compat?.ai_compatibility_keywords) ? compat.ai_compatibility_keywords : []}
        />

        <PartnerPreferences
          ageMin={partnerPrefs?.preferred_age_min ?? null}
          ageMax={partnerPrefs?.preferred_age_max ?? null}
          heightMinCm={partnerPrefs?.preferred_height_min_cm ?? null}
          heightMaxCm={partnerPrefs?.preferred_height_max_cm ?? null}
          prefersSpecificSpecialty={partnerPrefs?.prefers_specific_specialty ?? null}
          preferredSpecialties={Array.isArray(partnerPrefs?.preferred_specialties) ? partnerPrefs.preferred_specialties : []}
          preferredCareerStage={Array.isArray(partnerPrefs?.preferred_career_stage) ? partnerPrefs.preferred_career_stage : []}
          preferredIndianStates={Array.isArray(partnerPrefs?.preferred_indian_states) ? partnerPrefs.preferred_indian_states : []}
          preferredCountries={Array.isArray(partnerPrefs?.preferred_countries) ? partnerPrefs.preferred_countries : []}
          noLocationPreference={partnerPrefs?.no_location_preference ?? false}
          preferredMotherTongue={Array.isArray(partnerPrefs?.preferred_mother_tongue) ? partnerPrefs.preferred_mother_tongue : []}
          bodyTypePreference={Array.isArray(partnerPrefs?.body_type_preference) ? partnerPrefs.body_type_preference : []}
          attirePreference={partnerPrefs?.attire_preference || null}
          dietPreference={Array.isArray(partnerPrefs?.diet_preference) ? partnerPrefs.diet_preference : []}
          fitnessPreference={partnerPrefs?.fitness_preference || null}
          smokingPreference={partnerPrefs?.smoking_preference || null}
          drinkingPreference={partnerPrefs?.drinking_preference || null}
          tattooPreference={partnerPrefs?.tattoo_preference || null}
          familyTypePreference={partnerPrefs?.family_type_preference || null}
          religiousObservancePreference={partnerPrefs?.religious_observance_preference || null}
          partnerCareerExpectation={partnerPrefs?.partner_career_expectation_after_marriage || null}
          partnerQualities={Array.isArray(partnerPrefs?.partner_qualities) ? partnerPrefs.partner_qualities : []}
          partnerQualitiesOther={partnerPrefs?.partner_qualities_other || null}
        />

        <TeamNotes
          userId={userId}
          aiRedFlags={compat?.ai_red_flags || null}
          notes={formattedNotes}
        />

        <ClosingNote closingNote={compat?.closing_freeform_note || null} />

        <StatusManagement
          userId={userId}
          paymentStatus={userData.payment_status || 'unverified'}
          membershipStatus={userData.membership_status || 'onboarding_pending'}
          bgvConsent={userData.bgv_consent || 'not_given'}
          isGooCampusMember={userData.is_goocampus_member || false}
          isBgvComplete={userData.is_bgv_complete || false}
        />
      </div>
    </div>
  );
}
