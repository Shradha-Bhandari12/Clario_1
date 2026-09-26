-- Add missing delete policies
CREATE POLICY "Anyone can delete students" ON students FOR DELETE USING (true);
CREATE POLICY "Anyone can delete applications" ON applications FOR DELETE USING (true);
CREATE POLICY "Anyone can delete timetable" ON timetable FOR DELETE USING (true);
