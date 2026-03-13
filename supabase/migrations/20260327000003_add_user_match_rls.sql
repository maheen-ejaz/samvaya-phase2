-- Phase 2C: Add RLS policies for user-facing match access
-- Users can read their own match presentations and feedback
-- Using DROP IF EXISTS + CREATE to handle policies that may already exist from earlier migrations

-- Users can view match presentations where they are profile A or B
DROP POLICY IF EXISTS "Users can view own match presentations" ON match_presentations;
CREATE POLICY "Users can view own match presentations"
  ON match_presentations FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM match_suggestions ms
    WHERE ms.id = match_presentations.match_suggestion_id
    AND (ms.profile_a_id = auth.uid() OR ms.profile_b_id = auth.uid())
  ));

-- Users can update their own response on match presentations
-- (defense-in-depth — respond route uses service-role client, but this protects against bypass)
DROP POLICY IF EXISTS "Users can update own response on match presentations" ON match_presentations;
CREATE POLICY "Users can update own response on match presentations"
  ON match_presentations FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM match_suggestions ms
    WHERE ms.id = match_presentations.match_suggestion_id
    AND (ms.profile_a_id = auth.uid() OR ms.profile_b_id = auth.uid())
  ));

-- Users can read match suggestions they are part of (limited fields enforced at API level)
DROP POLICY IF EXISTS "Users can view own match suggestions" ON match_suggestions;
CREATE POLICY "Users can view own match suggestions"
  ON match_suggestions FOR SELECT
  USING (
    profile_a_id = auth.uid() OR profile_b_id = auth.uid()
  );

-- Users can read their own match feedback
DROP POLICY IF EXISTS "Users can view own match feedback" ON match_feedback;
CREATE POLICY "Users can view own match feedback"
  ON match_feedback FOR SELECT
  USING (user_id = auth.uid());

-- Users can insert their own match feedback
DROP POLICY IF EXISTS "Users can insert own feedback" ON match_feedback;
CREATE POLICY "Users can insert own feedback"
  ON match_feedback FOR INSERT
  WITH CHECK (user_id = auth.uid());
