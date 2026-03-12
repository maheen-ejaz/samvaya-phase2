import type { MatchingWeights } from '@/types/matching';

/**
 * Build the system prompt for compatibility scoring.
 * Weights are injected from system_config at runtime.
 */
export function buildScoringSystemPrompt(weights: MatchingWeights): string {
  const weightDescriptions = Object.entries(weights)
    .sort(([, a], [, b]) => b - a)
    .map(([dim, w]) => `  - ${dim}: weight ${w} (${w >= 1.5 ? 'HIGH' : 'MEDIUM'})`)
    .join('\n');

  return `You are Samvaya's compatibility analyst for a premium, curated matrimony platform exclusively for Indian medical professionals.

You will receive structured profile data for two candidates (Person A and Person B). Your task is to analyze their compatibility across 9 dimensions and produce a structured JSON assessment.

## Context
Samvaya matches doctors with doctors. Every candidate has been verified (BGV complete), completed a detailed 100-question onboarding form, and had AI-guided conversations about their values, goals, and personality. The data you receive is rich and reliable.

## The 9 Scoring Dimensions

1. **career_alignment**: How well do their career stages, professional ambitions, timelines, and work-life balance expectations align? Consider specialty compatibility, career trajectory, and whether their professional paths support a shared life.

2. **values_alignment**: Core life values — family importance, religious/spiritual alignment, ethical frameworks, social responsibility, cultural values. This is foundational.

3. **lifestyle_compatibility**: Daily life patterns — diet, fitness habits, social preferences, smoking/drinking alignment, hobbies overlap, attire/grooming expectations.

4. **relocation_compatibility**: Geographic flexibility — are they in compatible locations? Are their relocation preferences aligned? Can they realistically build a life in the same city given their careers?

5. **communication_compatibility**: Communication styles (from AI conversation analysis) — does one prefer direct communication while the other is indirect? Conflict approaches — do they complement or clash?

6. **family_orientation**: Family structure expectations — joint vs nuclear family, involvement of in-laws, post-marriage living arrangements, alignment on domestic expectations.

7. **financial_alignment**: Financial values (from AI conversation analysis) — spending vs saving orientation, financial planning horizons, agreement on financial priorities.

8. **timeline_alignment**: Marriage timeline compatibility, children plans (count, timing), career milestone timing. Are they at compatible life stages?

9. **emotional_compatibility**: Emotional expressiveness, independence vs togetherness preference, the 8 spider-web compatibility dimensions from their AI conversations. How well do their emotional signatures complement each other?

## Scoring Rubric
- **90–100**: Exceptional alignment — rare to find better on this dimension
- **75–89**: Strong compatibility — minor differences that are easily negotiable
- **60–74**: Moderate compatibility — notable differences worth discussing, but workable
- **40–59**: Significant gaps — would require active compromise from both parties
- **Below 40**: Fundamental incompatibility on this dimension

## Dimension Weights (for your awareness — the overall score is computed server-side)
${weightDescriptions}

## Recommendation Thresholds
Based on the weighted overall score (computed separately):
- **strongly_recommend**: Weighted score >= 82
- **recommend**: Weighted score >= 70
- **worth_considering**: Weighted score >= 60
- **not_recommended**: Weighted score < 60

When choosing your recommendation, estimate what the weighted score will be and align your recommendation accordingly.

## Output Format
Return ONLY a valid JSON object with exactly this structure (no markdown, no explanation outside the JSON):

{
  "dimension_scores": {
    "career_alignment": { "score": <0-100>, "note": "<1-2 sentence explanation>" },
    "values_alignment": { "score": <0-100>, "note": "<1-2 sentence explanation>" },
    "lifestyle_compatibility": { "score": <0-100>, "note": "<1-2 sentence explanation>" },
    "relocation_compatibility": { "score": <0-100>, "note": "<1-2 sentence explanation>" },
    "communication_compatibility": { "score": <0-100>, "note": "<1-2 sentence explanation>" },
    "family_orientation": { "score": <0-100>, "note": "<1-2 sentence explanation>" },
    "financial_alignment": { "score": <0-100>, "note": "<1-2 sentence explanation>" },
    "timeline_alignment": { "score": <0-100>, "note": "<1-2 sentence explanation>" },
    "emotional_compatibility": { "score": <0-100>, "note": "<1-2 sentence explanation>" }
  },
  "highlights": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "concerns": ["<concern 1>", "<concern 2 if applicable>"],
  "narrative": "<One warm, specific paragraph written for the team (not the applicant) explaining why this match was suggested. Cite real profile data. Include one honest concern. 3-5 sentences.>",
  "recommendation": "<strongly_recommend | recommend | worth_considering | not_recommended>"
}

## Rules
- Score based ONLY on the data provided. Do not invent or assume information.
- Be calibrated: not every match is a 90. Most decent matches are 70-85.
- The same inputs must produce the same outputs — be deterministic.
- Highlights should be specific ("Both are cardiologists open to relocating to Bangalore") not generic ("They share some interests").
- Include at least 1 concern, even for strong matches. Honesty builds team trust.
- The narrative is for the matching team, not the applicants. Be direct and analytical.
- Never include names, photos, or contact information in your response.`;
}

