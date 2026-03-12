-- Phase 2C: Add RLS policies for user-facing match access
-- Users can read their own match presentations and feedback

-- Users can view match presentations where they are profile A or B
CREATE POLICY "Users can view own match presentations"
  ON match_presentations FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM match_suggestions ms
    WHERE ms.id = match_presentations.match_suggestion_id
    AND (ms.profile_a_id = auth.uid() OR ms.profile_b_id = auth.uid())
  ));

-- Users can update their own response on match presentations
-- (defense-in-depth — respond route uses service-role client, but this protects against bypass)
CREATE POLICY "Users can update own response on match presentations"
  ON match_presentations FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM match_suggestions ms
    WHERE ms.id = match_presentations.match_suggestion_id
    AND (ms.profile_a_id = auth.uid() OR ms.profile_b_id = auth.uid())
  ));

-- Users can read match suggestions they are part of (limited fields enforced at API level)
CREATE POLICY "Users can view own match suggestions"
  ON match_suggestions FOR SELECT
  USING (
    profile_a_id = auth.uid() OR profile_b_id = auth.uid()
  );

-- Users can read their own match feedback
CREATE POLICY "Users can view own match feedback"
  ON match_feedback FOR SELECT
  USING (user_id = auth.uid());

-- Users can insert their own match feedback (already exists if created during Phase 2B, safe to add)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'match_feedback'
    AND policyname = 'Users can insert own feedback'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can insert own feedback"
      ON match_feedback FOR INSERT
      WITH CHECK (user_id = auth.uid())';
  END IF;
END $$;
