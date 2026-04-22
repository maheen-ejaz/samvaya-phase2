import { createAdminClient } from '@/lib/supabase/admin';
import { getClient } from '@/lib/claude/client';
import {
  buildScoringSystemPrompt,
  buildScoringUserMessage,
  type ProfilePayload,
} from './prompts';
import type {
  CompatibilityReport,
  MatchingWeights,
  MatchingConfig,
  MatchRecommendation,
  ScoringDimension,
  MatchSuggestion,
} from '@/types/matching';
import { SCORING_DIMENSIONS } from '@/types/matching';

/**
 * Fetch matching weights from system_config.
 */
export async function getMatchingWeights(): Promise<MatchingWeights> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('system_config' as never)
    .select('value')
    .eq('key', 'matching_weights')
    .single();

  if (error || !data) {
    // Fallback defaults
    return {
      values_alignment: 1.5,
      career_alignment: 1.5,
      relocation_compatibility: 1.5,
      communication_compatibility: 1.5,
      lifestyle_compatibility: 1.0,
      family_orientation: 1.0,
      financial_alignment: 1.0,
      emotional_compatibility: 1.0,
      timeline_alignment: 1.0,
    };
  }

  return (data as { value: MatchingWeights }).value;
}

/**
 * Fetch matching config from system_config.
 */
export async function getMatchingConfig(): Promise<MatchingConfig> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('system_config' as never)
    .select('value')
    .eq('key', 'matching_config')
    .single();

  if (error || !data) {
    return {
      min_score_for_suggestion: 50,
      max_pairs_per_day: 50,
      presentation_expiry_days: 7,
      batch_concurrency: 3,
      scoring_model: 'claude-sonnet-4-20250514',
    };
  }

  return (data as { value: MatchingConfig }).value;
}

/**
 * Assemble a ProfilePayload for Claude scoring — strips PII.
 */
