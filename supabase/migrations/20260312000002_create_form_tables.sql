-- Migration 2: Create form tables, trigger functions, and indexes
-- Depends on: 20260312000001_create_enum_types.sql

-- ============================================================
-- Shared trigger function for auto-updating updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 0. waitlist (from Phase 1 — create if not present in this project)
-- ============================================================

CREATE TABLE IF NOT EXISTS waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
  email TEXT,
  specialty TEXT,
  career_stage career_stage_enum,
  city TEXT,
  country TEXT,
  status waitlist_status DEFAULT 'pending',
  invited_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_waitlist_updated_at
  BEFORE UPDATE ON waitlist
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 1. users
-- ============================================================

CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  waitlist_id UUID REFERENCES waitlist(id) ON DELETE SET NULL,
  role user_role NOT NULL DEFAULT 'applicant',
  is_goocampus_member BOOLEAN NOT NULL DEFAULT false,
  membership_tier membership_tier_enum NOT NULL DEFAULT 'standard',
  payment_status user_payment_status NOT NULL DEFAULT 'unverified',
  membership_status membership_status_enum NOT NULL DEFAULT 'onboarding_pending',
  onboarding_section INTEGER NOT NULL DEFAULT 1,
  onboarding_last_question INTEGER NOT NULL DEFAULT 0,
  ai_conversation_status ai_conversation_status_enum NOT NULL DEFAULT 'not_started',
  profile_completion_pct INTEGER NOT NULL DEFAULT 0,
  bgv_consent bgv_consent_enum NOT NULL DEFAULT 'not_given',
  is_bgv_complete BOOLEAN NOT NULL DEFAULT false,
  bgv_flagged BOOLEAN NOT NULL DEFAULT false,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 2. profiles (Q1-Q74, excluding Q3/Q4 which live in auth.users)
-- ============================================================

CREATE TABLE profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,

  -- Personal (Section A)
  first_name TEXT,                                    -- Q1
  last_name TEXT,                                     -- Q2
  gender gender_enum,                                 -- Q5
  referral_source referral_source_enum,               -- Q6
  marital_status marital_status_enum,                 -- Q7
  has_children_from_previous BOOLEAN,                 -- Q8 (conditional on Q7)
  date_of_birth DATE,                                 -- Q9
  time_of_birth TEXT,                                 -- Q11 (optional, conditional on Q10)
  place_of_birth TEXT,                                -- Q12
  city_of_birth TEXT,                                 -- Q13/Q14
  blood_group TEXT,                                   -- Q15 (optional)
  mother_tongue TEXT,                                 -- Q16
  languages_spoken TEXT[],                            -- Q17

  -- Location & Citizenship (Section B)
  citizenship_country TEXT,                           -- Q18
  employment_visa_country TEXT,                       -- Q20 (conditional on Q19)
  current_country TEXT,                               -- Q21
  current_state TEXT,                                 -- Q22 (conditional on Q21 = India)
  current_city TEXT,                                  -- Q23
  permanent_city TEXT,                                -- Q25 (conditional)
  permanent_ownership permanent_ownership_enum,       -- Q26 (conditional)

  -- Religion & Community (Section C)
  religion TEXT,                                      -- Q27
  religious_observance religious_observance_enum,      -- Q28
  believes_in_kundali BOOLEAN,                        -- Q29
  caste_comfort BOOLEAN,                              -- Q30
  caste TEXT,                                         -- Q31 (conditional on Q30)

  -- Family (Section D)
  father_name TEXT,                                   -- Q32
  father_occupation TEXT,                              -- Q33
  mother_name TEXT,                                    -- Q35
  mother_occupation TEXT,                              -- Q36
  siblings_count INTEGER,                             -- Q39

  -- Physical (Section E)
  height_cm INTEGER,                                  -- Q40
  weight_kg INTEGER,                                  -- Q41
  skin_tone TEXT,                                     -- Q42 (optional)

  -- Lifestyle (Section F)
  diet diet_enum,                                     -- Q43
  attire_preference attire_preference_enum,           -- Q44
  fitness_habits fitness_habits_enum,                 -- Q45
  smoking smoking_enum,                               -- Q46
  drinking drinking_enum,                             -- Q47
  tattoos_piercings tattoos_piercings_enum,            -- Q48
  has_disability disability_enum,                     -- Q49
  disability_description TEXT,                        -- Q50 (conditional)
  has_allergies BOOLEAN,                              -- Q51
  allergy_description TEXT,                           -- Q52 (conditional)

  -- Interests (Section G)
  hobbies_interests TEXT[],                           -- Q53
  hobbies_regular TEXT,                               -- Q54

  -- Goals & Values (Section J)
  marriage_timeline marriage_timeline_enum,            -- Q63
  long_distance_comfort long_distance_enum,           -- Q64
  post_marriage_family_arrangement family_arrangement_enum, -- Q65
  both_partners_working_expectation working_expectation_enum, -- Q66
  wants_children wants_children_enum,                 -- Q67
  children_count_preference children_count_enum,       -- Q68 (conditional)
  children_timing_preference children_timing_enum,     -- Q69 (conditional)
  open_to_partner_with_children wants_children_enum,  -- Q70 (conditional, reuses yes/no/open)
  preferred_settlement_countries TEXT[],               -- Q71
  open_to_immediate_relocation relocation_openness_enum, -- Q72
  plans_to_go_abroad BOOLEAN,                         -- Q73
  abroad_countries TEXT[],                            -- Q74 (conditional)

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 3. medical_credentials (Sections H + I)
-- ============================================================

