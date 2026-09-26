-- Create FAQ Table for Knowledge Base
CREATE TABLE IF NOT EXISTS faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  category text DEFAULT 'General',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view faqs" ON faqs FOR SELECT USING (true);
CREATE POLICY "Anyone can manage faqs" ON faqs FOR ALL USING (true);

-- Insert sample FAQs
INSERT INTO faqs (question, answer, category)
VALUES 
  ('What are the school hours?', 'School hours are from 8:00 AM to 2:30 PM, Monday through Friday.', 'General'),
  ('How can I pay the fees?', 'Fees can be paid online through the student portal or at the school office.', 'Fees'),
  ('Is there a school bus facility?', 'Yes, the school provides bus facilities for all major routes in the city.', 'Transportation')
ON CONFLICT DO NOTHING;
