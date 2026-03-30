import { NextRequest, NextResponse } from 'next/server';
import { requireApplicant } from '@/lib/app/auth';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/rate-limit';

// Fields users are allowed to edit on their own profile
const EDITABLE_PROFILE_FIELDS = new Set([
  'current_city',
  'current_state',
  'current_country',
  'diet',
  'smoking',
  'drinking',
  'exercise_frequency',
  'marriage_timeline',
  'children_preference',
  'living_arrangement_preference',
  'settlement_preference',
  'hobbies',
]);

const EDITABLE_PARTNER_PREF_FIELDS = new Set([
  'preferred_age_min',
  'preferred_age_max',
  'preferred_location',
  'preferred_specialties',
  'preferred_diet',
  'preferred_smoking',
  'preferred_drinking',
]);

export async function GET() {
  const result = await requireApplicant();
  if (result.error) return result.error;

  const userId = result.user.id;
  const supabase = await createClient();

  // Fetch profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (profileError || !profile) {
    return NextResponse.json(
      { error: 'Profile not found. Please complete onboarding first.' },
      { status: 404 }
    );
  }

  // Fetch medical credentials
  const { data: creds } = await supabase
    .from('medical_credentials')
    .select('*')
    .eq('user_id', userId)
    .single();

  // Fetch partner preferences
  const { data: prefs } = await supabase
    .from('partner_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  // Fetch compatibility profile
  const { data: compat } = await supabase
    .from('compatibility_profiles' as never)
    .select('ai_personality_summary, spider_web_scores')
    .eq('user_id', userId)
    .single();

  // Fetch photos with signed URLs — user sees their own originals
  const { data: photosRaw } = await supabase
    .from('photos')
    .select('id, storage_path, is_primary, photo_type')
    .eq('user_id', userId)
    .order('is_primary', { ascending: false });
  const photos = photosRaw as Array<Record<string, unknown>> | null;

  const photoUrls: Array<{ id: string; url: string; isPrimary: boolean; type: string }> = [];
  if (photos) {
    for (const photo of photos) {
      if (photo.storage_path) {
        const { data: signedData } = await supabase.storage
          .from('photos')
          .createSignedUrl(photo.storage_path as string, 3600);
        if (signedData?.signedUrl) {
          photoUrls.push({
            id: photo.id as string,
            url: signedData.signedUrl,
            isPrimary: photo.is_primary as boolean,
            type: photo.photo_type as string,
          });
        }
      }
    }
  }

  return NextResponse.json({
    profile: profile ?? null,
    medicalCredentials: creds ?? null,
    partnerPreferences: prefs ?? null,
    personalitySummary: (compat as Record<string, unknown> | null)?.ai_personality_summary ?? null,
    spiderWebScores: (compat as Record<string, unknown> | null)?.spider_web_scores ?? null,
    photos: photoUrls,
  });
}

export async function PATCH(request: NextRequest) {
  const result = await requireApplicant();
  if (result.error) return result.error;

  const userId = result.user.id;

  // Rate limit: 30 profile updates per hour per user
  const { allowed } = checkRateLimit(`profile-patch:${userId}`, 30, 3600_000);
  if (!allowed) {
    return NextResponse.json({ error: 'Too many updates. Please try again later.' }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const supabase = await createClient();

  const profileUpdates: Record<string, unknown> = {};
  const partnerPrefUpdates: Record<string, unknown> = {};

  // Filter to only allowed fields with value validation
  if (body.profile && typeof body.profile === 'object') {
    for (const [key, value] of Object.entries(body.profile)) {
      if (EDITABLE_PROFILE_FIELDS.has(key)) {
        // Only allow strings (max 200 chars), null, or arrays (hobbies)
        if (value === null) {
          profileUpdates[key] = value;
        } else if (typeof value === 'string' && value.length <= 200) {
          profileUpdates[key] = value;
        } else if (key === 'hobbies' && Array.isArray(value)) {
          profileUpdates[key] = (value as unknown[]).filter((h) => typeof h === 'string' && h.length <= 100).slice(0, 50);
        }
      }
    }
  }

  if (body.partnerPreferences && typeof body.partnerPreferences === 'object') {
    for (const [key, value] of Object.entries(body.partnerPreferences)) {
      if (EDITABLE_PARTNER_PREF_FIELDS.has(key)) {
        // Validate value types: null, strings (max 200 chars), numbers, or arrays of strings
        if (value === null) {
          partnerPrefUpdates[key] = value;
        } else if (typeof value === 'string' && value.length <= 200) {
          partnerPrefUpdates[key] = value;
        } else if (typeof value === 'number' && Number.isFinite(value)) {
          partnerPrefUpdates[key] = value;
        } else if (Array.isArray(value)) {
          partnerPrefUpdates[key] = (value as unknown[]).filter((v) => typeof v === 'string' && v.length <= 100).slice(0, 50);
        }
      }
    }
  }

  const errors: string[] = [];

  // Update profile fields
  if (Object.keys(profileUpdates).length > 0) {
    const { error } = await supabase
      .from('profiles')
      .update(profileUpdates)
      .eq('user_id', userId);
    if (error) {
      console.error('Profile update error:', error.message);
      errors.push('Profile update failed');
    }
  }

  // Update partner preference fields
  if (Object.keys(partnerPrefUpdates).length > 0) {
    const { error } = await supabase
      .from('partner_preferences')
      .update(partnerPrefUpdates)
      .eq('user_id', userId);
    if (error) {
      console.error('Partner preferences update error:', error.message);
      errors.push('Partner preferences update failed');
    }
  }

  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join('; ') }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
