/**
 * Maps Supabase data → Airtable field format.
 * Supabase is source of truth. Airtable is read-only copy.
 */

import { upsertRecords } from './client';
import { createAdminClient } from '@/lib/supabase/admin';

interface SyncResult {
  applicants: number;
  credentials: number;
  preferences: number;
  bgv: number;
  total: number;
}

/**
 * Full sync: fetches all applicant data from Supabase and upserts to Airtable.
 */
export async function fullSync(): Promise<SyncResult> {
  const adminSupabase = createAdminClient();

  // Fetch all applicants with profiles
  const { data: users } = await adminSupabase
    .from('users')
    .select('id, payment_status, membership_status, bgv_consent, is_goocampus_member, is_bgv_complete, created_at, updated_at')
    .eq('role', 'applicant' as never);

  if (!users || users.length === 0) {
    return { applicants: 0, credentials: 0, preferences: 0, bgv: 0, total: 0 };
  }

  const userIds = users.map((u) => u.id);

  // Fetch all related data in parallel
  const [profilesResult, credentialsResult, preferencesResult, bgvResult, authResult] = await Promise.all([
    adminSupabase.from('profiles').select('*').in('user_id', userIds),
    adminSupabase.from('medical_credentials').select('*').in('user_id', userIds),
    adminSupabase.from('partner_preferences').select('*').in('user_id', userIds),
    adminSupabase.from('bgv_checks' as never).select('*').in('user_id' as never, userIds),
    adminSupabase.auth.admin.listUsers({ perPage: 1000 }),
  ]);

  const profiles = profilesResult.data || [];
  const credentials = credentialsResult.data || [];
  const preferences = preferencesResult.data || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bgvChecks = (bgvResult.data || []) as any[];
  const emailMap = new Map(
    (authResult.data?.users || []).map((u) => [u.id, u.email || ''])
  );

  const profileMap = new Map(profiles.map((p) => [p.user_id, p]));
  const credentialMap = new Map(credentials.map((c) => [c.user_id, c]));
  const preferenceMap = new Map(preferences.map((p) => [p.user_id, p]));

  // 1. Sync Applicants table
  const applicantRecords = users.map((user) => {
    const profile = profileMap.get(user.id);
    return {
      fields: {
        user_id: user.id,
        first_name: profile?.first_name || '',
        last_name: profile?.last_name || '',
        email: emailMap.get(user.id) || '',
        gender: profile?.gender || '',
        date_of_birth: profile?.date_of_birth || '',
        current_city: profile?.current_city || '',
        current_state: profile?.current_state || '',
        payment_status: user.payment_status || '',
        membership_status: user.membership_status || '',
        is_goocampus: user.is_goocampus_member || false,
        bgv_consent: user.bgv_consent || '',
        bgv_complete: user.is_bgv_complete || false,
        submitted_at: user.updated_at || '',
        registered_at: user.created_at || '',
      },
    };
  });

  const applicantResult = await upsertRecords('Applicants', applicantRecords, ['user_id']);

  // 2. Sync Medical Credentials table
  const credentialRecords = credentials.map((cred) => ({
    fields: {
      user_id: cred.user_id,
      specialty: Array.isArray(cred.specialty) ? cred.specialty.join(', ') : '',
      current_status: cred.current_status || '',
      current_designation: cred.current_designation || '',
      work_experience: JSON.stringify(cred.work_experience || []),
    },
  }));

  const credentialResult = credentialRecords.length > 0
    ? await upsertRecords('Medical Credentials', credentialRecords, ['user_id'])
    : { created: 0, updated: 0 };

  // 3. Sync Partner Preferences table
  const preferenceRecords = preferences.map((pref) => ({
    fields: {
      user_id: pref.user_id,
      preferred_age_min: pref.preferred_age_min || null,
      preferred_age_max: pref.preferred_age_max || null,
      preferred_specialties: Array.isArray(pref.preferred_specialties) ? pref.preferred_specialties.join(', ') : '',
      preferred_states: Array.isArray(pref.preferred_indian_states) ? pref.preferred_indian_states.join(', ') : '',
    },
  }));

  const preferenceResult = preferenceRecords.length > 0
    ? await upsertRecords('Partner Preferences', preferenceRecords, ['user_id'])
    : { created: 0, updated: 0 };

  // 4. Sync BGV Checks — flatten per user
  const bgvByUser = new Map<string, Record<string, string>>();
  for (const check of bgvChecks) {
    if (!bgvByUser.has(check.user_id)) {
      bgvByUser.set(check.user_id, { user_id: check.user_id });
    }
    const entry = bgvByUser.get(check.user_id)!;
    entry[`bgv_${check.check_type}`] = check.status;
  }

  const bgvRecords = Array.from(bgvByUser.values()).map((entry) => ({
    fields: entry,
  }));

  const bgvSyncResult = bgvRecords.length > 0
    ? await upsertRecords('BGV', bgvRecords, ['user_id'])
    : { created: 0, updated: 0 };

  const totalRecords =
    applicantResult.created + applicantResult.updated +
    credentialResult.created + credentialResult.updated +
    preferenceResult.created + preferenceResult.updated +
    bgvSyncResult.created + bgvSyncResult.updated;

  return {
    applicants: applicantResult.created + applicantResult.updated,
    credentials: credentialResult.created + credentialResult.updated,
    preferences: preferenceResult.created + preferenceResult.updated,
    bgv: bgvSyncResult.created + bgvSyncResult.updated,
    total: totalRecords,
  };
}

/**
 * Sync a single user record to Airtable.
 * Used by the webhook handler for real-time sync.
 */
export async function syncSingleUser(userId: string): Promise<void> {
  const adminSupabase = createAdminClient();

  const [userResult, profileResult, authResult] = await Promise.all([
    adminSupabase.from('users').select('*').eq('id', userId).single(),
    adminSupabase.from('profiles').select('*').eq('user_id', userId).single(),
    adminSupabase.auth.admin.getUserById(userId),
  ]);

  const user = userResult.data;
  const profile = profileResult.data;
  if (!user) return;

  await upsertRecords('Applicants', [{
    fields: {
      user_id: user.id,
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
      email: authResult.data?.user?.email || '',
      gender: profile?.gender || '',
      current_city: profile?.current_city || '',
      current_state: profile?.current_state || '',
      payment_status: user.payment_status || '',
      membership_status: user.membership_status || '',
      is_goocampus: user.is_goocampus_member || false,
      bgv_consent: user.bgv_consent || '',
      bgv_complete: user.is_bgv_complete || false,
    },
  }], ['user_id']);
}