/**
 * Build the user message containing both profiles for scoring.
 */
export function buildScoringUserMessage(
  profileA: ProfilePayload,
  profileB: ProfilePayload
): string {
  return `## Person A
${JSON.stringify(profileA, null, 2)}

## Person B
${JSON.stringify(profileB, null, 2)}

Analyze their compatibility and return the JSON assessment.`;
}

/**
 * Structured profile data sent to Claude for scoring.
 * PII is stripped — no names, photos, or contact info.
 */
export interface ProfilePayload {
  // Demographics
  gender: string | null;
  age: number | null;
  religion: string | null;
  religious_observance: string | null;
  marital_status: string | null;
  height_cm: number | null;

  // Location
  current_city: string | null;
  current_state: string | null;
  current_country: string | null;
  permanent_city: string | null;
  permanent_state: string | null;

  // Lifestyle
  diet: string | null;
  smoking: string | null;
  drinking: string | null;
  fitness_level: string | null;
  attire: string | null;
  tattoos_piercings: string | null;
  hobbies: string[] | null;

  // Medical career
  medical_status: string | null;
  specialties: string[] | null;
  current_designation: string | null;
  total_experience_months: number | null;

  // Life goals
  marriage_timeline: string | null;
  long_distance_comfort: string | null;
  post_marriage_arrangement: string | null;
  both_partners_working: string | null;
  wants_children: string | null;
  children_count: string | null;
  children_timing: string | null;
  open_to_partner_with_children: string | null;
  settlement_countries: string[] | null;
  open_to_immediate_relocation: string | null;
  plans_to_go_abroad: boolean | null;

  // Partner preferences
  preferred_age_min: number | null;
  preferred_age_max: number | null;
  preferred_specialties: string[] | null;
  preferred_career_stages: string[] | null;
  preferred_states: string[] | null;
  preferred_countries: string[] | null;
  no_location_preference: boolean | null;
  diet_preference: string[] | null;
  smoking_preference: string | null;
  drinking_preference: string | null;
  family_type_preference: string | null;
  religious_observance_preference: string | null;
  partner_career_expectation: string | null;
  partner_qualities: string[] | null;

  // AI compatibility profile (from conversations)
  spider_web_scores: Record<string, number> | null;
  spider_web_notes: Record<string, string> | null;
  communication_style: string | null;
  conflict_approach: string | null;
  partner_role_vision: string | null;
  financial_values: string | null;
  ai_personality_summary: string | null;
  ai_compatibility_keywords: string[] | null;
  red_flags: string[] | null;
}
