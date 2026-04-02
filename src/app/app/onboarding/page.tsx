import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { FormShell } from '@/components/form/FormShell';
import { QUESTIONS } from '@/lib/form/questions';
import type { FormAnswers } from '@/lib/form/types';

/**
 * Server component: loads the user's saved form data from all relevant tables,
 * maps DB columns back to the FormAnswers format, and hydrates FormShell.
 */
export default async function OnboardingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login?next=/app/onboarding');
  }

  // Fetch all relevant data in parallel
  const [usersResult, profilesResult, medicalResult, partnerPrefsResult, compatResult, photosResult, documentsResult] =
    await Promise.all([
      supabase.from('users').select('*').eq('id', user.id).single(),
      supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle(),
      supabase
        .from('medical_credentials')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle(),
      supabase
        .from('partner_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle(),
      supabase
        .from('compatibility_profiles')
        .select('chat_state')
        .eq('user_id', user.id)
        .maybeSingle(),
      supabase
        .from('photos')
        .select('id, is_primary')
        .eq('user_id', user.id)
        .order('display_order'),
      supabase
        .from('documents')
        .select('id, document_type')
        .eq('user_id', user.id),
    ]);

  // Users row must exist for authenticated users — fail loudly if missing
  if (usersResult.error || !usersResult.data) {
    throw new Error(
      `Failed to load user data: ${usersResult.error?.message ?? 'no user row found'}`
    );
  }

  const userData = usersResult.data;
  const profileData = profilesResult.data;
  const medicalData = medicalResult.data;
  const partnerPrefsData = partnerPrefsResult.data;

  // Build the answers map by reverse-mapping DB columns to question IDs
  const answers: FormAnswers = {};

  // Pre-fill Q3 (email) from auth
  answers['Q3'] = user.email || '';
  // Pre-fill Q4 (phone) from auth
  answers['Q4'] = user.phone || '';

  // Map each question's DB column back to its answer
  for (const q of QUESTIONS) {
    if (q.id === 'Q3' || q.id === 'Q4') continue; // Already handled
    if (q.targetTable === 'local') continue; // Gate questions — inferred below
    if (q.type === 'claude_chat' || q.type === 'file_upload') continue; // Handled separately

    const row = getRowForTable(q.targetTable, {
      profiles: profileData,
      medical_credentials: medicalData,
      partner_preferences: partnerPrefsData,
      users: userData,
    });

    if (!row) continue;

    if (q.type === 'range' && q.targetColumn2) {
      // Range inputs: reconstruct [min, max] tuple
      const min = (row as Record<string, unknown>)[q.targetColumn];
      const max = (row as Record<string, unknown>)[q.targetColumn2];
      if (min !== null && min !== undefined) {
        answers[q.id] = [min, max ?? null];
      }
    } else if (q.type === 'dual_location' && q.targetColumn2 && q.targetColumn3) {
      // Dual location: reconstruct {states, countries, noPreference}
      const states = (row as Record<string, unknown>)[q.targetColumn];
      const countries = (row as Record<string, unknown>)[q.targetColumn2];
      const noPreference = (row as Record<string, unknown>)[q.targetColumn3];
      if (states || countries || noPreference) {
        answers[q.id] = {
          states: (states as string[]) || [],
          countries: (countries as string[]) || [],
          noPreference: noPreference === true,
        };
      }
    } else if (q.type === 'international_location' && q.targetColumn2) {
      // International location: reconstruct {city, country}
      const city = (row as Record<string, unknown>)[q.targetColumn];
      const country = (row as Record<string, unknown>)[q.targetColumn2];
      if (city || country) {
        answers[q.id] = {
          city: (city as string) || '',
          country: (country as string) || '',
        };
      }
    } else {
      const val = (row as Record<string, unknown>)[q.targetColumn];
      if (val !== null && val !== undefined) {
        // Convert booleans back to string form for form state
        if (typeof val === 'boolean') {
          answers[q.id] = String(val);
        } else {
          answers[q.id] = val;
        }
      }
    }
  }

  // Load gate question answers from the persisted gate_answers JSONB column
  const gateAnswers = (userData?.gate_answers ?? {}) as Record<string, string>;
  for (const [qId, val] of Object.entries(gateAnswers)) {
    answers[qId] = val;
  }

  // Hydrate file upload answers (photo/document IDs for NavigationButtons validation)
  const photos = photosResult.data || [];
  const documents = documentsResult.data || [];

  const primaryPhotoIds = photos.filter((p) => p.is_primary).map((p) => p.id);
  if (primaryPhotoIds.length > 0) answers['Q95'] = primaryPhotoIds;

  const profilePhotoIds = photos.filter((p) => !p.is_primary).map((p) => p.id);
  if (profilePhotoIds.length > 0) answers['Q96'] = profilePhotoIds;

  const identityDocIds = documents
    .filter((d) => d.document_type === 'identity_document')
    .map((d) => d.id);
  if (identityDocIds.length > 0) answers['Q97'] = identityDocIds;

  const kundaliDocIds = documents
    .filter((d) => d.document_type === 'kundali')
    .map((d) => d.id);
  if (kundaliDocIds.length > 0) answers['Q98'] = kundaliDocIds;

  const resumeQuestion = userData?.onboarding_last_question || 1;
  const chatState = (compatResult.data?.chat_state as Record<string, unknown>) || {};
  const isAlreadySubmitted = userData?.membership_status === 'onboarding_complete';

  return (
    <FormShell
      userId={user.id}
      initialAnswers={answers}
      initialGateAnswers={gateAnswers}
      initialChatState={chatState}
      resumeQuestionNumber={resumeQuestion}
      isAlreadySubmitted={isAlreadySubmitted}
      isEditMode={isAlreadySubmitted}
    />
  );
}

function getRowForTable(
  table: string,
  data: {
    profiles: Record<string, unknown> | null;
    medical_credentials: Record<string, unknown> | null;
    partner_preferences: Record<string, unknown> | null;
    users: Record<string, unknown> | null;
  }
): Record<string, unknown> | null {
  switch (table) {
    case 'profiles':
      return data.profiles;
    case 'medical_credentials':
      return data.medical_credentials;
    case 'partner_preferences':
      return data.partner_preferences;
    case 'users':
      return data.users;
    default:
      return null;
  }
}
