-- Add is_paused flag to users table for profile visibility control
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_paused BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS paused_at TIMESTAMPTZ;

-- Create notification_preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  email_new_match BOOLEAN NOT NULL DEFAULT true,
  email_match_response BOOLEAN NOT NULL DEFAULT true,
  email_status_update BOOLEAN NOT NULL DEFAULT true,
  email_promotions BOOLEAN NOT NULL DEFAULT false,
  push_new_match BOOLEAN NOT NULL DEFAULT true,
  push_match_response BOOLEAN NOT NULL DEFAULT true,
  push_status_update BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS policies for notification_preferences
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notification preferences"
  ON notification_preferences FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notification preferences"
  ON notification_preferences FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own notification preferences"
  ON notification_preferences FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all notification preferences"
  ON notification_preferences FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );
