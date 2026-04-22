import { createAdminClient } from '@/lib/supabase/admin';
import { resolveToken } from './match-token';

export interface DimensionScore {
  key: string;
  label: string;
  scoreA: number;
  scoreB: number;
}

export interface ShareProfile {
  /** Only present in full tier */
  firstName?: string;
  age?: number;
  heightCm?: number;
  city?: string;
  state?: string;
  country?: string;
  religion?: string;
  marriageTimeline?: string;
  maritalStatus?: string;
  specialty?: string;
  designation?: string;
  experienceMonths?: number;
  /** Photo URL (signed, 1h expiry). Blurred in preview, original in full. */
  photoUrl?: string;
  /** Full tier extras */
  hobbies?: string[];
  diet?: string;
  smoking?: string;
  drinking?: string;
  fitnessHabits?: string;
  personalitySummary?: string;
  keyQuote?: string;
  allPhotoUrls?: string[];
}

export interface MatchShareData {
  tier: 'preview' | 'full';
  expiresAt: string;
  overallScore: number;
  recommendation?: string;
  highlights: string[];
  concerns: string[];
  matchNarrative?: string;
  dimensions: DimensionScore[];
  profileA: ShareProfile;
  profileB: ShareProfile;
}

const DIMENSION_MAP: { dbKey: string; label: string; chartKey: string }[] = [
  { dbKey: 'family_orientation', label: 'Family Orientation', chartKey: 'family_orientation' },
  { dbKey: 'career_ambition', label: 'Career Ambition', chartKey: 'career_ambition' },
  { dbKey: 'independence_vs_togetherness', label: 'Independence vs Togetherness', chartKey: 'independence_togetherness' },
  { dbKey: 'emotional_expressiveness', label: 'Emotional Expressiveness', chartKey: 'emotional_expressiveness' },
  { dbKey: 'social_orientation', label: 'Social Orientation', chartKey: 'social_orientation' },
  { dbKey: 'traditionalism', label: 'Traditionalism', chartKey: 'traditionalism' },
  { dbKey: 'relocation_openness', label: 'Relocation Openness', chartKey: 'relocation_openness' },
  { dbKey: 'life_pace', label: 'Life Pace', chartKey: 'life_pace' },
];

async function getSignedUrl(
  client: ReturnType<typeof createAdminClient>,
  path: string | null | undefined
): Promise<string | undefined> {
  if (!path) return undefined;
  const { data } = await client.storage
    .from('photos')
    .createSignedUrl(path, 3600);
  return data?.signedUrl ?? undefined;
}

function calcAge(dob: string | null | undefined): number | undefined {
  if (!dob) return undefined;
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
}

async function buildProfile(
  client: ReturnType<typeof createAdminClient>,
  userId: string,
  isRevealed: boolean
): Promise<ShareProfile> {
  const profile: ShareProfile = {};

  // Basic profile fields
  const { data: p } = await (client as unknown as {
    from: (t: string) => { select: (s: string) => { eq: (c: string, v: string) => { single: () => Promise<{ data: Record<string, unknown> | null }> } } }
  })
    .from('profiles')
    .select(isRevealed
      ? 'first_name, date_of_birth, height_cm, current_city, current_state, current_country, religion, marriage_timeline, marital_status, hobbies_interests, diet, smoking, drinking, fitness_habits'
      : 'date_of_birth, height_cm, current_city, current_state, current_country, religion, marriage_timeline, marital_status'
    )
    .eq('user_id', userId)
    .single();

  if (p) {
    if (isRevealed) profile.firstName = p.first_name as string | undefined;
    profile.age = calcAge(p.date_of_birth as string | null);
    profile.heightCm = p.height_cm as number | undefined;
    profile.city = p.current_city as string | undefined;
    profile.state = p.current_state as string | undefined;
    profile.country = p.current_country as string | undefined;
    profile.religion = p.religion as string | undefined;
    profile.marriageTimeline = p.marriage_timeline as string | undefined;
    profile.maritalStatus = p.marital_status as string | undefined;
    if (isRevealed) {
      const hi = p.hobbies_interests;
      profile.hobbies = hi ? (Array.isArray(hi) ? hi as string[] : [hi as string]) : [];
      profile.diet = p.diet as string | undefined;
      profile.smoking = p.smoking as string | undefined;
      profile.drinking = p.drinking as string | undefined;
      profile.fitnessHabits = p.fitness_habits as string | undefined;
    }
  }

  // Medical credentials
  const { data: mc } = await (client as unknown as {
    from: (t: string) => { select: (s: string) => { eq: (c: string, v: string) => { single: () => Promise<{ data: Record<string, unknown> | null }> } } }
  })
    .from('medical_credentials')
    .select('specialty, current_designation, total_experience_months')
    .eq('user_id', userId)
    .single();

  if (mc) {
    profile.specialty = mc.specialty as string | undefined;
    profile.designation = mc.current_designation as string | undefined;
    profile.experienceMonths = mc.total_experience_months as number | undefined;
  }

  // AI personality (full only)
  if (isRevealed) {
    const { data: cp } = await (client as unknown as {
      from: (t: string) => { select: (s: string) => { eq: (c: string, v: string) => { single: () => Promise<{ data: Record<string, unknown> | null }> } } }
    })
      .from('compatibility_profiles')
      .select('ai_personality_summary, key_quote')
      .eq('user_id', userId)
      .single();

    if (cp) {
      profile.personalitySummary = cp.ai_personality_summary as string | undefined;
      profile.keyQuote = cp.key_quote as string | undefined;
    }
  }

  // Photos
  const { data: photos } = await (client as unknown as {
    from: (t: string) => {
      select: (s: string) => {
        eq: (c: string, v: string) => {
          order: (c: string, opts: object) => Promise<{ data: Record<string, unknown>[] | null }>
        }
      }
    }
  })
    .from('photos')
    .select('storage_path, blurred_path, is_primary, display_order')
    .eq('user_id', userId)
    .order('display_order', { ascending: true });

  if (photos && photos.length > 0) {
    const primaryPhoto = photos.find((ph) => ph.is_primary) ?? photos[0];
    const rawPrimary = primaryPhoto as { storage_path?: string | null; blurred_path?: string | null };

    if (isRevealed) {
      profile.photoUrl = await getSignedUrl(client, rawPrimary.storage_path);
      profile.allPhotoUrls = (
        await Promise.all(photos.map((ph) => {
          const raw = ph as { storage_path?: string | null };
          return getSignedUrl(client, raw.storage_path);
        }))
      ).filter(Boolean) as string[];
    } else {
      profile.photoUrl = await getSignedUrl(client, rawPrimary.blurred_path);
    }
  }

  return profile;
}

