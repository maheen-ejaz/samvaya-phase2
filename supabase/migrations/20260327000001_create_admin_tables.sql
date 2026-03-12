-- Migration: Create admin dashboard tables
-- Depends on: 20260312000001_create_enum_types.sql, 20260312000002_create_form_tables.sql

-- ============================================================
-- New enum types for admin tables
-- ============================================================

CREATE TYPE bgv_check_type_enum AS ENUM (
  'aadhaar',
  'pan',
  'bank_account',
  'credit_check',
  'employment',
  'education',
  'professional_reference',
  'court_records',
  'criminal_records',
  'global_database',
  'address_digital',
  'address_physical',
  'social_media'
);

CREATE TYPE bgv_check_status_enum AS ENUM (
  'pending',
  'in_progress',
  'verified',
  'flagged'
);

CREATE TYPE admin_note_entity_enum AS ENUM (
  'user',
  'match_suggestion',
  'match_presentation',
  'introduction'
);

CREATE TYPE comm_channel_enum AS ENUM ('email', 'sms');

CREATE TYPE comm_status_enum AS ENUM ('sent', 'failed', 'pending');

-- ============================================================
-- 1. bgv_checks — 13 OnGrid checks per applicant
-- ============================================================

CREATE TABLE bgv_checks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  check_type bgv_check_type_enum NOT NULL,
  status bgv_check_status_enum NOT NULL DEFAULT 'pending',
  document_path TEXT,
  notes TEXT,
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Each user has exactly one row per check type
  UNIQUE (user_id, check_type)
);

CREATE TRIGGER set_bgv_checks_updated_at
  BEFORE UPDATE ON bgv_checks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 2. admin_notes — Team notes on entities
-- ============================================================

CREATE TABLE admin_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type admin_note_entity_enum NOT NULL,
  entity_id UUID NOT NULL,
  admin_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  note_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_admin_notes_updated_at
  BEFORE UPDATE ON admin_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 3. activity_log — Audit trail for admin actions
-- ============================================================

CREATE TABLE activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 4. communication_log — Emails/SMS sent to applicants
-- ============================================================

CREATE TABLE communication_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sent_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  channel comm_channel_enum NOT NULL,
  subject TEXT,
  body TEXT NOT NULL,
  status comm_status_enum NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX idx_bgv_checks_user_id ON bgv_checks(user_id);
CREATE INDEX idx_admin_notes_entity ON admin_notes(entity_type, entity_id);
CREATE INDEX idx_admin_notes_admin_user ON admin_notes(admin_user_id);
CREATE INDEX idx_activity_log_entity ON activity_log(entity_type, entity_id);
CREATE INDEX idx_activity_log_actor ON activity_log(actor_id);
CREATE INDEX idx_activity_log_created_at ON activity_log(created_at DESC);
CREATE INDEX idx_communication_log_user ON communication_log(user_id);
CREATE INDEX idx_communication_log_sent_by ON communication_log(sent_by);

-- ============================================================
-- RLS — defense-in-depth (admin code uses service-role client)
-- ============================================================

ALTER TABLE bgv_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all BGV checks"
  ON bgv_checks FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can insert BGV checks"
  ON bgv_checks FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update BGV checks"
  ON bgv_checks FOR UPDATE
  USING (is_admin());

-- ---

ALTER TABLE admin_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all notes"
  ON admin_notes FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can insert notes"
  ON admin_notes FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update own notes"
  ON admin_notes FOR UPDATE
  USING (admin_user_id = auth.uid());

-- ---

ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view activity log"
  ON activity_log FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can insert activity log"
  ON activity_log FOR INSERT
  WITH CHECK (is_admin());

-- ---

ALTER TABLE communication_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all communications"
  ON communication_log FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can insert communications"
  ON communication_log FOR INSERT
  WITH CHECK (is_admin());
