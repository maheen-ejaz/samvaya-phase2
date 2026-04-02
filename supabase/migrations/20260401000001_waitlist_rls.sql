-- ============================================================
-- Add RLS to waitlist table (was missing from initial migration)
-- Fixes Supabase security alert: "Table publicly accessible"
-- ============================================================

ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Admin-only access — waitlist is managed by the team, not applicants
CREATE POLICY "Admins can view all waitlist entries"
  ON waitlist FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can insert waitlist entries"
  ON waitlist FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update waitlist entries"
  ON waitlist FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins can delete waitlist entries"
  ON waitlist FOR DELETE
  USING (is_admin());