export async function fetchMatchShareData(token: string): Promise<MatchShareData | null> {
  const client = createAdminClient();

  const resolved = await resolveToken(client, token);
  if (!resolved) return null;

  const { match_presentation_id, expires_at } = resolved;

  // Fetch presentation + suggestion
  const { data: presData } = await (client as unknown as {
    from: (t: string) => {
      select: (s: string) => {
        eq: (c: string, v: string) => {
          single: () => Promise<{ data: Record<string, unknown> | null }>
        }
      }
    }
  })
    .from('match_presentations')
    .select('is_full_revealed, match_suggestion_id')
    .eq('id', match_presentation_id)
    .single();

  if (!presData) return null;

  const isRevealed = presData.is_full_revealed === true;
  const suggestionId = presData.match_suggestion_id as string;

  const { data: sgData } = await (client as unknown as {
    from: (t: string) => {
      select: (s: string) => {
        eq: (c: string, v: string) => {
          single: () => Promise<{ data: Record<string, unknown> | null }>
        }
      }
    }
  })
    .from('match_suggestions')
    .select('profile_a_id, profile_b_id, overall_compatibility_score, compatibility_report')
    .eq('id', suggestionId)
    .single();

  if (!sgData) return null;

  const profileAId = sgData.profile_a_id as string;
  const profileBId = sgData.profile_b_id as string;
  const overallScore = (sgData.overall_compatibility_score as number) ?? 0;
  const report = sgData.compatibility_report as Record<string, unknown> | null;

  // Build dimension scores from compatibility_profiles
  const dimensions: DimensionScore[] = [];

  if (isRevealed) {
    const [cpA, cpB] = await Promise.all([
      (client as unknown as {
        from: (t: string) => { select: (s: string) => { eq: (c: string, v: string) => { single: () => Promise<{ data: Record<string, unknown> | null }> } } }
      })
        .from('compatibility_profiles')
        .select(DIMENSION_MAP.map((d) => `${d.dbKey}_score`).join(', '))
        .eq('user_id', profileAId)
        .single(),
      (client as unknown as {
        from: (t: string) => { select: (s: string) => { eq: (c: string, v: string) => { single: () => Promise<{ data: Record<string, unknown> | null }> } } }
      })
        .from('compatibility_profiles')
        .select(DIMENSION_MAP.map((d) => `${d.dbKey}_score`).join(', '))
        .eq('user_id', profileBId)
        .single(),
    ]);

    for (const dim of DIMENSION_MAP) {
      dimensions.push({
        key: dim.chartKey,
        label: dim.label,
        scoreA: (cpA.data?.[`${dim.dbKey}_score`] as number) ?? 5,
        scoreB: (cpB.data?.[`${dim.dbKey}_score`] as number) ?? 5,
      });
    }
  } else {
    // Preview: use scores from compatibility_report if available
    const dimScores = report?.dimension_scores as Record<string, number> | undefined;
    for (const dim of DIMENSION_MAP) {
      const score = dimScores?.[dim.dbKey] ?? 5;
      dimensions.push({ key: dim.chartKey, label: dim.label, scoreA: score, scoreB: score });
    }
  }

  const highlights = (report?.highlights as string[]) ?? [];
  const concerns = isRevealed ? ((report?.concerns as string[]) ?? []) : [];
  const matchNarrative = report?.narrative as string | undefined;
  const recommendation = report?.recommendation as string | undefined;

  const [profileA, profileB] = await Promise.all([
    buildProfile(client, profileAId, isRevealed),
    buildProfile(client, profileBId, isRevealed),
  ]);

  return {
    tier: isRevealed ? 'full' : 'preview',
    expiresAt: expires_at,
    overallScore,
    recommendation,
    highlights,
    concerns,
    matchNarrative,
    dimensions,
    profileA,
    profileB,
  };
}
