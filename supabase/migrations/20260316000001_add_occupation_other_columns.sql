-- Add separate columns for "Other" occupation descriptions
-- Fixes data loss where Q34/Q37 were overwriting Q33/Q36 values

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS father_occupation_other TEXT,
  ADD COLUMN IF NOT EXISTS mother_occupation_other TEXT;