export async function assembleProfilePayload(
  userId: string
): Promise<ProfilePayload> {
  const supabase = createAdminClient();

  const [profileResult, prefsResult, compatResult, medResult] =
    await Promise.all([
      supabase.from('profiles').select('*').eq('user_id', userId).single(),
      supabase
        .from('partner_preferences')
        .select('*')
        .eq('user_id', userId)
        .single(),
      supabase
        .from('compatibility_profiles')
        .select('*')
        .eq('user_id', userId)
        .single(),
      supabase
        .from('medical_credentials')
        .select('*')
        .eq('user_id', userId)
        .single(),
    ]);

  const p = profileResult.data;
  const pp = prefsResult.data;
  const cp = compatResult.data;
  const mc = medResult.data;

  if (!p) {
    throw new Error(`Profile not found for user ${userId}`);
  }

  const age = p?.date_of_birth
    ? Math.floor(
        (Date.now() - new Date(p.date_of_birth).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000)
      )
    : null;

  return {
    // Demographics — no name, no email, no phone
    gender: p?.gender ?? null,
    age,
    religion: p?.religion ?? null,
    religious_observance: p?.religious_observance ?? null,
    marital_status: p?.marital_status ?? null,
    height_cm: p?.height_cm ?? null,

    // Location
    current_city: p?.current_city ?? null,
    current_state: p?.current_state ?? null,
    current_country: p?.current_country ?? null,
    permanent_city: p?.permanent_city ?? null,
    permanent_state: null, // Not in schema

    // Lifestyle
    diet: p?.diet ?? null,
    smoking: p?.smoking ?? null,
    drinking: p?.drinking ?? null,
    fitness_level: p?.fitness_habits ?? null,
    attire: p?.attire_preference ?? null,
    tattoos_piercings: p?.tattoos_piercings ?? null,
    hobbies: p?.hobbies_interests ?? null,

    // Medical career
    medical_status: mc?.current_status ?? null,
    specialties: mc?.specialty ?? null,
    current_designation: mc?.current_designation ?? null,
    total_experience_months: mc?.total_experience_months ?? null,

    // Life goals
    marriage_timeline: p?.marriage_timeline ?? null,
    long_distance_comfort: p?.long_distance_comfort ?? null,
    post_marriage_arrangement: p?.post_marriage_family_arrangement ?? null,
    both_partners_working: p?.both_partners_working_expectation ?? null,
    wants_children: p?.wants_children ?? null,
    children_count: p?.children_count_preference ?? null,
    children_timing: p?.children_timing_preference ?? null,
    open_to_partner_with_children: p?.open_to_partner_with_children ?? null,
    settlement_countries: p?.preferred_settlement_countries ?? null,
    open_to_immediate_relocation: p?.open_to_immediate_relocation ?? null,
    plans_to_go_abroad: p?.plans_to_go_abroad ?? null,

    // Partner preferences
    preferred_age_min: pp?.preferred_age_min ?? null,
    preferred_age_max: pp?.preferred_age_max ?? null,
    preferred_specialties: pp?.preferred_specialties ?? null,
    preferred_career_stages: pp?.preferred_career_stage ?? null,
    preferred_states: pp?.preferred_indian_states ?? null,
    preferred_countries: pp?.preferred_countries ?? null,
    no_location_preference: pp?.no_location_preference ?? null,
    diet_preference: pp?.diet_preference ?? null,
    smoking_preference: pp?.smoking_preference ?? null,
    drinking_preference: pp?.drinking_preference ?? null,
    family_type_preference: pp?.family_type_preference ?? null,
    religious_observance_preference:
      pp?.religious_observance_preference ?? null,
    partner_career_expectation:
      pp?.partner_career_expectation_after_marriage ?? null,
    partner_qualities: pp?.partner_qualities ?? null,

    // AI compatibility profile
    spider_web_scores: cp
      ? {
          family_orientation: cp.family_orientation_score ?? 0,
          career_ambition: cp.career_ambition_score ?? 0,
          independence_togetherness:
            cp.independence_vs_togetherness_score ?? 0,
          emotional_expressiveness:
            cp.emotional_expressiveness_score ?? 0,
          social_orientation: cp.social_orientation_score ?? 0,
          traditionalism: cp.traditionalism_score ?? 0,
          relocation_openness: cp.relocation_openness_score ?? 0,
          life_pace: cp.life_pace_score ?? 0,
        }
      : null,
    spider_web_notes: cp
      ? {
          family_orientation: cp.family_orientation_notes ?? '',
          career_ambition: cp.career_ambition_notes ?? '',
          independence_togetherness:
            cp.independence_vs_togetherness_notes ?? '',
          emotional_expressiveness:
            cp.emotional_expressiveness_notes ?? '',
          social_orientation: cp.social_orientation_notes ?? '',
          traditionalism: cp.traditionalism_notes ?? '',
          relocation_openness: cp.relocation_openness_notes ?? '',
          life_pace: cp.life_pace_notes ?? '',
        }
      : null,
    communication_style: cp?.communication_style ?? null,
    conflict_approach: cp?.conflict_approach ?? null,
    partner_role_vision: cp?.partner_role_vision ?? null,
    financial_values: cp?.financial_values ?? null,
    ai_personality_summary: cp?.ai_personality_summary ?? null,
    ai_compatibility_keywords: cp?.ai_compatibility_keywords ?? null,
    red_flags: cp?.ai_red_flags ? [cp.ai_red_flags] : null,
  };
}

/**
 * Compute the weighted overall score from dimension scores.
 * This is computed server-side for determinism — Claude's arithmetic is not trusted.
 */
export function computeWeightedScore(
  dimensions: Record<string, { score: number; note: string }>,
  weights: MatchingWeights
): number {
  let totalWeight = 0;
  let weightedSum = 0;

  for (const dim of SCORING_DIMENSIONS) {
    const weight = weights[dim] ?? 1.0;
    const score = dimensions[dim]?.score;
    if (typeof score === 'number' && score >= 0 && score <= 100) {
      weightedSum += score * weight;
      totalWeight += weight;
    }
  }

  if (totalWeight === 0) return 0;
  return Math.round(weightedSum / totalWeight);
}

/**
 * Determine recommendation based on weighted score.
 */
export function getRecommendation(
  weightedScore: number
): MatchRecommendation {
  if (weightedScore >= 82) return 'strongly_recommend';
  if (weightedScore >= 70) return 'recommend';
  if (weightedScore >= 60) return 'worth_considering';
  return 'not_recommended';
}

