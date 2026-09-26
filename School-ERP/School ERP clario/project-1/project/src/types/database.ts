export interface Database {
  public: {
    Tables: {
      students: {
        Row: Student;
        Insert: Omit<Student, 'created_at'>;
        Update: Partial<Omit<Student, 'registration_no'>>;
      };
      applications: {
        Row: Application;
        Insert: Omit<Application, 'id' | 'submitted_at' | 'updated_at'>;
        Update: Partial<Omit<Application, 'id'>>;
      };
      staff: {
        Row: Staff;
        Insert: Omit<Staff, 'id'>;
        Update: Partial<Omit<Staff, 'id'>>;
      };
      notices: {
        Row: Notice;
        Insert: Omit<Notice, 'id' | 'posted_at'>;
        Update: Partial<Omit<Notice, 'id'>>;
      };
      timetable: {
        Row: Timetable;
        Insert: Omit<Timetable, 'id'>;
        Update: Partial<Omit<Timetable, 'id'>>;
      };
      admins: {
        Row: Admin;
        Insert: Omit<Admin, 'id' | 'created_at'>;
        Update: Partial<Omit<Admin, 'id'>>;
      };
      chat_sessions: {
        Row: ChatSession;
        Insert: Omit<ChatSession, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<ChatSession, 'id'>>;
      };
      chat_messages: {
        Row: ChatMessage;
        Insert: Omit<ChatMessage, 'id' | 'created_at'>;
        Update: Partial<Omit<ChatMessage, 'id'>>;
      };
      homework_submissions: {
        Row: HomeworkSubmission;
        Insert: Omit<HomeworkSubmission, 'id' | 'submitted_at'>;
        Update: Partial<Omit<HomeworkSubmission, 'id'>>;
      };
      faqs: {
        Row: FAQ;
        Insert: Omit<FAQ, 'id' | 'created_at'>;
        Update: Partial<Omit<FAQ, 'id'>>;
      };
      holidays: {
        Row: Holiday;
        Insert: Omit<Holiday, 'id' | 'created_at'>;
        Update: Partial<Omit<Holiday, 'id'>>;
      };
      exams: {
        Row: Exam;
        Insert: Omit<Exam, 'id' | 'created_at'>;
        Update: Partial<Omit<Exam, 'id'>>;
      };
      exam_results: {
        Row: ExamResult;
        Insert: Omit<ExamResult, 'id' | 'created_at' | 'exams' | 'students'>;
        Update: Partial<Omit<ExamResult, 'id'>>;
      };
    };
  };
}

export interface Student {
  registration_no: string;
  student_name: string;
  class: string;
  division: string;
  roll_number: number;
  fees_status: string;
  fees_amount: number;
  fees_paid: number;
  marks: Record<string, number>;
  attendance_percentage: number;
  phone: string | null;
  email: string | null;
  dob: string | null;
  gender: string | null;
  parent_name: string | null;
  address: string | null;
  blood_group: string | null;
  created_at: string;
}

export interface Application {
  id: string;
  registration_no: string;
  application_type: string;
  reason: string | null;
  status: string;
  submitted_at: string;
  updated_at: string;
  additional_data: Record<string, unknown>;
}

export interface Staff {
  id: string;
  name: string;
  designation: string;
  subject: string | null;
  contact: string | null;
  email: string | null;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  posted_by: string | null;
  posted_at: string;
  priority: string;
}

export interface Timetable {
  id: string;
  class: string;
  division: string;
  day: string;
  schedule: Record<string, string>;
}

export interface Admin {
  id: string;
  username: string;
  password: string;
  name: string;
  created_at: string;
}

export interface ChatSession {
  id: string;
  student_id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface HomeworkSubmission {
  id: string;
  registration_no: string;
  title: string;
  description: string | null;
  file_url: string;
  status: string;
  marks: number | null;
  teacher_notes: string | null;
  submitted_at: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  created_at: string;
}

export interface Holiday {
  id: string;
  name: string;
  date_range: string;
  created_at: string;
}

export interface Exam {
  id: string;
  title: string;
  subject: string;
  class: string;
  division?: string;
  exam_date: string;
  start_time: string;
  end_time: string;
  venue: string;
  total_marks: number;
  passing_marks: number;
  created_at: string;
}

export interface ExamResult {
  id: string;
  exam_id: string;
  registration_no: string;
  marks_obtained: number;
  total_marks: number;
  grade?: string;
  remarks?: string;
  created_at: string;
  // Joined data
  exams?: Exam;
  students?: Student;
}

export interface ParentContactLog {
  id: string;
  student_registration_no: string;
  contact_type: 'call' | 'sms' | 'email' | 'meeting' | 'other';
  subject: string;
  notes?: string;
  contacted_by?: string;
  contact_date: string;
  created_at: string;
}

