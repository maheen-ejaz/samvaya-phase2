-- Migration 1: Create all PostgreSQL enum types for Samvaya Phase 2
-- These must exist before tables reference them.

-- ============================================================
-- System / User enums
-- ============================================================

CREATE TYPE user_role AS ENUM ('applicant', 'admin', 'super_admin');

CREATE TYPE user_payment_status AS ENUM (
  'unverified',
  'verification_pending',
  'in_pool',
  'match_presented',
  'awaiting_payment',
  'active_member',
  'membership_expired'
);

CREATE TYPE membership_status_enum AS ENUM (
  'onboarding_pending',
  'onboarding_in_progress',
  'onboarding_complete',
  'active',
  'paused',
  'suspended',
  'deleted'
);

CREATE TYPE membership_tier_enum AS ENUM ('standard', 'premium_concierge');

CREATE TYPE ai_conversation_status_enum AS ENUM (
  'not_started',
  'conv1_in_progress',
  'conv1_complete',
  'conv2_in_progress',
  'conv2_complete',
  'conv3_in_progress',
  'all_complete'
);

CREATE TYPE bgv_consent_enum AS ENUM (
  'not_given',
  'consented',
  'consented_wants_call',
  'refused'
);

-- ============================================================
-- Profile enums (personal / lifestyle / goals)
-- ============================================================

CREATE TYPE gender_enum AS ENUM ('male', 'female');

CREATE TYPE referral_source_enum AS ENUM (
  'instagram', 'linkedin', 'friend', 'goocampus', 'google', 'other'
);

CREATE TYPE marital_status_enum AS ENUM (
  'first_marriage', 'divorced', 'widowed'
);

CREATE TYPE religious_observance_enum AS ENUM (
  'actively_practicing', 'culturally_observant', 'spiritual', 'not_religious'
);

CREATE TYPE permanent_ownership_enum AS ENUM (
  'owned', 'rented', 'family_home'
);

CREATE TYPE diet_enum AS ENUM (
  'vegetarian', 'non_vegetarian', 'eggetarian', 'vegan', 'jain', 'other'
);

CREATE TYPE attire_preference_enum AS ENUM (
  'modern_western', 'traditional', 'mix', 'no_preference'
);

CREATE TYPE fitness_habits_enum AS ENUM (
  'regularly_exercises', 'occasionally', 'rarely', 'not_interested'
);

CREATE TYPE smoking_enum AS ENUM ('never', 'occasionally', 'frequently');

CREATE TYPE drinking_enum AS ENUM ('never', 'occasionally', 'frequently');

CREATE TYPE tattoos_piercings_enum AS ENUM (
  'none', 'tattoos_only', 'piercings_only', 'both'
);

CREATE TYPE disability_enum AS ENUM ('yes', 'no', 'prefer_not_to_disclose');

CREATE TYPE marriage_timeline_enum AS ENUM (
  'within_6_months', '6_to_12_months', '1_to_2_years', 'no_fixed_timeline'
);

CREATE TYPE long_distance_enum AS ENUM (
  'yes_absolutely', 'open_to_it', 'prefer_same_location'
);

CREATE TYPE family_arrangement_enum AS ENUM (
  'nuclear', 'joint', 'flexible', 'no_preference'
);

CREATE TYPE working_expectation_enum AS ENUM (
  'both_continue', 'comfortable_either_way', 'i_prefer_home', 'prefer_partner_home', 'open'
);

CREATE TYPE wants_children_enum AS ENUM ('yes', 'no', 'open');

CREATE TYPE children_count_enum AS ENUM ('1', '2', '3_or_more', 'no_preference');

CREATE TYPE children_timing_enum AS ENUM (
  'within_1_2_years', 'after_3_5_years', 'after_milestones', 'no_preference'
);

CREATE TYPE relocation_openness_enum AS ENUM ('yes', 'no', 'open');

-- ============================================================
-- Medical enums
-- ============================================================

CREATE TYPE medical_status_enum AS ENUM (
  'mbbs_student', 'intern', 'mbbs_passed', 'pursuing_pg', 'completed_pg'
);

CREATE TYPE pg_plans_enum AS ENUM (
  'yes_within_1_year', 'yes_2_to_3_years', 'no_plan_to_practice', 'undecided'
);

-- ============================================================
-- Partner preference enums (values that differ from profile enums)
-- ============================================================

-- smoking_preference and drinking_preference add 'no_preference'
CREATE TYPE smoking_preference_enum AS ENUM (
  'never', 'occasionally', 'frequently', 'no_preference'
);

CREATE TYPE drinking_preference_enum AS ENUM (
  'never', 'occasionally', 'frequently', 'no_preference'
);

-- fitness_preference adds 'no_preference' (replaces 'not_interested')
CREATE TYPE fitness_preference_enum AS ENUM (
  'regularly_exercises', 'occasionally', 'rarely', 'no_preference'
);

-- tattoo_preference adds 'no_preference'
CREATE TYPE tattoo_preference_enum AS ENUM (
  'none', 'tattoos_only', 'piercings_only', 'both', 'no_preference'
);

-- religious_observance_preference adds 'no_preference'
CREATE TYPE religious_observance_preference_enum AS ENUM (
  'actively_practicing', 'culturally_observant', 'spiritual', 'not_religious', 'no_preference'
);

-- partner_career_expectation_enum (slightly different values from working_expectation)
CREATE TYPE partner_career_expectation_enum AS ENUM (
  'both_continue', 'comfortable_either_way', 'prefer_partner_home', 'open'
);

-- ============================================================
-- Compatibility profile enums
-- ============================================================

CREATE TYPE communication_style_enum AS ENUM (
  'direct', 'indirect', 'avoidant', 'expressive', 'reserved'
);

CREATE TYPE conflict_approach_enum AS ENUM (
  'addresses_immediately', 'reflects_first', 'withdraws', 'collaborative'
);

CREATE TYPE partner_role_vision_enum AS ENUM (
  'co_builder', 'anchor_complement', 'flexible'
);

CREATE TYPE financial_values_enum AS ENUM (
  'financially_intentional', 'financially_casual', 'financially_anxious', 'not_discussed'
);

CREATE TYPE input_mode_enum AS ENUM ('text', 'voice');

-- ============================================================
-- Document & payment enums
-- ============================================================

CREATE TYPE document_type_enum AS ENUM ('identity_document', 'kundali', 'other');

CREATE TYPE document_verification_status AS ENUM (
  'pending', 'verified', 'rejected', 'needs_resubmission'
);

CREATE TYPE payment_type_enum AS ENUM (
  'verification_fee', 'membership_fee', 'membership_renewal'
);

CREATE TYPE payment_transaction_status AS ENUM (
  'created', 'authorized', 'captured', 'failed', 'refunded'
);

-- ============================================================
-- Waitlist enum (if not already created in Phase 1)
-- ============================================================

DO $$ BEGIN
  CREATE TYPE waitlist_status AS ENUM ('pending', 'invited', 'converted', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE career_stage_enum AS ENUM ('student', 'resident', 'junior_doctor', 'consultant', 'specialist');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