/**
 * Parse and validate the Claude scoring response.
 */
function parseScoringResponse(
  text: string
): Omit<CompatibilityReport, 'overall_score'> {
  // Find the outermost balanced JSON object (balanced-brace parser)
  const start = text.indexOf('{');
  if (start === -1) throw new Error('No JSON found in scoring response');

  let depth = 0;
  let end = -1;
  for (let i = start; i < text.length; i++) {
    if (text[i] === '{') depth++;
    else if (text[i] === '}') {
      depth--;
      if (depth === 0) {
        end = i + 1;
        break;
      }
    }
  }
  if (end === -1) throw new Error('Unbalanced JSON in scoring response');

  const parsed = JSON.parse(text.slice(start, end));

  // Validate required fields
  if (!parsed.dimension_scores) {
    throw new Error('Missing dimension_scores in scoring response');
  }

  for (const dim of SCORING_DIMENSIONS) {
    const ds = parsed.dimension_scores[dim];
    if (!ds || typeof ds.score !== 'number') {
      throw new Error(`Missing or invalid dimension score for ${dim}`);
    }
    // Clamp scores to 0-100
    ds.score = Math.max(0, Math.min(100, Math.round(ds.score)));
  }

  if (!Array.isArray(parsed.highlights)) parsed.highlights = [];
  if (!Array.isArray(parsed.concerns)) parsed.concerns = [];
  if (typeof parsed.narrative !== 'string') parsed.narrative = '';

  return {
    dimension_scores: parsed.dimension_scores,
    highlights: parsed.highlights,
    concerns: parsed.concerns,
    narrative: parsed.narrative,
    recommendation: parsed.recommendation || 'not_recommended',
  };
}

/**
 * Score the compatibility of two users.
 * Returns the full report and inserts into match_suggestions.
 */
export async function scoreCompatibility(
  userAId: string,
  userBId: string
): Promise<{ suggestion: MatchSuggestion | null; report: CompatibilityReport; belowThreshold?: boolean }> {
  // Canonical ordering
  const [profileAId, profileBId] =
    userAId < userBId ? [userAId, userBId] : [userBId, userAId];

  // Fetch data in parallel
  const [profileA, profileB, weights, config] = await Promise.all([
    assembleProfilePayload(profileAId),
    assembleProfilePayload(profileBId),
    getMatchingWeights(),
    getMatchingConfig(),
  ]);

  // Build prompts
  const systemPrompt = buildScoringSystemPrompt(weights);
  const userMessage = buildScoringUserMessage(profileA, profileB);

  // Call Claude API
  const anthropic = getClient();
  const response = await anthropic.messages.create({
    model: config.scoring_model,
    max_tokens: 4096,
    temperature: 0,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  });

  const textBlock = response.content.find((block) => block.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response from Claude scoring');
  }

  // Parse response
  const partialReport = parseScoringResponse(textBlock.text);

  // Compute weighted score server-side
  const overallScore = computeWeightedScore(
    partialReport.dimension_scores,
    weights
  );
  const recommendation = getRecommendation(overallScore);

  const report: CompatibilityReport = {
    ...partialReport,
    overall_score: overallScore,
    recommendation,
  };

  // Enforce min_score_for_suggestion — don't persist below-threshold pairs
  if (overallScore < config.min_score_for_suggestion) {
    return {
      suggestion: null,
      report,
      belowThreshold: true,
    };
  }

  // Insert into match_suggestions
  const supabase = createAdminClient();
  const { data: suggestion, error } = await supabase
    .from('match_suggestions' as never)
    .insert({
      profile_a_id: profileAId,
      profile_b_id: profileBId,
      overall_compatibility_score: overallScore,
      compatibility_report: report as never,
      match_narrative: report.narrative,
      recommendation,
      ai_model_version: config.scoring_model,
      admin_status: 'pending_review',
    } as never)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to insert match suggestion: ${error.message}`);
  }

  return {
    suggestion: suggestion as unknown as MatchSuggestion,
    report,
    belowThreshold: false,
  };
}
