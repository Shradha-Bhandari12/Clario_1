-- Add venue column to exams table if it doesn't exist
-- This migration ensures the venue column exists and is required

DO $$ 
BEGIN
  -- Check if the column exists
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'exams' 
    AND column_name = 'venue'
  ) THEN
    -- Add the column if it doesn't exist
    ALTER TABLE exams ADD COLUMN venue text NOT NULL DEFAULT 'TBD';
    -- Remove the default after adding the column
    ALTER TABLE exams ALTER COLUMN venue DROP DEFAULT;
  ELSE
    -- If column exists, ensure it's NOT NULL
    ALTER TABLE exams ALTER COLUMN venue SET NOT NULL;
  END IF;
END $$;
