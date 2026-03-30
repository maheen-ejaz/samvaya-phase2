-- Daily snapshots for KPI trend tracking
CREATE TABLE IF NOT EXISTS daily_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date DATE NOT NULL UNIQUE,
  waitlist_total INTEGER NOT NULL DEFAULT 0,
  waitlist_invited INTEGER NOT NULL DEFAULT 0,
  signed_up INTEGER NOT NULL DEFAULT 0,
  form_in_progress INTEGER NOT NULL DEFAULT 0,
  form_complete INTEGER NOT NULL DEFAULT 0,
  payment_verified INTEGER NOT NULL DEFAULT 0,
  bgv_complete INTEGER NOT NULL DEFAULT 0,
  in_pool INTEGER NOT NULL DEFAULT 0,
  matches_active INTEGER NOT NULL DEFAULT 0,
  active_members INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for efficient date range queries
CREATE INDEX IF NOT EXISTS idx_daily_snapshots_date ON daily_snapshots (snapshot_date DESC);

-- RLS: admin-only access
ALTER TABLE daily_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin read daily_snapshots"
  ON daily_snapshots
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin')
    )
  );
