import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { QUESTIONS } from '@/lib/form/questions';
import type { FormAnswers } from '@/lib/form/types';

export interface HydratedForm {
  userId: string;
  email: string;
  answers: FormAnswers;
  gateAnswers: Record<string, string>;
  chatState: Record<string, unknown>;
  resumeQuestionNumber: number;
  resumeSection: string;
  isAlreadySubmitted: boolean;
}

/**
 * Loads everything the form needs from Supabase for the current authenticated user
 * and returns it in the FormProvider-ready shape. Used by every onboarding section
 * page and the resume redirect.
 *
 * Throws if the user is unauthenticated or the users row is missing — callers
 * should redirect on the unauth case before invoking this.
 */
export async function hydrateOnboardingForm(): Promise<HydratedForm | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Capture here so the nested function closes over a definitely-non-null string.
  const userId = user.id;

  // Retry up to 2 extra times on transient Supabase failures before throwing.
  type QueryResults = Awaited<ReturnType<typeof fetchAll>>;
  async function fetchAll() {
    return Promise.all([
      supabase.from('users').select('*').eq('id', userId).single(),
      supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('medical_credentials').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('partner_preferences').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('compatibility_profiles').select('chat_state').eq('user_id', userId).maybeSingle(),
      supabase.from('photos').select('id, is_primary').eq('user_id', userId).order('display_order'),
      supabase.from('documents').select('id, document_type').eq('user_id', userId),
    ] as const);
  }

  let results: QueryResults | null = null;
  let lastError: string | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) await new Promise((r) => setTimeout(r, 400 * attempt));
    try {
      const r = await fetchAll();
      if (!r[0].error && r[0].data) { results = r; break; }
      lastError = r[0].error?.message ?? 'no user row found';
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
    }
  }

  if (!results) {
    throw new Error(`Failed to load user data: ${lastError}`);
  }

  const [
    usersResult,
    profilesResult,
    medicalResult,
    partnerPrefsResult,
    compatResult,
    photosResult,
    documentsResult,
  ] = results;

  const userData = usersResult.data;
  const profileData = profilesResult.data;
  const medicalData = medicalResult.data;
  const partnerPrefsData = partnerPrefsResult.data;

  const answers: FormAnswers = {};

  // Q3 (email) and Q4 (phone) live in auth.users, not in profiles
  answers['Q3'] = user.email || '';
  answers['Q4'] = user.phone || '';

  for (const q of QUESTIONS) {
    if (q.id === 'Q3' || q.id === 'Q4') continue;
    if (q.targetTable === 'local') continue;
    if (q.type === 'claude_chat' || q.type === 'file_upload') continue;

    const row = pickRow(q.targetTable, {
      profiles: profileData,
      medical_credentials: medicalData,
      partner_preferences: partnerPrefsData,
      users: userData,
    });

    if (!row) continue;

    if (q.type === 'range' && q.targetColumn2) {
      const min = (row as Record<string, unknown>)[q.targetColumn];
      const max = (row as Record<string, unknown>)[q.targetColumn2];
      if (min !== null && min !== undefined) {
        answers[q.id] = [min, max ?? null];
      }
    } else if (q.type === 'dual_location' && q.targetColumn2 && q.targetColumn3) {
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
        if (q.type === 'multi_select') {
          // Guard against corrupt DB rows where an array column was written as a string.
          answers[q.id] = Array.isArray(val) ? val : [];
        } else {
          answers[q.id] = typeof val === 'boolean' ? String(val) : val;
        }
      }
    }
  }

  const gateAnswers = (userData?.gate_answers ?? {}) as Record<string, string>;
  for (const [qId, val] of Object.entries(gateAnswers)) {
    answers[qId] = val;
  }

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

  // onboarding_section is stored as a 1-indexed integer (1=A, 2=B, …, 14=N).
  // Convert it back to a letter so all downstream routing code gets a valid SectionId.
  const rawSection = userData?.onboarding_section;
  const resumeSection = (() => {
    if (!rawSection) return 'A';
    const idx = Number(rawSection) - 1;
    if (idx >= 0 && idx <= 13) return 'ABCDEFGHIJKLMN'[idx] ?? 'A';
    // Future-proof: if stored as a letter already, pass it through
    const letter = String(rawSection).toUpperCase();
    return /^[A-N]$/.test(letter) ? letter : 'A';
  })();

  return {
    userId: user.id,
    email: user.email || '',
    answers,
    gateAnswers,
    chatState: (compatResult.data?.chat_state as Record<string, unknown>) || {},
    resumeQuestionNumber: userData?.onboarding_last_question || 1,
    resumeSection,
    isAlreadySubmitted: userData?.membership_status === 'onboarding_complete',
  };
}

function pickRow(
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
