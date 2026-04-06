-- Create admin_tasks table for task management on the admin dashboard

CREATE TABLE admin_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_type TEXT NOT NULL,
  -- Types: confirm_payment | review_bgv | review_match |
  --        followup_verification | followup_stalled | manual
  title TEXT NOT NULL,
  entity_type TEXT,       -- 'user' | 'match_suggestion' | null for manual
  entity_id TEXT,         -- user_id or match_suggestion_id
  status TEXT NOT NULL DEFAULT 'needs_action',
  -- Statuses: needs_action | in_progress | done
  due_date DATE,
  notes TEXT,
  action_href TEXT,       -- deep link (e.g. /admin/applicants/[id])
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  is_auto_generated BOOLEAN NOT NULL DEFAULT false,
  UNIQUE (task_type, entity_id)  -- prevents duplicate auto-tasks per entity
);

CREATE INDEX admin_tasks_status_idx ON admin_tasks(status);
CREATE INDEX admin_tasks_created_at_idx ON admin_tasks(created_at DESC);

ALTER TABLE admin_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Only authenticated admins/super_admins can access
-- Note: Service role (API routes) bypass RLS, so we use service_role queries
-- But we still define a policy for safety
CREATE POLICY "Admins can manage tasks" ON admin_tasks
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

GRANT ALL PRIVILEGES ON admin_tasks TO authenticated;
