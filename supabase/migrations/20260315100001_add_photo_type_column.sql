-- Add photo_type column to photos table for guided upload slots
-- Valid values: face_closeup, full_length, professional, casual, additional

ALTER TABLE photos ADD COLUMN photo_type TEXT;

-- Backfill existing data
UPDATE photos SET photo_type = 'face_closeup' WHERE is_primary = true AND photo_type IS NULL;
UPDATE photos SET photo_type = 'additional' WHERE is_primary = false AND photo_type IS NULL;

-- Update photos storage bucket to accept up to 25 MB (for large uploads before client-side compression)
UPDATE storage.buckets SET file_size_limit = 26214400 WHERE name = 'photos';
