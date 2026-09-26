import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = 'https://bsmyweyegchyqdqtqzzw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzbXl3ZXllZ2NoeXFkcXRxenp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5OTcwMjUsImV4cCI6MjA4MjU3MzAyNX0.bnxQORYhzdzHt2GuGAhbkXXsIOEZCVL-T8N-W6j_1mw';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

