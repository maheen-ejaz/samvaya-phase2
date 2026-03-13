-- Migration: Create matching algorithm tables for Phase 2B
-- Depends on: 20260312000001_create_enum_types.sql, 20260312000002_create_form_tables.sql,
--             20260327000001_create_admin_tables.sql

-- ============================================================
-- New enum types for matching
-- ============================================================

DO $$ BEGIN
  CREATE TYPE match_admin_status_enum AS ENUM (
    'pending_review',
    'approved',
    'rejected',
    'expired'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE match_member_response_enum AS ENUM (
    'pending',
    'interested',
    'not_interested',
    'expired'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE match_presentation_status_enum AS ENUM (
    'pending',
    'mutual_interest',
    'one_sided',
    'expired',
    'declined'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE introduction_status_enum AS ENUM (
    'scheduled',
    'completed',
    'rescheduled',
    'cancelled',
    'no_show'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE introduction_outcome_enum AS ENUM (
    'want_to_continue',
    'not_a_match',
    'need_more_time'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE match_recommendation_enum AS ENUM (
    'strongly_recommend',
    'recommend',
    'worth_considering',
    'not_recommended'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- 1. match_suggestions — AI-generated compatibility suggestions
-- ============================================================

CREATE TABLE IF NOT EXISTS match_suggestions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_a_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  profile_b_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  overall_compatibility_score INTEGER NOT NULL CHECK (overall_compatibility_score >= 0 AND overall_compatibility_score <= 100),
  compatibility_report JSONB NOT NULL DEFAULT '{}',
  match_narrative TEXT,
  recommendation match_recommendation_enum,
  ai_model_version TEXT NOT NULL,
  admin_status match_admin_status_enum NOT NULL DEFAULT 'pending_review',
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  admin_notes TEXT,
  is_stale BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Canonical ordering: profile_a_id < profile_b_id prevents duplicate A-B / B-A pairs
  CONSTRAINT match_suggestions_canonical_order CHECK (profile_a_id < profile_b_id),
  CONSTRAINT match_suggestions_unique_pair UNIQUE (profile_a_id, profile_b_id)
);

DROP TRIGGER IF EXISTS set_match_suggestions_updated_at ON match_suggestions;
CREATE TRIGGER set_match_suggestions_updated_at
  BEFORE UPDATE ON match_suggestions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 2. match_presentations — Approved matches presented to applicants
-- ============================================================

CREATE TABLE IF NOT EXISTS match_presentations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_suggestion_id UUID NOT NULL REFERENCES match_suggestions(id) ON DELETE CASCADE,
  member_a_response match_member_response_enum NOT NULL DEFAULT 'pending',
  member_b_response match_member_response_enum NOT NULL DEFAULT 'pending',
  member_a_responded_at TIMESTAMPTZ,
  member_b_responded_at TIMESTAMPTZ,
  is_mutual_interest BOOLEAN NOT NULL DEFAULT false,
  status match_presentation_status_enum NOT NULL DEFAULT 'pending',
  presented_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS set_match_presentations_updated_at ON match_presentations;
CREATE TRIGGER set_match_presentations_updated_at
  BEFORE UPDATE ON match_presentations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 3. match_feedback — Post-response feedback from applicants
-- ============================================================

CREATE TABLE IF NOT EXISTS match_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_presentation_id UUID NOT NULL REFERENCES match_presentations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  response match_member_response_enum NOT NULL,
  feedback_rating INTEGER CHECK (feedback_rating >= 1 AND feedback_rating <= 5),
  feedback_text TEXT,
  what_worked TEXT[] DEFAULT '{}',
  what_didnt_work TEXT[] DEFAULT '{}',
  would_like_more_like_this BOOLEAN,
  specific_concern TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- One feedback per user per presentation
  CONSTRAINT match_feedback_unique_per_user UNIQUE (match_presentation_id, user_id)
);

-- ============================================================
-- 4. introductions — Video introduction scheduling
-- ============================================================

CREATE TABLE IF NOT EXISTS introductions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_presentation_id UUID NOT NULL REFERENCES match_presentations(id) ON DELETE CASCADE,
  introduction_number INTEGER NOT NULL DEFAULT 1,
  scheduled_at TIMESTAMPTZ,
  meeting_link TEXT,
  is_team_facilitated BOOLEAN NOT NULL DEFAULT true,
  facilitator_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status introduction_status_enum NOT NULL DEFAULT 'scheduled',
  outcome_member_a introduction_outcome_enum,
  outcome_member_b introduction_outcome_enum,
  team_feedback_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS set_introductions_updated_at ON introductions;
CREATE TRIGGER set_introductions_updated_at
  BEFORE UPDATE ON introductions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_match_suggestions_pair ON match_suggestions(profile_a_id, profile_b_id);
CREATE INDEX IF NOT EXISTS idx_match_suggestions_status ON match_suggestions(admin_status);
CREATE INDEX IF NOT EXISTS idx_match_suggestions_score ON match_suggestions(overall_compatibility_score DESC);
CREATE INDEX IF NOT EXISTS idx_match_suggestions_profile_a ON match_suggestions(profile_a_id);
CREATE INDEX IF NOT EXISTS idx_match_suggestions_profile_b ON match_suggestions(profile_b_id);

CREATE INDEX IF NOT EXISTS idx_match_presentations_suggestion ON match_presentations(match_suggestion_id);
CREATE INDEX IF NOT EXISTS idx_match_presentations_status ON match_presentations(status);
CREATE INDEX IF NOT EXISTS idx_match_presentations_expires ON match_presentations(expires_at) WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_match_feedback_presentation ON match_feedback(match_presentation_id);
CREATE INDEX IF NOT EXISTS idx_match_feedback_user ON match_feedback(user_id);

CREATE INDEX IF NOT EXISTS idx_introductions_presentation ON introductions(match_presentation_id);
CREATE INDEX IF NOT EXISTS idx_introductions_status ON introductions(status);
CREATE INDEX IF NOT EXISTS idx_introductions_scheduled ON introductions(scheduled_at) WHERE status = 'scheduled';

-- ============================================================
-- RLS — defense-in-depth (admin code uses service-role client)
-- ============================================================

ALTER TABLE match_suggestions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all match suggestions" ON match_suggestions;
CREATE POLICY "Admins can view all match suggestions"
  ON match_suggestions FOR SELECT
  USING (is_admin());

DROP POLICY IF EXISTS "Admins can insert match suggestions" ON match_suggestions;
CREATE POLICY "Admins can insert match suggestions"
  ON match_suggestions FOR INSERT
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can update match suggestions" ON match_suggestions;
CREATE POLICY "Admins can update match suggestions"
  ON match_suggestions FOR UPDATE
  USING (is_admin());

-- Users can view their own match suggestions
DROP POLICY IF EXISTS "Users can view own match suggestions" ON match_suggestions;
CREATE POLICY "Users can view own match suggestions"
  ON match_suggestions FOR SELECT
  USING (
    auth.uid() = profile_a_id OR auth.uid() = profile_b_id
  );

-- ---

ALTER TABLE match_presentations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all match presentations" ON match_presentations;
CREATE POLICY "Admins can view all match presentations"
  ON match_presentations FOR SELECT
  USING (is_admin());

DROP POLICY IF EXISTS "Admins can insert match presentations" ON match_presentations;
CREATE POLICY "Admins can insert match presentations"
  ON match_presentations FOR INSERT
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can update match presentations" ON match_presentations;
CREATE POLICY "Admins can update match presentations"
  ON match_presentations FOR UPDATE
  USING (is_admin());

-- Users can view their own match presentations (via match_suggestions join)
DROP POLICY IF EXISTS "Users can view own match presentations" ON match_presentations;
CREATE POLICY "Users can view own match presentations"
  ON match_presentations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM match_suggestions ms
      WHERE ms.id = match_presentations.match_suggestion_id
      AND (ms.profile_a_id = auth.uid() OR ms.profile_b_id = auth.uid())
    )
  );

-- ---

ALTER TABLE match_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all match feedback" ON match_feedback;
CREATE POLICY "Admins can view all match feedback"
  ON match_feedback FOR SELECT
  USING (is_admin());

DROP POLICY IF EXISTS "Admins can insert match feedback" ON match_feedback;
CREATE POLICY "Admins can insert match feedback"
  ON match_feedback FOR INSERT
  WITH CHECK (is_admin());

-- Users can insert their own feedback
DROP POLICY IF EXISTS "Users can insert own feedback" ON match_feedback;
CREATE POLICY "Users can insert own feedback"
  ON match_feedback FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM match_presentations mp
      JOIN match_suggestions ms ON ms.id = mp.match_suggestion_id
      WHERE mp.id = match_feedback.match_presentation_id
      AND (ms.profile_a_id = auth.uid() OR ms.profile_b_id = auth.uid())
    )
  );

