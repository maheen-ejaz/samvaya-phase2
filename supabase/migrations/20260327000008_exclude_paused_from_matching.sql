-- Exclude paused users from pre-filtering candidates
-- When is_paused = true, the user should not appear in match suggestions

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

    -- 2b. Exclude paused users
    AND COALESCE(u.is_paused, false) = false

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
