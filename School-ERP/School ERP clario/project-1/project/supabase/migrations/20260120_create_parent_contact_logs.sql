-- Create Parent Contact Logs Table
CREATE TABLE IF NOT EXISTS parent_contact_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_registration_no text REFERENCES students(registration_no) ON DELETE CASCADE,
  contact_type text NOT NULL, -- 'call', 'sms', 'email', 'meeting', 'other'
  subject text NOT NULL,
  notes text,
  contacted_by text, -- Admin name
  contact_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE parent_contact_logs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view parent contact logs" ON parent_contact_logs FOR SELECT USING (true);
CREATE POLICY "Anyone can manage parent contact logs" ON parent_contact_logs FOR ALL USING (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_parent_contact_logs_student ON parent_contact_logs(student_registration_no);
CREATE INDEX IF NOT EXISTS idx_parent_contact_logs_date ON parent_contact_logs(contact_date DESC);
