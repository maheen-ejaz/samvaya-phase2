-- Phase 2C Audit Fix: Atomic match response handler
-- Prevents race conditions by using row-level locking and a single transaction

CREATE OR REPLACE FUNCTION handle_match_response(
  p_presentation_id UUID,
  p_user_id UUID,
  p_response TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_presentation RECORD;
  v_suggestion RECORD;
  v_is_a BOOLEAN;
  v_is_b BOOLEAN;
  v_new_a_response TEXT;
  v_new_b_response TEXT;
  v_new_status TEXT;
  v_is_mutual BOOLEAN := FALSE;
  v_now TIMESTAMPTZ := NOW();
  v_profile_a_id UUID;
  v_profile_b_id UUID;
BEGIN
  -- Validate response value
  IF p_response NOT IN ('interested', 'not_interested') THEN
    RETURN jsonb_build_object('error', 'response must be "interested" or "not_interested"', 'status_code', 400);
  END IF;

  -- Lock the presentation row to prevent concurrent modifications
  SELECT * INTO v_presentation
  FROM match_presentations
  WHERE id = p_presentation_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Match not found', 'status_code', 404);
  END IF;

  -- Fetch the associated suggestion
  SELECT * INTO v_suggestion
  FROM match_suggestions
  WHERE id = v_presentation.match_suggestion_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Match suggestion not found', 'status_code', 404);
  END IF;

  v_profile_a_id := v_suggestion.profile_a_id;
  v_profile_b_id := v_suggestion.profile_b_id;

  -- Verify user is part of this match
  v_is_a := (v_profile_a_id = p_user_id);
  v_is_b := (v_profile_b_id = p_user_id);

  IF NOT v_is_a AND NOT v_is_b THEN
    RETURN jsonb_build_object('error', 'Match not found', 'status_code', 404);
  END IF;

  -- Check presentation status
  IF v_presentation.status != 'pending' THEN
    RETURN jsonb_build_object('error', format('This match is already %s', v_presentation.status), 'status_code', 409);
  END IF;

  -- Check expiry (server clock, not JS clock)
  IF v_presentation.expires_at IS NOT NULL AND v_presentation.expires_at < v_now THEN
    UPDATE match_presentations SET
      status = 'expired',
      member_a_response = CASE WHEN member_a_response = 'pending' THEN 'expired' ELSE member_a_response END,
      member_b_response = CASE WHEN member_b_response = 'pending' THEN 'expired' ELSE member_b_response END
    WHERE id = p_presentation_id;

    RETURN jsonb_build_object('error', 'This match has expired', 'status_code', 410);
  END IF;

  -- Check user hasn't already responded
  IF v_is_a AND v_presentation.member_a_response != 'pending' THEN
    RETURN jsonb_build_object('error', 'You have already responded to this match', 'status_code', 409);
  END IF;
  IF v_is_b AND v_presentation.member_b_response != 'pending' THEN
    RETURN jsonb_build_object('error', 'You have already responded to this match', 'status_code', 409);
  END IF;

  -- Compute new responses
  IF v_is_a THEN
    v_new_a_response := p_response;
    v_new_b_response := v_presentation.member_b_response;
  ELSE
    v_new_a_response := v_presentation.member_a_response;
    v_new_b_response := p_response;
  END IF;

  -- Compute new status
  v_new_status := 'pending';
  IF v_new_a_response != 'pending' AND v_new_b_response != 'pending' THEN
    IF v_new_a_response = 'interested' AND v_new_b_response = 'interested' THEN
      v_is_mutual := TRUE;
      v_new_status := 'mutual_interest';
    ELSIF v_new_a_response = 'not_interested' AND v_new_b_response = 'not_interested' THEN
      v_new_status := 'declined';
    ELSE
      v_new_status := 'one_sided';
    END IF;
  END IF;

  -- Update the presentation atomically
  UPDATE match_presentations SET
    member_a_response = CASE WHEN v_is_a THEN p_response ELSE member_a_response END,
    member_a_responded_at = CASE WHEN v_is_a THEN v_now ELSE member_a_responded_at END,
    member_b_response = CASE WHEN v_is_b THEN p_response ELSE member_b_response END,
    member_b_responded_at = CASE WHEN v_is_b THEN v_now ELSE member_b_responded_at END,
    status = v_new_status,
    is_mutual_interest = v_is_mutual
  WHERE id = p_presentation_id;

  -- If mutual interest: update both users' payment_status and set membership_start_date
  IF v_is_mutual THEN
    -- Update profile A
    UPDATE users SET payment_status = 'awaiting_payment'
    WHERE id = v_profile_a_id AND payment_status = 'match_presented';

    UPDATE payments SET membership_start_date = v_now
    WHERE user_id = v_profile_a_id AND membership_start_date IS NULL;

    -- Update profile B
    UPDATE users SET payment_status = 'awaiting_payment'
    WHERE id = v_profile_b_id AND payment_status = 'match_presented';

    UPDATE payments SET membership_start_date = v_now
    WHERE user_id = v_profile_b_id AND membership_start_date IS NULL;
  END IF;

  RETURN jsonb_build_object(
    'success', TRUE,
    'status', v_new_status,
    'is_mutual_interest', v_is_mutual
  );
END;
$$;
