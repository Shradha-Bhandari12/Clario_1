
export type UserRole = 'guest' | 'student' | 'admin';

export interface AppNotification {
  id: string;
  text: string;
  type: 'info' | 'success' | 'warning';
  date: string;
  read: boolean;
}

export interface Student {
  id: string;
  name: string;
  rollNo: string;
  marks: { math: number; science: number; english: number };
  feesPaid: boolean;
  attendance: number;
  notifications: AppNotification[];
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  language: string;
}

export interface SchoolApplication {
  id: string;
  studentId: string;
  studentName: string;
  type: 'Bonafide' | 'Leave' | 'General';
  reason: string;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' }
];

export const INITIAL_FAQS: FAQ[] = [
  { id: '1', question: "Exams kab hai, bhai?", answer: "Final exams are starting from March 15th, 2025. Padhai shuru kar do, yaar!", language: "hi" },
  { id: '2', question: "Fees kashi bharu shakto?", answer: "Tu online portal varun kiva school office madhe jaun fees bharu shakto.", language: "mr" },
  { id: '3', question: "How to check my marks?", answer: "Login to your dashboard and look at the 'Academic Report Card' section, bro!", language: "en" },
  { id: '4', question: "Next school holiday kobe?", answer: "Next holiday is on Diwali, starting from October 28th.", language: "bn" }
];

const names = [
  "Arjun Sharma", "Priya Patel", "Rahul Deshmukh", "Ananya Chatterjee", "Siddharth Nair",
  "Ishaan Gupta", "Kavita Reddy", "Vikram Singh", "Sneha Kulkarni", "Amit Das",
  "Zoya Khan", "Rohan Mehta", "Sanya Malhotra", "Varun Dhawan", "Kiara Advani",
  "Aditya Roy", "Tanya Sen", "Manish Pandey", "Riya Iyer", "Kunal Kapoor",
  "Deepika Padukone", "Ranbir Kapoor", "Alia Bhatt", "Ayushmann Khurrana", "Sara Ali Khan"
];

export const INITIAL_STUDENTS: Student[] = names.map((name, i) => ({
  id: `10${i + 1}`,
  name,
  rollNo: `S2024-${100 + i + 1}`,
  marks: {
    math: Math.floor(Math.random() * 40) + 60,
    science: Math.floor(Math.random() * 40) + 60,
    english: Math.floor(Math.random() * 40) + 60,
  },
  feesPaid: Math.random() > 0.3,
  attendance: Math.floor(Math.random() * 25) + 75,
  notifications: [
    { id: 'n1', text: 'Mid-term results are out, check now!', type: 'success', date: '2024-10-01', read: false },
    { id: 'n2', text: 'Gentle reminder: Library books due tomorrow.', type: 'warning', date: '2024-10-05', read: false }
  ]
}));

export const INITIAL_APPLICATIONS: SchoolApplication[] = [
  { id: 'app1', studentId: '101', studentName: 'Arjun Sharma', type: 'Leave', reason: 'Family function at village.', date: '2024-10-10', status: 'Pending' },
  { id: 'app2', studentId: '102', studentName: 'Priya Patel', type: 'Bonafide', reason: 'For passport application.', date: '2024-10-12', status: 'Approved' }
];
