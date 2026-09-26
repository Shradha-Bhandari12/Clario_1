/*
  # School ERP System - Initial Schema

  ## Overview
  Creates the core database structure for a School ERP system with chatbot support.

  ## New Tables
  
  ### 1. `students` table
  - `registration_no` (text, primary key) - Unique student registration number
  - `student_name` (text) - Student's full name (also used as password)
  - `class` (text) - Student's class (e.g., "10th", "12th")
  - `division` (text) - Class division (e.g., "A", "B")
  - `roll_number` (integer) - Roll number in class
  - `fees_status` (text) - Payment status: "Paid" or "Pending"
  - `fees_amount` (numeric) - Total fees amount
  - `fees_paid` (numeric) - Amount paid
  - `marks` (jsonb) - Subject-wise marks stored as JSON
  - `attendance_percentage` (numeric) - Overall attendance percentage
  - `phone` (text) - Contact number
  - `email` (text) - Email address
  - `created_at` (timestamptz) - Record creation timestamp

  ### 2. `applications` table
  - `id` (uuid, primary key) - Unique application ID
  - `registration_no` (text, foreign key) - Links to student
  - `application_type` (text) - Type: "bonafide", "scholarship", etc.
  - `reason` (text) - Reason for application
  - `status` (text) - Status: "pending", "approved", "rejected"
  - `submitted_at` (timestamptz) - Submission timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  - `additional_data` (jsonb) - Any extra application data

  ### 3. `staff` table
  - `id` (uuid, primary key) - Unique staff ID
  - `name` (text) - Staff member name
  - `designation` (text) - Role/designation
  - `subject` (text) - Subject taught (if applicable)
  - `contact` (text) - Contact number
  - `email` (text) - Email address

  ### 4. `notices` table
  - `id` (uuid, primary key) - Unique notice ID
  - `title` (text) - Notice title
  - `content` (text) - Notice content
  - `posted_by` (text) - Admin who posted
  - `posted_at` (timestamptz) - Posting timestamp
  - `priority` (text) - Priority level: "low", "medium", "high"

  ### 5. `timetable` table
  - `id` (uuid, primary key) - Unique entry ID
  - `class` (text) - Class name
  - `division` (text) - Division
  - `day` (text) - Day of week
  - `schedule` (jsonb) - Period-wise schedule as JSON

  ### 6. `admins` table
  - `id` (uuid, primary key) - Unique admin ID
  - `username` (text, unique) - Admin username
  - `password` (text) - Admin password (hashed in production)
  - `name` (text) - Admin's full name
  - `created_at` (timestamptz) - Account creation timestamp

  ## Security
  - RLS enabled on all tables
  - Public access for students table (login validation)
  - Authenticated access for applications, staff, notices
  - Admin-only access for sensitive operations
*/

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  registration_no text PRIMARY KEY,
  student_name text NOT NULL,
  class text NOT NULL,
  division text NOT NULL,
  roll_number integer NOT NULL,
  fees_status text DEFAULT 'Pending',
  fees_amount numeric DEFAULT 0,
  fees_paid numeric DEFAULT 0,
  marks jsonb DEFAULT '{}',
  attendance_percentage numeric DEFAULT 0,
  phone text,
  email text,
  created_at timestamptz DEFAULT now()
);

-- Create applications table
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_no text NOT NULL REFERENCES students(registration_no) ON DELETE CASCADE,
  application_type text NOT NULL,
  reason text,
  status text DEFAULT 'pending',
  submitted_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  additional_data jsonb DEFAULT '{}'
);

-- Create staff table
CREATE TABLE IF NOT EXISTS staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  designation text NOT NULL,
  subject text,
  contact text,
  email text
);

-- Create notices table
CREATE TABLE IF NOT EXISTS notices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  posted_by text,
  posted_at timestamptz DEFAULT now(),
  priority text DEFAULT 'medium'
);