-- Users can view their own feedback
DROP POLICY IF EXISTS "Users can view own feedback" ON match_feedback;
CREATE POLICY "Users can view own feedback"
  ON match_feedback FOR SELECT
  USING (user_id = auth.uid());

-- ---

ALTER TABLE introductions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all introductions" ON introductions;
CREATE POLICY "Admins can view all introductions"
  ON introductions FOR SELECT
  USING (is_admin());

DROP POLICY IF EXISTS "Admins can insert introductions" ON introductions;
CREATE POLICY "Admins can insert introductions"
  ON introductions FOR INSERT
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can update introductions" ON introductions;
CREATE POLICY "Admins can update introductions"
  ON introductions FOR UPDATE
  USING (is_admin());

-- Users can view their own introductions
DROP POLICY IF EXISTS "Users can view own introductions" ON introductions;
CREATE POLICY "Users can view own introductions"
  ON introductions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM match_presentations mp
      JOIN match_suggestions ms ON ms.id = mp.match_suggestion_id
      WHERE mp.id = introductions.match_presentation_id
      AND (ms.profile_a_id = auth.uid() OR ms.profile_b_id = auth.uid())
    )
  );

-- ============================================================
-- Pre-filtering RPC function
-- ============================================================

CREATE OR REPLACE FUNCTION get_prefiltered_candidates(target_user_id UUID)
RETURNS TABLE(candidate_id UUID) AS $$
DECLARE
  target_gender gender_enum;
  target_age INTEGER;
  target_religion TEXT;
  target_marital_status marital_status_enum;
  target_smoking smoking_enum;
  target_drinking drinking_enum;
  target_diet diet_enum;
  target_state TEXT;
  target_pref_age_min INTEGER;
  target_pref_age_max INTEGER;
  target_pref_states TEXT[];
  target_pref_countries TEXT[];
  target_no_location_pref BOOLEAN;
  target_pref_smoking smoking_preference_enum;
  target_pref_drinking drinking_preference_enum;