CREATE TABLE medical_credentials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,

  -- Education (Section H)
  current_status medical_status_enum,                 -- Q56
  pg_plans pg_plans_enum,                             -- Q57 (conditional on Q56 = mbbs_passed)
  additional_qualifications TEXT[],                    -- Q58
  additional_qualifications_other TEXT,                -- Q59 (conditional)
  specialty TEXT[],                                   -- Q60

  -- Career (Section I)
  has_work_experience BOOLEAN,                        -- Q61
  work_experience JSONB,                              -- Q62 (array of work entries)
  current_designation TEXT,                           -- extracted from work_experience
  total_experience_months INTEGER,                    -- calculated from work_experience

  -- Post-onboarding fields (profile completion prompt)
  monthly_remuneration_range TEXT,
  linkedin_url TEXT,
  instagram_handle TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_medical_credentials_updated_at
  BEFORE UPDATE ON medical_credentials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 4. partner_preferences (Section K, Q76-Q94)
-- ============================================================

CREATE TABLE partner_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,

  -- Demographics
  preferred_age_min INTEGER,                          -- Q76
  preferred_age_max INTEGER,                          -- Q76
  preferred_height_min_cm INTEGER,                    -- Q77
  preferred_height_max_cm INTEGER,                    -- Q77

  -- Medical
  prefers_specific_specialty BOOLEAN,                 -- Q78
  preferred_specialties TEXT[],                       -- Q79 (conditional)
  preferred_career_stage TEXT[],                      -- Q92

  -- Location
  preferred_indian_states TEXT[],                     -- Q80
  preferred_countries TEXT[],                         -- Q80
  no_location_preference BOOLEAN DEFAULT false,       -- Q80

  -- Background
  preferred_mother_tongue TEXT[],                     -- Q81

  -- Lifestyle
  body_type_preference TEXT[],                        -- Q82
  attire_preference attire_preference_enum,           -- Q83
  diet_preference TEXT[],                             -- Q84
  fitness_preference fitness_preference_enum,         -- Q85
  smoking_preference smoking_preference_enum,         -- Q86
  drinking_preference drinking_preference_enum,       -- Q87
  tattoo_preference tattoo_preference_enum,           -- Q88

  -- Values & Family
  family_type_preference family_arrangement_enum,     -- Q89
  religious_observance_preference religious_observance_preference_enum, -- Q90
  partner_career_expectation_after_marriage partner_career_expectation_enum, -- Q91

  -- Qualities
  partner_qualities TEXT[],                           -- Q93 (up to 7 tags)
  partner_qualities_other TEXT,                       -- Q94 (conditional)

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_partner_preferences_updated_at
  BEFORE UPDATE ON partner_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 5. compatibility_profiles (AI chat outputs)
