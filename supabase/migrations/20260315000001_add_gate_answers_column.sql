-- Add gate_answers JSONB column to users table
-- Stores answers for "gate" questions (Q10, Q19, Q24) that control
-- conditional visibility but don't map to a dedicated DB column.
-- Format: {"Q10": "yes", "Q19": "no", "Q24": "yes"}

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS gate_answers jsonb DEFAULT '{}'::jsonb;

-- Allow the column in RLS (already covered by existing users policies)
