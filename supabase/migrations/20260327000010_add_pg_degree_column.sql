-- Add pg_degree column to medical_credentials for PG degree type (MD, MS, MCh, DM, DNB)
ALTER TABLE medical_credentials ADD COLUMN IF NOT EXISTS pg_degree text;
