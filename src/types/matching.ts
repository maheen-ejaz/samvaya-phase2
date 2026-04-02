// Phase 2B — Matching algorithm types

export interface DimensionScore {
  score: number;
  note: string;
}

export interface CompatibilityReport {
  overall_score: number;
  dimension_scores: {
    career_alignment: DimensionScore;
    values_alignment: DimensionScore;
    lifestyle_compatibility: DimensionScore;
    relocation_compatibility: DimensionScore;
    communication_compatibility: DimensionScore;
    family_orientation: DimensionScore;
    financial_alignment: DimensionScore;
    timeline_alignment: DimensionScore;
    emotional_compatibility: DimensionScore;
  };
  highlights: string[];
  concerns: string[];
  narrative: string;
  recommendation: MatchRecommendation;
}

export type MatchAdminStatus = 'pending_review' | 'approved' | 'rejected' | 'expired';
export type MatchMemberResponse = 'pending' | 'interested' | 'not_interested' | 'expired';
export type MatchPresentationStatus = 'pending' | 'mutual_interest' | 'one_sided' | 'expired' | 'declined';
export type IntroductionStatus = 'scheduled' | 'completed' | 'rescheduled' | 'cancelled' | 'no_show';
export type IntroductionOutcome = 'want_to_continue' | 'not_a_match' | 'need_more_time';
export type MatchRecommendation = 'strongly_recommend' | 'recommend' | 'worth_considering' | 'not_recommended';

export type ScoringDimension = keyof CompatibilityReport['dimension_scores'];

export const SCORING_DIMENSIONS: ScoringDimension[] = [
  'career_alignment',
  'values_alignment',
  'lifestyle_compatibility',
  'relocation_compatibility',
  'communication_compatibility',
  'family_orientation',
  'financial_alignment',
  'timeline_alignment',
  'emotional_compatibility',
];

export const DIMENSION_LABELS: Record<ScoringDimension, string> = {
  career_alignment: 'Career Alignment',
  values_alignment: 'Values Alignment',
  lifestyle_compatibility: 'Lifestyle Compatibility',
  relocation_compatibility: 'Relocation Compatibility',
  communication_compatibility: 'Communication Compatibility',
  family_orientation: 'Family Orientation',
  financial_alignment: 'Financial Alignment',
  timeline_alignment: 'Timeline Alignment',
  emotional_compatibility: 'Emotional Compatibility',
};

export interface MatchSuggestion {
  id: string;
  profile_a_id: string;
  profile_b_id: string;
  overall_compatibility_score: number;
  compatibility_report: CompatibilityReport;
  match_narrative: string | null;
  recommendation: MatchRecommendation | null;
  ai_model_version: string;
  admin_status: MatchAdminStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  admin_notes: string | null;
  is_stale: boolean;
  created_at: string;
  updated_at: string;
}

export interface MatchPresentation {
  id: string;
  match_suggestion_id: string;
  member_a_response: MatchMemberResponse;
  member_b_response: MatchMemberResponse;
  member_a_responded_at: string | null;
  member_b_responded_at: string | null;
  is_mutual_interest: boolean;
  status: MatchPresentationStatus;
  presented_at: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface MatchFeedback {
  id: string;
  match_presentation_id: string;
  user_id: string;
  response: MatchMemberResponse;
  feedback_rating: number | null;
  feedback_text: string | null;
  what_worked: string[];
  what_didnt_work: string[];
  would_like_more_like_this: boolean | null;
  specific_concern: string | null;
  created_at: string;
}

export interface Introduction {
  id: string;
  match_presentation_id: string;
  introduction_number: number;
  scheduled_at: string | null;
  meeting_link: string | null;
  is_team_facilitated: boolean;
  facilitator_id: string | null;
  status: IntroductionStatus;
  outcome_member_a: IntroductionOutcome | null;
  outcome_member_b: IntroductionOutcome | null;
  team_feedback_notes: string | null;
  created_at: string;
  updated_at: string;
}

// Enriched types for admin UI (with joined profile data)
export interface MatchSuggestionWithProfiles extends MatchSuggestion {
  profile_a: {
    full_name: string;
    age: number;
    gender: string;
    specialty: string[];
    current_city: string | null;
    current_state: string | null;
    primary_photo_url: string | null;
  };
  profile_b: {
    full_name: string;
    age: number;
    gender: string;
    specialty: string[];
    current_city: string | null;
    current_state: string | null;
    primary_photo_url: string | null;
  };
}

export interface MatchPresentationWithDetails extends MatchPresentation {
  suggestion: MatchSuggestionWithProfiles;
}

export interface IntroductionWithDetails extends Introduction {
  presentation: MatchPresentationWithDetails;
  facilitator_name?: string;
}

// Matching config from system_config
export interface MatchingWeights {
  values_alignment: number;
  career_alignment: number;
  relocation_compatibility: number;
  communication_compatibility: number;
  lifestyle_compatibility: number;
  family_orientation: number;
  financial_alignment: number;
  emotional_compatibility: number;
  timeline_alignment: number;
}

export interface MatchingConfig {
  min_score_for_suggestion: number;
  max_pairs_per_day: number;
  presentation_expiry_days: number;
  batch_concurrency: number;
  scoring_model: string;
}

// Pipeline stats
export interface PreFilterStats {
  total_in_pool: number;
  pairs_after_filter: number;
  reduction_pct: number;
  users_skipped?: number;
}

export interface BatchScoreResult {
  queued: number;
  scored: number;
  skipped_cached: number;
  skipped_below_threshold: number;
  failed: number;
  daily_limit_reached: boolean;
}
