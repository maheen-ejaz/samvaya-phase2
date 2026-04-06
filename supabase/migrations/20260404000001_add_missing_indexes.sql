-- Add missing indexes identified during Phase 2F pre-launch audit
-- These columns are used in frequent queries but lacked indexes.

CREATE INDEX IF NOT EXISTS idx_users_bgv_consent ON users(bgv_consent);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_match_presentations_is_mutual_interest ON match_presentations(is_mutual_interest);

-- Pass 2 audit additions
CREATE INDEX IF NOT EXISTS idx_users_is_goocampus_member ON users(is_goocampus_member);
