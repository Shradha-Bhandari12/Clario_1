-- Comprehensive migration to ensure ALL required columns exist in the exams table
ALTER TABLE exams ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE exams ADD COLUMN IF NOT EXISTS subject text;
ALTER TABLE exams ADD COLUMN IF NOT EXISTS class text;
ALTER TABLE exams ADD COLUMN IF NOT EXISTS division text;
ALTER TABLE exams ADD COLUMN IF NOT EXISTS exam_date date;
ALTER TABLE exams ADD COLUMN IF NOT EXISTS start_time text;
ALTER TABLE exams ADD COLUMN IF NOT EXISTS end_time text;
ALTER TABLE exams ADD COLUMN IF NOT EXISTS total_marks integer DEFAULT 100;
ALTER TABLE exams ADD COLUMN IF NOT EXISTS passing_marks integer DEFAULT 35;

-- Fix for potential 'name' column constraint issue
DO $$ 
BEGIN 
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='exams' AND column_name='name') THEN
    ALTER TABLE exams ALTER COLUMN name DROP NOT NULL;
  END IF;
END $$;


