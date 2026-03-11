-- Migration 3: Row-Level Security policies for all form tables
-- Every table gets RLS enabled. Access patterns:
--   - Applicants: read/write own data only
--   - Admins: read all, write admin-controlled fields
--   - Payments: admin-only write access

-- ============================================================
-- Helper: reusable admin check
-- ============================================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- users
-- ============================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own record"
  ON users FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can update own onboarding fields"
  ON users FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can update all users"
  ON users FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins can insert users"
  ON users FOR INSERT
  WITH CHECK (is_admin());

-- ============================================================
-- profiles
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  USING (is_admin());

-- ============================================================
-- medical_credentials
-- ============================================================

ALTER TABLE medical_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own medical credentials"
  ON medical_credentials FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own medical credentials"
  ON medical_credentials FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own medical credentials"
  ON medical_credentials FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all medical credentials"
  ON medical_credentials FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can update all medical credentials"
  ON medical_credentials FOR UPDATE
  USING (is_admin());

-- ============================================================
-- partner_preferences
-- ============================================================

ALTER TABLE partner_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own partner preferences"
  ON partner_preferences FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own partner preferences"
  ON partner_preferences FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own partner preferences"
  ON partner_preferences FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all partner preferences"
  ON partner_preferences FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can update all partner preferences"
  ON partner_preferences FOR UPDATE
  USING (is_admin());

-- ============================================================
-- compatibility_profiles
-- ============================================================

ALTER TABLE compatibility_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own compatibility profile"
  ON compatibility_profiles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own compatibility profile"
  ON compatibility_profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own compatibility profile"
  ON compatibility_profiles FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all compatibility profiles"
  ON compatibility_profiles FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can update all compatibility profiles"
  ON compatibility_profiles FOR UPDATE
  USING (is_admin());

-- ============================================================
-- photos
-- ============================================================

ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own photos"
  ON photos FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own photos"
  ON photos FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own photos"
  ON photos FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own photos"
  ON photos FOR DELETE
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all photos"
  ON photos FOR SELECT
  USING (is_admin());

-- ============================================================
-- documents
-- ============================================================

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own documents"
  ON documents FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own documents"
  ON documents FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own documents"
  ON documents FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own documents"
  ON documents FOR DELETE
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all documents"
  ON documents FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can update all documents"
  ON documents FOR UPDATE
  USING (is_admin());

-- ============================================================
-- payments (admin-only write access)
-- ============================================================

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all payments"
  ON payments FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can insert payments"
  ON payments FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update payments"
  ON payments FOR UPDATE
  USING (is_admin());

-- ============================================================
-- Storage policies (for reference — applied via Supabase dashboard)
-- ============================================================
-- Bucket: photos (private)
--   - Users can upload to photos/{user_id}/*
--   - Users can read from photos/{user_id}/*
--   - Admins can read all
--
-- Bucket: documents (private)
--   - Users can upload to documents/{user_id}/*
--   - Users can read from documents/{user_id}/*
--   - Admins can read all
