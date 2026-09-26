-- 1. Create Homework Submissions Table
CREATE TABLE IF NOT EXISTS homework_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_no text NOT NULL REFERENCES students(registration_no) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  file_url text NOT NULL,
  status text DEFAULT 'pending', -- 'pending', 'reviewed'
  marks numeric,
  teacher_notes text,
  submitted_at timestamptz DEFAULT now()
);

-- 2. Enable RLS on the table
ALTER TABLE homework_submissions ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies for the table
CREATE POLICY "Anyone can view homework" ON homework_submissions FOR SELECT USING (true);
CREATE POLICY "Anyone can insert homework" ON homework_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update homework" ON homework_submissions FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete homework" ON homework_submissions FOR DELETE USING (true);

-- 4. Enable Supabase Storage (if not already enabled)
-- Note: You might need to create the 'homework' bucket manually in the Supabase Dashboard UI
-- OR run the following to create the bucket (requires extensions)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('homework', 'homework', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Set Storage Policies (allowing anyone to upload/read for this project's simplicity)
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'homework' );

CREATE POLICY "Public Insert Access"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'homework' );

CREATE POLICY "Public Update Access"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'homework' );

CREATE POLICY "Public Delete Access"
ON storage.objects FOR DELETE
USING ( bucket_id = 'homework' );
