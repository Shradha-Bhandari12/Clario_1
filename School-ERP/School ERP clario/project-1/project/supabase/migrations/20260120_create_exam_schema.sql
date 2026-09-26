-- Create Exams Table
CREATE TABLE IF NOT EXISTS exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL, -- e.g. Midterm 2026, Final Exam
  subject text NOT NULL,
  class text NOT NULL,
  exam_date date NOT NULL,
  start_time text,
  end_time text,
  total_marks integer DEFAULT 100,
  passing_marks integer DEFAULT 35,
  created_at timestamptz DEFAULT now()
);

-- Create Exam Results Table
CREATE TABLE IF NOT EXISTS exam_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id uuid REFERENCES exams(id) ON DELETE CASCADE,
  registration_no text REFERENCES students(registration_no) ON DELETE CASCADE,
  marks_obtained integer NOT NULL,
  total_marks integer NOT NULL,
  grade text,
  remarks text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(exam_id, registration_no)
);

-- Enable RLS
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view exams" ON exams FOR SELECT USING (true);
CREATE POLICY "Anyone can manage exams" ON exams FOR ALL USING (true);

CREATE POLICY "Anyone can view exam results" ON exam_results FOR SELECT USING (true);
CREATE POLICY "Anyone can manage exam results" ON exam_results FOR ALL USING (true);
