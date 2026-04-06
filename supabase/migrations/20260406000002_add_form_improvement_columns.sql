-- Migration: Add columns for Phase 2F form improvements
-- Adds financial section fields, pg_degree_other, free_time_preferences,
-- and partner weight preference columns

-- profiles table additions
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS pg_degree_other TEXT,
  ADD COLUMN IF NOT EXISTS free_time_preferences TEXT[],
  ADD COLUMN IF NOT EXISTS annual_ctc_range TEXT,
  ADD COLUMN IF NOT EXISTS financial_stage TEXT,
  ADD COLUMN IF NOT EXISTS property_ownership TEXT[],
  ADD COLUMN IF NOT EXISTS investment_approach TEXT,
  ADD COLUMN IF NOT EXISTS has_education_loan BOOLEAN,
  ADD COLUMN IF NOT EXISTS cibil_score_range TEXT;

-- partner_preferences table additions
ALTER TABLE partner_preferences
  ADD COLUMN IF NOT EXISTS preferred_weight_min_kg INTEGER,
  ADD COLUMN IF NOT EXISTS preferred_weight_max_kg INTEGER;

-- Add constraints on weight columns
ALTER TABLE partner_preferences
  ADD CONSTRAINT preferred_weight_min_kg_range CHECK (preferred_weight_min_kg IS NULL OR (preferred_weight_min_kg >= 40 AND preferred_weight_min_kg <= 140)),
  ADD CONSTRAINT preferred_weight_max_kg_range CHECK (preferred_weight_max_kg IS NULL OR (preferred_weight_max_kg >= 40 AND preferred_weight_max_kg <= 140));
