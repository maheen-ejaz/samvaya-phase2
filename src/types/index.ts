import type { Database } from './supabase';

export type { Database };

// Table row types
export type User = Database['public']['Tables']['users']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type MedicalCredentials = Database['public']['Tables']['medical_credentials']['Row'];
export type PartnerPreferences = Database['public']['Tables']['partner_preferences']['Row'];
export type CompatibilityProfile = Database['public']['Tables']['compatibility_profiles']['Row'];
export type Photo = Database['public']['Tables']['photos']['Row'];
export type Document = Database['public']['Tables']['documents']['Row'];
export type Payment = Database['public']['Tables']['payments']['Row'];
export type Waitlist = Database['public']['Tables']['waitlist']['Row'];

// Table insert types (for creating new rows)
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type MedicalCredentialsInsert = Database['public']['Tables']['medical_credentials']['Insert'];
export type PartnerPreferencesInsert = Database['public']['Tables']['partner_preferences']['Insert'];
export type CompatibilityProfileInsert = Database['public']['Tables']['compatibility_profiles']['Insert'];
export type PhotoInsert = Database['public']['Tables']['photos']['Insert'];
export type DocumentInsert = Database['public']['Tables']['documents']['Insert'];
export type PaymentInsert = Database['public']['Tables']['payments']['Insert'];

// Table update types (for partial updates)
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];
export type MedicalCredentialsUpdate = Database['public']['Tables']['medical_credentials']['Update'];
export type PartnerPreferencesUpdate = Database['public']['Tables']['partner_preferences']['Update'];
export type CompatibilityProfileUpdate = Database['public']['Tables']['compatibility_profiles']['Update'];

// Enum types
export type UserRole = Database['public']['Enums']['user_role'];
export type UserPaymentStatus = Database['public']['Enums']['user_payment_status'];
export type MembershipStatusEnum = Database['public']['Enums']['membership_status_enum'];
export type MembershipTierEnum = Database['public']['Enums']['membership_tier_enum'];
export type AiConversationStatus = Database['public']['Enums']['ai_conversation_status_enum'];
export type BgvConsentEnum = Database['public']['Enums']['bgv_consent_enum'];
export type GenderEnum = Database['public']['Enums']['gender_enum'];
export type ReferralSourceEnum = Database['public']['Enums']['referral_source_enum'];
export type MaritalStatusEnum = Database['public']['Enums']['marital_status_enum'];
export type ReligiousObservanceEnum = Database['public']['Enums']['religious_observance_enum'];
export type DietEnum = Database['public']['Enums']['diet_enum'];
export type AttirePreferenceEnum = Database['public']['Enums']['attire_preference_enum'];
export type MedicalStatusEnum = Database['public']['Enums']['medical_status_enum'];
export type MarriageTimelineEnum = Database['public']['Enums']['marriage_timeline_enum'];
export type DocumentTypeEnum = Database['public']['Enums']['document_type_enum'];
export type DocumentVerificationStatus = Database['public']['Enums']['document_verification_status'];
export type PaymentTypeEnum = Database['public']['Enums']['payment_type_enum'];
export type PaymentTransactionStatus = Database['public']['Enums']['payment_transaction_status'];
export type CommunicationStyleEnum = Database['public']['Enums']['communication_style_enum'];
export type ConflictApproachEnum = Database['public']['Enums']['conflict_approach_enum'];
export type PartnerRoleVisionEnum = Database['public']['Enums']['partner_role_vision_enum'];
export type FinancialValuesEnum = Database['public']['Enums']['financial_values_enum'];
export type InputModeEnum = Database['public']['Enums']['input_mode_enum'];

// Phase 2B matching types
export type {
  CompatibilityReport,
  DimensionScore,
  ScoringDimension,
  MatchAdminStatus,
  MatchMemberResponse,
  MatchPresentationStatus,
  IntroductionStatus,
  IntroductionOutcome,
  MatchRecommendation,
  MatchSuggestion,
  MatchPresentation,
  MatchFeedback,
  Introduction,
  MatchSuggestionWithProfiles,
  MatchPresentationWithDetails,
  IntroductionWithDetails,
  MatchingWeights,
  MatchingConfig,
  PreFilterStats,
  BatchScoreResult,
} from './matching';

export {
  SCORING_DIMENSIONS,
  DIMENSION_LABELS,
} from './matching';

// Part 3 table types (system config, email templates)
// These use manual types since Supabase types may not be regenerated yet
export interface SystemConfig {
  key: string;
  value: Record<string, unknown>;
  description: string | null;
  updated_by: string | null;
  updated_at: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: string;
  variables: string[];
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmailTemplateInsert {
  name: string;
  subject: string;
  body: string;
  category?: string;
  variables?: string[];
  created_by?: string;
}

export interface ActivityLogEntry {
  id: string;
  actor_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  metadata: Record<string, unknown>;
  created_at: string;
  actor_name?: string;
}

export interface CommunicationLogEntry {
  id: string;
  user_id: string;
  sent_by: string;
  channel: 'email' | 'sms';
  subject: string | null;
  body: string;
  status: 'sent' | 'failed' | 'pending';
  sent_at: string | null;
  created_at: string;
  scheduled_at: string | null;
  batch_id: string | null;
}