BEGIN
  -- Fetch target user's profile data
  SELECT
    p.gender,
    EXTRACT(YEAR FROM age(p.date_of_birth))::INTEGER,
    p.religion,
    p.marital_status,
    p.smoking,
    p.drinking,
    p.diet,
    p.current_state
  INTO
    target_gender,
    target_age,
    target_religion,
    target_marital_status,
    target_smoking,
    target_drinking,
    target_diet,
    target_state
  FROM profiles p
  WHERE p.user_id = target_user_id;

  -- Fetch target user's partner preferences
  SELECT
    pp.preferred_age_min,
    pp.preferred_age_max,
    pp.preferred_indian_states,
    pp.preferred_countries,
    COALESCE(pp.no_location_preference, false),
    pp.smoking_preference,
    pp.drinking_preference
  INTO
    target_pref_age_min,
    target_pref_age_max,
    target_pref_states,
    target_pref_countries,
    target_no_location_pref,
    target_pref_smoking,
    target_pref_drinking
  FROM partner_preferences pp
  WHERE pp.user_id = target_user_id;

  RETURN QUERY
  SELECT u.id AS candidate_id
  FROM users u
  JOIN profiles p ON p.user_id = u.id
  LEFT JOIN partner_preferences pp ON pp.user_id = u.id
  WHERE
    -- 1. Not self
    u.id != target_user_id

    -- 2. Pool eligibility: BGV complete and in appropriate payment status
    AND u.is_bgv_complete = true
    AND u.payment_status IN ('in_pool', 'match_presented')

    -- 3. Gender: opposite gender match (heterosexual default for medical matrimony)
    AND p.gender IS NOT NULL
    AND target_gender IS NOT NULL
    AND p.gender != target_gender

    -- 4. Age: bidirectional range check
    AND EXTRACT(YEAR FROM age(p.date_of_birth))::INTEGER >= COALESCE(target_pref_age_min, 18)
    AND EXTRACT(YEAR FROM age(p.date_of_birth))::INTEGER <= COALESCE(target_pref_age_max, 99)
    AND target_age >= COALESCE(pp.preferred_age_min, 18)
    AND target_age <= COALESCE(pp.preferred_age_max, 99)

    -- 5. Location: if target has location preference, candidate's state must be in preferred list
    AND (
      target_no_location_pref = true
      OR target_pref_states IS NULL
      OR array_length(target_pref_states, 1) IS NULL
      OR p.current_state = ANY(target_pref_states)
    )
    -- Bidirectional: candidate's location preference must include target's state
    AND (
      COALESCE(pp.no_location_preference, false) = true
      OR pp.preferred_indian_states IS NULL
      OR array_length(pp.preferred_indian_states, 1) IS NULL
      OR target_state = ANY(pp.preferred_indian_states)
    )

    -- 6. Smoking: if target has preference (not 'no_preference'), candidate must match
    AND (
      target_pref_smoking IS NULL
      OR target_pref_smoking = 'no_preference'
      OR p.smoking::TEXT = target_pref_smoking::TEXT
    )
    -- Bidirectional
    AND (
      pp.smoking_preference IS NULL
      OR pp.smoking_preference = 'no_preference'
      OR target_smoking::TEXT = pp.smoking_preference::TEXT
    )

    -- 7. Drinking: if target has preference (not 'no_preference'), candidate must match
    AND (
      target_pref_drinking IS NULL
      OR target_pref_drinking = 'no_preference'
      OR p.drinking::TEXT = target_pref_drinking::TEXT
    )
    -- Bidirectional
    AND (
      pp.drinking_preference IS NULL
      OR pp.drinking_preference = 'no_preference'
      OR target_drinking::TEXT = pp.drinking_preference::TEXT
    )

    -- 8. Not already in match_suggestions (any status) — uses canonical ordering
    AND NOT EXISTS (
      SELECT 1 FROM match_suggestions ms
      WHERE ms.profile_a_id = LEAST(target_user_id, u.id)
        AND ms.profile_b_id = GREATEST(target_user_id, u.id)
    )
  ;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
