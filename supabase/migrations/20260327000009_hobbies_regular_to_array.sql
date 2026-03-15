-- Convert hobbies_regular from TEXT to TEXT[] for multi-select storage.
-- Preserves any existing text values by wrapping them in a single-element array.
ALTER TABLE profiles ALTER COLUMN hobbies_regular TYPE TEXT[]
  USING CASE
    WHEN hobbies_regular IS NULL THEN NULL
    ELSE ARRAY[hobbies_regular]
  END;
