-- Phase 2F: Enhance admin_tasks for dedicated Tasks page
-- Adds: priority, updated status values, task_category, applicant contact fields

-- 1. Add priority column
ALTER TABLE admin_tasks
  ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'normal';

-- 2. Add task_category column (call | email | review | bgv | payment | manual)
ALTER TABLE admin_tasks
  ADD COLUMN IF NOT EXISTS task_category TEXT NOT NULL DEFAULT 'manual';

-- 3. Add denormalized applicant contact fields (avoids extra joins on tasks page)
ALTER TABLE admin_tasks
  ADD COLUMN IF NOT EXISTS applicant_name TEXT;

ALTER TABLE admin_tasks
  ADD COLUMN IF NOT EXISTS applicant_phone TEXT;

ALTER TABLE admin_tasks
  ADD COLUMN IF NOT EXISTS applicant_email TEXT;

-- 4. Migrate existing status values to new vocabulary
--    needs_action → open
--    done → closed
--    in_progress stays the same
UPDATE admin_tasks SET status = 'open'   WHERE status = 'needs_action';
UPDATE admin_tasks SET status = 'closed' WHERE status = 'done';

-- 5. Add indexes for the new columns
CREATE INDEX IF NOT EXISTS admin_tasks_priority_idx ON admin_tasks (priority);
CREATE INDEX IF NOT EXISTS admin_tasks_category_idx ON admin_tasks (task_category);
