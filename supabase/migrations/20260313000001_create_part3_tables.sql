-- Migration: Phase 2A Part 3 tables — system config, email templates,
-- communication_log alterations, activity_log index, analytics helpers.
-- Depends on: 20260327000001_create_admin_tables.sql

-- ============================================================
-- 1. system_config — Key-value store for configurable settings
-- ============================================================

CREATE TABLE IF NOT EXISTS system_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}',
  description TEXT,
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view system config" ON system_config;
CREATE POLICY "Admins can view system config"
  ON system_config FOR SELECT
  USING (is_admin());

DROP POLICY IF EXISTS "Admins can update system config" ON system_config;
CREATE POLICY "Admins can update system config"
  ON system_config FOR UPDATE
  USING (is_admin());

DROP POLICY IF EXISTS "Admins can insert system config" ON system_config;
CREATE POLICY "Admins can insert system config"
  ON system_config FOR INSERT
  WITH CHECK (is_admin());

-- Seed: pricing (locked), feature flags (editable)
INSERT INTO system_config (key, value, description) VALUES
  ('verification_fee', '{"amount": 600000, "gst_pct": 18, "total": 708000, "currency": "INR"}', 'Verification fee — LOCKED. ₹6,000 + 18% GST = ₹7,080'),
  ('membership_fee', '{"amount": 3500000, "gst_pct": 18, "total": 4130000, "currency": "INR"}', 'Membership fee — LOCKED. ₹35,000 + 18% GST = ₹41,300'),
  ('feature_flags', '{"airtable_sync_enabled": false, "bulk_email_enabled": true}', 'Feature toggles for admin features'),
  ('airtable_last_sync', '{"synced_at": null, "status": "never", "records_synced": 0}', 'Last Airtable sync status')
ON CONFLICT (key) DO NOTHING;

-- Seed: matching algorithm weights and config
INSERT INTO system_config (key, value, description) VALUES
(
  'matching_weights',
  '{
    "values_alignment": 1.5,
    "career_alignment": 1.5,
    "relocation_compatibility": 1.5,
    "communication_compatibility": 1.5,
    "lifestyle_compatibility": 1.0,
    "family_orientation": 1.0,
    "financial_alignment": 1.0,
    "emotional_compatibility": 1.0,
    "timeline_alignment": 1.0
  }'::jsonb,
  'Scoring dimension weights for matching algorithm. High-weight dimensions (1.5) are foundational; medium-weight (1.0) are important but more negotiable.'
),
(
  'matching_config',
  '{
    "min_score_for_suggestion": 65,
    "max_pairs_per_day": 50,
    "presentation_expiry_days": 7,
    "batch_concurrency": 3,
    "scoring_model": "claude-sonnet-4-20250514"
  }'::jsonb,
  'Matching algorithm configuration: score thresholds, rate limits, expiry, model version.'
)
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- 2. email_templates — Template library for bulk communications
-- ============================================================

CREATE TABLE IF NOT EXISTS email_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  variables TEXT[] DEFAULT '{}',
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS set_email_templates_updated_at ON email_templates;
CREATE TRIGGER set_email_templates_updated_at
  BEFORE UPDATE ON email_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view email templates" ON email_templates;
CREATE POLICY "Admins can view email templates"
  ON email_templates FOR SELECT
  USING (is_admin());

DROP POLICY IF EXISTS "Admins can insert email templates" ON email_templates;
CREATE POLICY "Admins can insert email templates"
  ON email_templates FOR INSERT
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can update email templates" ON email_templates;
CREATE POLICY "Admins can update email templates"
  ON email_templates FOR UPDATE
  USING (is_admin());

DROP POLICY IF EXISTS "Admins can delete email templates" ON email_templates;
CREATE POLICY "Admins can delete email templates"
  ON email_templates FOR DELETE
  USING (is_admin());

-- Seed default templates
INSERT INTO email_templates (name, subject, body, category, variables) VALUES
  (
    'Verification Fee Reminder',
    'Samvaya — Complete your verification to join the pool',
    'Hi {{first_name}},

Thank you for completing your Samvaya application. To proceed, please complete the background verification process.

Verification fee: ₹{{verification_fee}} (one-time, non-refundable)

Once your payment is confirmed, we will initiate the background verification. This typically takes 7–10 working days.

— The Samvaya Team',
    'payment',
    ARRAY['first_name', 'last_name', 'email', 'verification_fee']
  ),
  (
    'BGV Initiated',
    'Samvaya — Your background verification has begun',
    'Hi {{first_name}},

Your background verification is now underway. This process covers identity, education, employment, address, financial standing, and court records.

Timeline: 7–10 working days.

We will notify you as soon as verification is complete and your profile enters our candidate pool.

— The Samvaya Team',
    'verification',
    ARRAY['first_name', 'last_name', 'email']
  ),
  (
    'BGV Complete - Welcome to the Pool',
    'Samvaya — You are now in our candidate pool',
    'Hi {{first_name}},

Your background verification is complete, and your profile is now in our candidate pool.

What happens next: Our matching process will identify compatible profiles for you. When we find a strong match, we will reach out with details. You do not need to take any action — we will be in touch.

— The Samvaya Team',
    'verification',
    ARRAY['first_name', 'last_name', 'email']
  )
ON CONFLICT (name) DO NOTHING;

-- NOTE: communication_log and activity_log alterations moved to
-- 20260327000001_create_admin_tables.sql (where those tables are created)

-- ============================================================
-- 3. Analytics RPC — specialty distribution (unnest)
-- ============================================================

CREATE OR REPLACE FUNCTION get_specialty_distribution()
RETURNS TABLE(specialty TEXT, count BIGINT)
LANGUAGE sql STABLE
AS $$
  SELECT unnest(mc.specialty) AS specialty, COUNT(*) AS count
  FROM medical_credentials mc
  JOIN users u ON mc.user_id = u.id
  WHERE u.role = 'applicant'
  GROUP BY 1
  ORDER BY 2 DESC;
$$;

-- ============================================================
-- 6. Analytics RPC — geographic distribution
-- ============================================================

CREATE OR REPLACE FUNCTION get_geographic_distribution()
RETURNS TABLE(state TEXT, city TEXT, count BIGINT)
LANGUAGE sql STABLE
AS $$
  SELECT
    COALESCE(p.current_state, 'Unknown') AS state,
    COALESCE(p.current_city, 'Unknown') AS city,
    COUNT(*) AS count
  FROM profiles p
  JOIN users u ON p.user_id = u.id
  WHERE u.role = 'applicant'
  GROUP BY p.current_state, p.current_city
  ORDER BY count DESC
  LIMIT 20;
$$;
