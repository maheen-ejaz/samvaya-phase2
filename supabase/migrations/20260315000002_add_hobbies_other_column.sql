-- Add hobbies_other column for Q55 ("Any other hobbies not listed?")
-- Previously Q55 shared hobbies_regular with Q54, causing overwrites.
ALTER TABLE profiles ADD COLUMN hobbies_other TEXT;
COMMENT ON COLUMN profiles.hobbies_other IS 'Q55: Other hobbies not in the predefined list';
