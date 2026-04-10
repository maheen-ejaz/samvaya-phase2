-- Analytics performance indexes — Phase 2F pre-launch
-- These tables are queried heavily by the analytics route and pre-filter RPC
-- but lacked indexes on key lookup columns.

CREATE INDEX IF NOT EXISTS idx_match_suggestions_created_at
  ON match_suggestions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_match_presentations_created_at
  ON match_presentations(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_compatibility_profiles_user_id
  ON compatibility_profiles(user_id);

CREATE INDEX IF NOT EXISTS idx_partner_preferences_user_id
  ON partner_preferences(user_id);
