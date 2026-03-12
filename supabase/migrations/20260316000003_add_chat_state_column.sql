-- Add chat_state JSONB column to compatibility_profiles
-- Stores in-progress conversation state for save-and-resume
-- Structure: { "Q38": { messages: [...], exchangeCount: N, isComplete: bool }, "Q75": {...}, "Q100": {...} }
ALTER TABLE compatibility_profiles ADD COLUMN IF NOT EXISTS chat_state jsonb DEFAULT '{}';