-- ============================================================

CREATE TABLE compatibility_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,

  -- Raw data
  raw_conversation_transcript TEXT,
  conversation_completed_at TIMESTAMPTZ,
  input_mode input_mode_enum DEFAULT 'text',

  -- Spider Web Dimensions (0-100 each)
  family_orientation_score INTEGER CHECK (family_orientation_score >= 0 AND family_orientation_score <= 100),
  family_orientation_notes TEXT,
  career_ambition_score INTEGER CHECK (career_ambition_score >= 0 AND career_ambition_score <= 100),
  career_ambition_notes TEXT,
  independence_vs_togetherness_score INTEGER CHECK (independence_vs_togetherness_score >= 0 AND independence_vs_togetherness_score <= 100),
  independence_vs_togetherness_notes TEXT,
  emotional_expressiveness_score INTEGER CHECK (emotional_expressiveness_score >= 0 AND emotional_expressiveness_score <= 100),
  emotional_expressiveness_notes TEXT,
  social_orientation_score INTEGER CHECK (social_orientation_score >= 0 AND social_orientation_score <= 100),
  social_orientation_notes TEXT,
  traditionalism_score INTEGER CHECK (traditionalism_score >= 0 AND traditionalism_score <= 100),
  traditionalism_notes TEXT,
  relocation_openness_score INTEGER CHECK (relocation_openness_score >= 0 AND relocation_openness_score <= 100),
  relocation_openness_notes TEXT,
  life_pace_score INTEGER CHECK (life_pace_score >= 0 AND life_pace_score <= 100),
  life_pace_notes TEXT,

  -- Additional extracted dimensions
  communication_style communication_style_enum,
  conflict_approach conflict_approach_enum,
  partner_role_vision partner_role_vision_enum,
  financial_values financial_values_enum,

  -- Summary
  ai_personality_summary TEXT,
  ai_compatibility_keywords TEXT[],
  key_quote TEXT,
  ai_red_flags TEXT,
  extraction_model_version TEXT,
  closing_freeform_note TEXT,                         -- Q100 verbatim response

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_compatibility_profiles_updated_at
  BEFORE UPDATE ON compatibility_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 6. photos
-- ============================================================

CREATE TABLE photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  blurred_path TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_photos_updated_at
  BEFORE UPDATE ON photos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 7. documents
-- ============================================================

CREATE TABLE documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  document_type document_type_enum NOT NULL,
  storage_path TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  verification_status document_verification_status NOT NULL DEFAULT 'pending',
  verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 8. payments (v1: manual flag only)
-- ============================================================

CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  payment_type payment_type_enum NOT NULL,
  amount INTEGER,                                     -- in paise (INR smallest unit)
  currency TEXT NOT NULL DEFAULT 'INR',
  verification_fee_paid BOOLEAN NOT NULL DEFAULT false, -- v1 manual flag
  razorpay_order_id TEXT,                             -- v2 deferred
  razorpay_payment_id TEXT,                           -- v2 deferred
  razorpay_signature TEXT,                            -- v2 deferred
  status payment_transaction_status NOT NULL DEFAULT 'created',
  paid_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  refund_reason TEXT,
  membership_start_date DATE,
  membership_expiry_date DATE,
  match_presentation_id UUID,                         -- FK deferred (table not yet created)
  is_goocampus_member BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Auto-create users row on auth signup
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, role, payment_status, membership_status)
  VALUES (NEW.id, 'applicant', 'unverified', 'onboarding_pending');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- Indexes
-- ============================================================

-- FK indexes for non-unique foreign keys (unique columns get auto-indexed)
CREATE INDEX idx_users_waitlist_id ON users(waitlist_id);
CREATE INDEX idx_photos_user_id ON photos(user_id);
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);

-- Status/filter indexes for admin queries
CREATE INDEX idx_users_payment_status ON users(payment_status);
CREATE INDEX idx_users_membership_status ON users(membership_status);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_payments_verification_fee_paid ON payments(verification_fee_paid);
CREATE INDEX idx_documents_verification_status ON documents(verification_status);
