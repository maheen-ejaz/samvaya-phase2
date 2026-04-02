-- ============================================================
-- Add abandonment tracking columns to users table
-- Supports 24h + 72h reminder emails for incomplete forms
-- ============================================================

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS last_form_activity_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS abandonment_reminder_count INTEGER NOT NULL DEFAULT 0;

-- Partial index for efficient cron queries — only in-progress users
CREATE INDEX idx_users_abandonment
  ON users(membership_status, last_form_activity_at)
  WHERE membership_status = 'onboarding_in_progress';
