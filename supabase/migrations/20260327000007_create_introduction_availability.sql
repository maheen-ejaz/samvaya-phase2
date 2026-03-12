-- Introduction availability slots submitted by users
CREATE TABLE IF NOT EXISTS introduction_availability (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  match_presentation_id UUID NOT NULL REFERENCES match_presentations(id) ON DELETE CASCADE,
  available_date DATE NOT NULL,
  time_slot TEXT NOT NULL, -- e.g., 'morning', 'afternoon', 'evening'
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT introduction_availability_unique UNIQUE (user_id, match_presentation_id, available_date, time_slot)
);

CREATE TRIGGER set_introduction_availability_updated_at
  BEFORE UPDATE ON introduction_availability
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_introduction_availability_user ON introduction_availability(user_id);
CREATE INDEX idx_introduction_availability_presentation ON introduction_availability(match_presentation_id);

-- RLS policies
ALTER TABLE introduction_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own availability"
  ON introduction_availability FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all availability"
  ON introduction_availability FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );
