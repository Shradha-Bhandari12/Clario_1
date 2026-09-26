-- Create Holidays Table
CREATE TABLE IF NOT EXISTS holidays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  date_range text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view holidays" ON holidays FOR SELECT USING (true);
CREATE POLICY "Anyone can manage holidays" ON holidays FOR ALL USING (true);

-- Insert sample holidays
INSERT INTO holidays (name, date_range)
VALUES 
  ('Republic Day', 'Jan 26, 2026'),
  ('Holi', 'Mar 14, 2026'),
  ('Eid al-Fitr', 'Mar 31, 2026'),
  ('Summer Vacation', 'May 01 - Jun 10')
ON CONFLICT DO NOTHING;