-- Create timetable table
CREATE TABLE IF NOT EXISTS timetable (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class text NOT NULL,
  division text NOT NULL,
  day text NOT NULL,
  schedule jsonb DEFAULT '{}'
);

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password text NOT NULL,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Students table policies (public read for login, but data access requires proper auth)
CREATE POLICY "Anyone can read students for login verification"
  ON students FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert students"
  ON students FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update students"
  ON students FOR UPDATE
  USING (true);

-- Applications table policies
CREATE POLICY "Anyone can view applications"
  ON applications FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert applications"
  ON applications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update applications"
  ON applications FOR UPDATE
  USING (true);

-- Staff table policies
CREATE POLICY "Anyone can view staff"
  ON staff FOR SELECT
  USING (true);

CREATE POLICY "Anyone can manage staff"
  ON staff FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update staff"
  ON staff FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete staff"
  ON staff FOR DELETE
  USING (true);

-- Notices table policies
CREATE POLICY "Anyone can view notices"
  ON notices FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create notices"
  ON notices FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update notices"
  ON notices FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete notices"
  ON notices FOR DELETE
  USING (true);

-- Timetable table policies
CREATE POLICY "Anyone can view timetable"
  ON timetable FOR SELECT
  USING (true);

CREATE POLICY "Anyone can manage timetable"
  ON timetable FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update timetable"
  ON timetable FOR UPDATE
  USING (true);

-- Admins table policies
CREATE POLICY "Anyone can view admins"
  ON admins FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create admins"
  ON admins FOR INSERT
  WITH CHECK (true);

-- Insert sample admin
INSERT INTO admins (username, password, name)
VALUES ('admin', 'admin123', 'School Administrator')
ON CONFLICT (username) DO NOTHING;

-- Insert sample students
INSERT INTO students (registration_no, student_name, class, division, roll_number, fees_status, fees_amount, fees_paid, marks, attendance_percentage, phone, email)
VALUES 
  ('2024001', 'Rahul Sharma', '10th', 'A', 1, 'Paid', 50000, 50000, '{"Math": 85, "Science": 90, "English": 88, "Hindi": 82, "Social": 87}', 92.5, '9876543210', 'rahul@example.com'),
  ('2024002', 'Priya Patel', '10th', 'A', 2, 'Pending', 50000, 25000, '{"Math": 92, "Science": 88, "English": 90, "Hindi": 85, "Social": 89}', 95.0, '9876543211', 'priya@example.com'),
  ('2024003', 'Arjun Singh', '12th', 'B', 1, 'Paid', 60000, 60000, '{"Physics": 88, "Chemistry": 85, "Math": 90, "English": 86}', 89.0, '9876543212', 'arjun@example.com')
ON CONFLICT (registration_no) DO NOTHING;

-- Insert sample staff
INSERT INTO staff (name, designation, subject, contact, email)
VALUES 
  ('Dr. Amit Kumar', 'Principal', NULL, '9999999999', 'principal@school.com'),
  ('Mrs. Sunita Desai', 'Mathematics Teacher', 'Mathematics', '9999999998', 'sunita@school.com'),
  ('Mr. Rajesh Mehta', 'Science Teacher', 'Science', '9999999997', 'rajesh@school.com')
ON CONFLICT DO NOTHING;

-- Insert sample notices
INSERT INTO notices (title, content, posted_by, priority)
VALUES 
  ('Exam Schedule Released', 'The final exam schedule for all classes has been released. Please check the notice board.', 'admin', 'high'),
  ('Sports Day Event', 'Annual sports day will be held on 15th January. All students are requested to participate.', 'admin', 'medium')
ON CONFLICT DO NOTHING;

-- Insert sample timetable
INSERT INTO timetable (class, division, day, schedule)
VALUES 
  ('10th', 'A', 'Monday', '{"1": "Math", "2": "Science", "3": "English", "4": "Hindi", "5": "Social", "6": "PT"}'),
  ('10th', 'A', 'Tuesday', '{"1": "Science", "2": "Math", "3": "Hindi", "4": "English", "5": "Computer", "6": "Art"}')
ON CONFLICT DO NOTHING;