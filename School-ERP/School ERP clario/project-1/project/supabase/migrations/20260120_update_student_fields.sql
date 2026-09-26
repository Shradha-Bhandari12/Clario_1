-- Add more fields to students table for better Student Info management
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS dob date,
ADD COLUMN IF NOT EXISTS gender text,
ADD COLUMN IF NOT EXISTS parent_name text,
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS blood_group text;
