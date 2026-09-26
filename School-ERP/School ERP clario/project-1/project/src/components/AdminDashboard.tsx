/* eslint-disable @typescript-eslint/no-unsafe-call */
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  LogOut,
  Users,
  FileText,
  Bell,
  Search,
  Edit,
  Trash2,
  Check,
  X,
  Save,
  ChevronDown,
  BookOpen,
  BarChart2,
  PieChart,
  TrendingUp,
  MessageSquare,
  Calendar,
  HelpCircle,
  Plus,
  Clock,
  GraduationCap,
  Phone,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Student, Application, Notice, Timetable, ChatSession, ChatMessage, FAQ, Holiday, Exam, ExamResult, ParentContactLog } from '../types/database';

type Tab = 'overview' | 'students' | 'applications' | 'notices' | 'homework' | 'chatbot' | 'timetable' | 'knowledge' | 'exams';

export default function AdminDashboard() {
  const { admin, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [students, setStudents] = useState<Student[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [homeworkSubmissions, setHomeworkSubmissions] = useState<any[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [examResults, setExamResults] = useState<ExamResult[]>([]);

  const [showAddExam, setShowAddExam] = useState(false);
  const [newExam, setNewExam] = useState<Partial<Exam>>({
    title: '',
    subject: '',
    class: '',
    division: '',
    exam_date: '',
    start_time: '',
    end_time: '',
    venue: '',
    total_marks: 100,
    passing_marks: 35
  });
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);

  const [showAddTimetable, setShowAddTimetable] = useState(false);
  const [newTimetable, setNewTimetable] = useState<Partial<Timetable>>({
    class: '',
    division: '',
    day: 'Monday',
    schedule: { '1': '', '2': '', '3': '', '4': '', '5': '', '6': '' }
  });
  const [availableClasses, setAvailableClasses] = useState<{ class: string, division: string }[]>([]);

  const [stats, setStats] = useState({
    totalStudents: 0,
    pendingApps: 0,
    totalFees: 0,
    collectedFees: 0,
    recentActivity: [] as any[]
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editingStudentData, setEditingStudentData] = useState<Partial<Student> | null>(null);
  const [showAddNotice, setShowAddNotice] = useState(false);
  const [newNotice, setNewNotice] = useState({ title: '', content: '', priority: 'medium' });
  const [editingHomeworkId, setEditingHomeworkId] = useState<string | null>(null);
  const [homeworkReview, setHomeworkReview] = useState({ marks: 0, notes: '' });
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [newFAQ, setNewFAQ] = useState({ question: '', answer: '', category: 'General' });

  const [newStudent, setNewStudent] = useState({
    registration_no: '',
    student_name: '',
    class: '',
    division: '',
    roll_number: 1,
    fees_status: 'Pending',
    fees_amount: 0,
    fees_paid: 0,
    marks: {},
    attendance_percentage: 0,
    phone: '',
    email: '',
    dob: '',
    gender: 'Male',
    parent_name: '',
    address: '',
    blood_group: '',
  });

  const [parentContactLogs, setParentContactLogs] = useState<Record<string, ParentContactLog[]>>({});
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedStudentForContact, setSelectedStudentForContact] = useState<string | null>(null);
  const [newContact, setNewContact] = useState({
    contact_type: 'call' as const,
    subject: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      if (activeTab === 'overview') {
        // Fetch Students count and Fees
        const { data: studentData } = await supabase.from('students').select('fees_amount, fees_paid') as { data: Student[] | null };
        const { count: pendingAppCount } = await supabase.from('applications').select('*', { count: 'exact', head: true }).eq('status', 'pending');

        // Fetch recent activities
        const { data: recentNotices } = await supabase.from('notices').select('*').order('posted_at', { ascending: false }).limit(3) as { data: Notice[] | null };
        const { data: recentHomework } = await supabase.from('homework_submissions').select('*, students(student_name)').order('submitted_at', { ascending: false }).limit(3) as { data: any[] | null };

        const totalFees = studentData?.reduce((acc, curr) => acc + (Number(curr.fees_amount) || 0), 0) || 0;
        const collectedFees = studentData?.reduce((acc, curr) => acc + (Number(curr.fees_paid) || 0), 0) || 0;

        setStats({
          totalStudents: studentData?.length || 0,
          pendingApps: pendingAppCount || 0,
          totalFees,
          collectedFees,
          recentActivity: [
            ...(recentNotices || []).map(n => ({ ...n, type: 'notice' })),
            ...(recentHomework || []).map(h => ({ ...h, type: 'homework' }))
          ].sort((a, b) => {
            const dateA = new Date(a.posted_at || a.submitted_at || 0).getTime();
            const dateB = new Date(b.posted_at || b.submitted_at || 0).getTime();
            return dateB - dateA;
          })
        });
      } else if (activeTab === 'students') {
        const { data } = await supabase.from('students').select('*').order('registration_no');
        setStudents(data || []);
      } else if (activeTab === 'applications') {
        const { data } = await supabase
          .from('applications')
          .select('*')
          .order('submitted_at', { ascending: false });
        setApplications(data || []);
      } else if (activeTab === 'notices') {
        const { data } = await supabase
          .from('notices')
          .select('*')
          .order('posted_at', { ascending: false });
        setNotices(data || []);
      } else if (activeTab === 'homework') {
        const { data } = await supabase
          .from('homework_submissions')
          .select('*, students(student_name)')
          .order('submitted_at', { ascending: false });
        setHomeworkSubmissions(data || []);
      } else if (activeTab === 'chatbot') {
        const { data: sessions } = await supabase
          .from('chat_sessions')
          .select('*, chat_messages(*)')
          .order('created_at', { ascending: false }) as { data: (ChatSession & { chat_messages: ChatMessage[] })[] | null };
        setChatSessions(sessions || []);
      } else if (activeTab === 'timetable') {
        const { data: tt } = await supabase.from('timetable').select('*').order('class');
        const { data: studentsForClasses } = await supabase.from('students').select('class, division') as { data: { class: string, division: string }[] | null };
        const { data: holo } = await supabase.from('holidays').select('*').order('created_at');

        // Extract distinct classes and divisions
        const classesMap = new Map();
        studentsForClasses?.forEach(s => {
          const key = `${s.class}-${s.division}`;
          if (!classesMap.has(key)) {
            classesMap.set(key, { class: s.class, division: s.division });
          }
        });

        setTimetables(tt || []);
        setHolidays(holo || []);
        setAvailableClasses(Array.from(classesMap.values()));
      } else if (activeTab === 'knowledge') {
        const { data } = await supabase.from('faqs').select('*').order('created_at', { ascending: false });
        setFaqs(data || []);
      } else if (activeTab === 'exams') {
        const { data } = await supabase.from('exams').select('*').order('exam_date', { ascending: false });
        const { data: studentsForClasses } = await supabase.from('students').select('class, division') as { data: { class: string, division: string }[] | null };

        const classesMap = new Map();
        studentsForClasses?.forEach(s => {
          const key = `${s.class}-${s.division}`;
          if (!classesMap.has(key)) {
            classesMap.set(key, { class: s.class, division: s.division });
          }
        });

        setExams(data || []);
        setAvailableClasses(Array.from(classesMap.values()));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateApplicationStatus = async (id: string, status: string) => {
    try {
      const { data, error } = await (supabase as any)
        .from('applications')
        .update({ status })
        .eq('id', id)
        .select();

      if (error) {
        console.error('Supabase error updating application:', error);
        alert(`Failed to update application: ${error.message}`);
        return;
      }

      console.log('Application updated successfully:', data);
      await loadData();
      alert(`Application ${status}! ✅`);
    } catch (error) {
      console.error('Error updating application:', error);
      alert('Failed to update application');
    }
  };

  const handleStudentFieldChange = (field: string, value: any) => {
    setEditingStudentData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // @ts-ignore
  const saveStudentChanges = async (registrationNo: string) => {
    if (!editingStudentData) return;

    try {
      setIsLoading(true);
      const { error } = await (supabase as any)
        .from('students')
        .update(editingStudentData)
        .eq('registration_no', registrationNo);

      if (error) {
        console.error('Supabase error updating student:', error);
        alert(`Failed to update student: ${error.message}`);
        return;
      }

      console.log('Student updated successfully');
      // Reload data to ensure consistency
      await loadData();
      setEditingStudentId(null);
      setEditingStudentData(null);
      alert('Student information updated! ✅');
    } catch (error) {
      console.error('Error updating student:', error);
      alert('Failed to update student information');
    } finally {
      setIsLoading(false);
    }
  };

  const startEditStudent = (student: Student) => {
    setEditingStudentId(student.registration_no);
    setEditingStudentData({ ...student });
  };

  const cancelEditStudent = () => {
    setEditingStudentId(null);
    setEditingStudentData(null);
  };

  const saveHomeworkReview = async (id: string) => {
    try {
      setIsLoading(true);
      const { error } = await (supabase as any)
        .from('homework_submissions')
        .update({
          marks: homeworkReview.marks,
          teacher_notes: homeworkReview.notes,
          status: 'reviewed'
        })
        .eq('id', id);

      if (error) throw error;
      alert('Homework reviewed successfully! ✅');
      setEditingHomeworkId(null);
      await loadData();
    } catch (error) {
      console.error('Error reviewing homework:', error);
      alert('Failed to save review');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteStudent = async (registrationNo: string) => {
    if (!confirm('Are you sure you want to delete this student?')) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('students')
        .delete()
        .eq('registration_no', registrationNo)
        .select();

      console.log('Delete result:', { data, error });

      if (error) {
        console.error('Supabase error deleting student:', error);
        alert(`Failed to delete student: ${error.message}`);
        return;
      }

      if (!data || data.length === 0) {
        console.error('No rows deleted. This is likely an RLS policy issue.');
        alert('Student not deleted from database! Please check if you have applied the RLS DELETE policy migration.');
        return;
      }

      // Reload data to ensure consistency
      await loadData();
      setExpandedStudent(null);
      alert('Student deleted successfully! ✅');
    } catch (error) {
      console.error('Error deleting student:', error);
      alert('Failed to delete student');
    } finally {
      setIsLoading(false);
    }
  };

  // @ts-ignore
  const publishNotice = async () => {
    if (!newNotice.title.trim() || !newNotice.content.trim()) {
      alert('Please fill in title and content');
      return;
    }

    try {
      const { data, error } = await (supabase as any).from('notices').insert([{
        title: newNotice.title,
        content: newNotice.content,
        priority: newNotice.priority,
        posted_by: admin?.name || 'Admin',
      }]).select();

      if (error) {
        console.error('Supabase error publishing notice:', error);
        alert(`Failed to publish notice: ${error.message}`);
        return;
      }

      console.log('Notice published successfully:', data);
      setNewNotice({ title: '', content: '', priority: 'medium' });
      setShowAddNotice(false);
      await loadData();
      alert('Notice published! ✅');
    } catch (error) {
      console.error('Error publishing notice:', error);
      alert('Failed to publish notice');
    }
  };

  const deleteNotice = async (id: string) => {
    if (!confirm('Delete this notice?')) return;
    try {
      const { data, error } = await supabase
        .from('notices')
        .delete()
        .eq('id', id)
        .select();

      if (error) {
        console.error('Supabase error deleting notice:', error);
        alert(`Failed to delete notice: ${error.message}`);
        return;
      }

      console.log('Notice deleted successfully:', data);
      await loadData();
      alert('Notice deleted! ✅');
    } catch (error) {
      console.error('Error deleting notice:', error);
      alert('Failed to delete notice');
    }
  };

  const loadParentContactLogs = async (studentRegNo: string) => {
    try {
      const { data, error } = await supabase
        .from('parent_contact_logs')
        .select('*')
        .eq('student_registration_no', studentRegNo)
        .order('contact_date', { ascending: false })
        .limit(10);

      if (error) throw error;

      setParentContactLogs((prev: Record<string, ParentContactLog[]>) => ({
        ...prev,
        [studentRegNo]: data || []
      }));
    } catch (error) {
      console.error('Error loading parent contact logs:', error);
    }
  };

  const saveParentContact = async () => {
    if (!selectedStudentForContact || !newContact.subject.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('parent_contact_logs')
        .insert([{
          student_registration_no: selectedStudentForContact,
          contact_type: newContact.contact_type,
          subject: newContact.subject,
          notes: newContact.notes || null,
          contacted_by: admin?.name || 'Admin',
          contact_date: new Date().toISOString()
        }]);

      if (error) throw error;

      // Reload logs
      await loadParentContactLogs(selectedStudentForContact);

      // Reset form
      setNewContact({
        contact_type: 'call',
        subject: '',
        notes: ''
      });
      setShowContactModal(false);
      alert('Contact log saved successfully! ✅');
    } catch (error) {
      console.error('Error saving contact log:', error);
      alert('Failed to save contact log');
    } finally {
      setIsLoading(false);
    }
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  const filteredStudents = students.filter(
    (s) =>
      s.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.registration_no.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 shadow-xl border-b border-blue-800/20 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-md">Admin Dashboard</h1>
            <p className="text-sm text-blue-100 font-medium mt-1">Welcome back, {admin?.name} 👋</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all duration-300 border border-white/20 hover:scale-105 shadow-lg font-semibold"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Add Student Modal */}
        {showAddStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg relative">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowAddStudent(false)}
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-bold mb-4">Add New Student</h2>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!newStudent.registration_no.trim() || !newStudent.student_name.trim() || !newStudent.class.trim()) {
                    alert('Please fill all required fields');
                    return;
                  }
                  try {
                    const { data, error } = await (supabase as any).from('students').insert([
                      {
                        ...newStudent,
                        phone: newStudent.phone || null,
                        email: newStudent.email || null,
                        marks: {},
                      },
                    ]).select();

                    if (error) {
                      console.error('Supabase error adding student:', error);
                      alert(`Failed to add student: ${error.message}`);
                      return;
                    }

                    console.log('Student added successfully:', data);
                    setShowAddStudent(false);
                    setNewStudent({
                      registration_no: '',
                      student_name: '',
                      class: '',
                      division: '',
                      roll_number: 1,
                      fees_status: 'Pending',
                      fees_amount: 0,
                      fees_paid: 0,
                      marks: {},
                      attendance_percentage: 0,
                      phone: '',
                      email: '',
                      dob: '',
                      gender: 'Male',
                      parent_name: '',
                      address: '',
                      blood_group: '',
                    });
                    await loadData();
                    alert('Student added successfully! ✅');
                  } catch (error) {
                    console.error('Error adding student:', error);
                    alert('Failed to add student');
                  }
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Registration No*</label>
                    <input type="text" value={newStudent.registration_no} onChange={e => setNewStudent(s => ({ ...s, registration_no: e.target.value }))} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name*</label>
                    <input type="text" value={newStudent.student_name} onChange={e => setNewStudent(s => ({ ...s, student_name: e.target.value }))} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Class*</label>
                    <input type="text" value={newStudent.class} onChange={e => setNewStudent(s => ({ ...s, class: e.target.value }))} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Division</label>
                    <input type="text" value={newStudent.division} onChange={e => setNewStudent(s => ({ ...s, division: e.target.value }))} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Roll Number</label>
                    <input type="number" value={newStudent.roll_number} onChange={e => setNewStudent(s => ({ ...s, roll_number: parseInt(e.target.value) }))} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Attendance (%)</label>
                    <input type="number" value={newStudent.attendance_percentage} onChange={e => setNewStudent(s => ({ ...s, attendance_percentage: parseFloat(e.target.value) }))} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input type="text" value={newStudent.phone} onChange={e => setNewStudent(s => ({ ...s, phone: e.target.value }))} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input type="email" value={newStudent.email} onChange={e => setNewStudent(s => ({ ...s, email: e.target.value }))} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Total Fees (₹)</label>
                    <input type="number" value={newStudent.fees_amount} onChange={e => setNewStudent(s => ({ ...s, fees_amount: parseFloat(e.target.value) }))} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fees Paid (₹)</label>
                    <input type="number" value={newStudent.fees_paid} onChange={e => setNewStudent(s => ({ ...s, fees_paid: parseFloat(e.target.value) }))} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fees Status</label>
                    <select value={newStudent.fees_status} onChange={e => setNewStudent(s => ({ ...s, fees_status: e.target.value }))} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option value="Paid">Paid</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                    <input type="date" value={newStudent.dob} onChange={e => setNewStudent(s => ({ ...s, dob: e.target.value }))} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Gender</label>
                    <select value={newStudent.gender} onChange={e => setNewStudent(s => ({ ...s, gender: e.target.value }))} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Parent/Guardian Name</label>
                    <input type="text" value={newStudent.parent_name} onChange={e => setNewStudent(s => ({ ...s, parent_name: e.target.value }))} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Blood Group</label>
                    <input type="text" value={newStudent.blood_group} onChange={e => setNewStudent(s => ({ ...s, blood_group: e.target.value }))} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="e.g. A+" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Full Address</label>
                    <textarea value={newStudent.address} onChange={e => setNewStudent(s => ({ ...s, address: e.target.value }))} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" rows={2} />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setShowAddStudent(false)} className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">Add Student</button>
                </div>
              </form>
            </div>
          </div>
        )}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => { setActiveTab('overview'); setSelectedExamId(null); }}
            className={`flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap ${activeTab === 'overview'
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl shadow-blue-500/30 scale-105'
              : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white hover:shadow-lg hover:scale-105 border border-gray-200/50'
              }`}
          >
            <BarChart2 className="w-5 h-5" />
            Overview
          </button>
          <button
            onClick={() => { setActiveTab('students'); setSelectedExamId(null); }}
            className={`flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap ${activeTab === 'students'
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl shadow-blue-500/30 scale-105'
              : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white hover:shadow-lg hover:scale-105 border border-gray-200/50'
              }`}
          >
            <Users className="w-5 h-5" />
            Students
          </button>
          <button
            onClick={() => { setActiveTab('applications'); setSelectedExamId(null); }}
            className={`flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap ${activeTab === 'applications'
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl shadow-blue-500/30 scale-105'
              : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white hover:shadow-lg hover:scale-105 border border-gray-200/50'
              }`}
          >
            <FileText className="w-5 h-5" />
            Applications
          </button>
          <button
            onClick={() => { setActiveTab('notices'); setSelectedExamId(null); }}
            className={`flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap ${activeTab === 'notices'
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl shadow-blue-500/30 scale-105'
              : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white hover:shadow-lg hover:scale-105 border border-gray-200/50'
              }`}
          >
            <Bell className="w-5 h-5" />
            Notices
          </button>
          <button
            onClick={() => { setActiveTab('homework'); setSelectedExamId(null); }}
            className={`flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap ${activeTab === 'homework'
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl shadow-blue-500/30 scale-105'
              : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white hover:shadow-lg hover:scale-105 border border-gray-200/50'
              }`}
          >
            <BookOpen className="w-5 h-5" />
            Homework
          </button>
          <button
            onClick={() => { setActiveTab('chatbot'); setSelectedExamId(null); }}
            className={`flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap ${activeTab === 'chatbot'
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl shadow-blue-500/30 scale-105'
              : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white hover:shadow-lg hover:scale-105 border border-gray-200/50'
              }`}
          >
            <MessageSquare className="w-5 h-5" />
            Chatbot Insights
          </button>
          <button
            onClick={() => { setActiveTab('timetable'); setSelectedExamId(null); }}
            className={`flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap ${activeTab === 'timetable'
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl shadow-blue-500/30 scale-105'
              : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white hover:shadow-lg hover:scale-105 border border-gray-200/50'
              }`}
          >
            <Calendar className="w-5 h-5" />
            Timetable
          </button>
          <button
            onClick={() => { setActiveTab('exams'); setSelectedExamId(null); }}
            className={`flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap ${activeTab === 'exams'
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl shadow-blue-500/30 scale-105'
              : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white hover:shadow-lg hover:scale-105 border border-gray-200/50'
              }`}
          >
            <GraduationCap className="w-5 h-5" />
            Exams
          </button>
          <button
            onClick={() => { setActiveTab('knowledge'); setSelectedExamId(null); }}
            className={`flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap ${activeTab === 'knowledge'
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl shadow-blue-500/30 scale-105'
              : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white hover:shadow-lg hover:scale-105 border border-gray-200/50'
              }`}
          >
            <HelpCircle className="w-5 h-5" />
            Knowledge Base
          </button>
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-blue-100/50 flex items-center gap-4 hover:scale-105 hover:shadow-blue-200/50">
                <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg">
                  <Users className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-semibold uppercase tracking-wide">Total Students</p>
                  <h3 className="text-3xl font-extrabold text-gray-800 mt-1">{stats.totalStudents}</h3>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-yellow-100/50 flex items-center gap-4 hover:scale-105 hover:shadow-yellow-200/50">
                <div className="p-4 bg-gradient-to-br from-yellow-500 to-orange-500 text-white rounded-xl shadow-lg">
                  <FileText className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-semibold uppercase tracking-wide">Pending Apps</p>
                  <h3 className="text-3xl font-extrabold text-gray-800 mt-1">{stats.pendingApps}</h3>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-green-100/50 flex items-center gap-4 hover:scale-105 hover:shadow-green-200/50">
                <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl shadow-lg">
                  <TrendingUp className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-semibold uppercase tracking-wide">Fees Collected</p>
                  <h3 className="text-3xl font-extrabold text-gray-800 mt-1">
                    {((stats.collectedFees / stats.totalFees) * 100 || 0).toFixed(1)}%
                  </h3>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-purple-100/50 hover:shadow-2xl transition-all duration-300">
                <h3 className="text-xl font-extrabold text-gray-800 mb-6 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                    <PieChart className="w-6 h-6 text-white" />
                  </div>
                  Fee Collection Status
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600 font-semibold">Total Progress (₹{stats.collectedFees.toLocaleString()} / ₹{stats.totalFees.toLocaleString()})</span>
                    <span className="font-extrabold text-purple-600 text-lg">{((stats.collectedFees / stats.totalFees) * 100 || 0).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-5 overflow-hidden shadow-inner">
                    <div
                      className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 h-full transition-all duration-1000 rounded-full shadow-lg"
                      style={{ width: `${(stats.collectedFees / stats.totalFees) * 100 || 0}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-8">
                    <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200/50 shadow-md hover:shadow-lg transition-all duration-300">
                      <p className="text-xs text-green-700 font-bold uppercase tracking-wider mb-1">Collected</p>
                      <p className="text-2xl font-extrabold text-green-600">₹{stats.collectedFees.toLocaleString()}</p>
                    </div>
                    <div className="p-5 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border border-red-200/50 shadow-md hover:shadow-lg transition-all duration-300">
                      <p className="text-xs text-red-700 font-bold uppercase tracking-wider mb-1">Pending</p>
                      <p className="text-2xl font-extrabold text-red-600">₹{(stats.totalFees - stats.collectedFees).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-blue-100/50 hover:shadow-2xl transition-all duration-300">
                <h3 className="text-lg font-extrabold text-gray-800 mb-5 flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  Recent Activity
                </h3>
                <div className="space-y-4">
                  {stats.recentActivity.map((activity, i) => (
                    <div key={i} className="flex gap-3 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                      <div className={`p-2 rounded-lg shrink-0 ${activity.type === 'notice' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                        }`}>
                        {activity.type === 'notice' ? <Bell className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800 line-clamp-1">{activity.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {activity.type === 'notice' ? 'New Notice posted' : `Homework by ${activity.students?.student_name}`}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1">
                          {new Date(activity.posted_at || activity.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                  {stats.recentActivity.length === 0 && (
                    <p className="text-center text-gray-400 py-8 italic">No recent activity</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STUDENTS TAB */}
        {activeTab === 'students' && (
          <div className="space-y-6">
            <div className="flex gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search students by name or registration number..."
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all shadow-sm hover:shadow-md bg-white/90 backdrop-blur-sm font-medium"
                />
              </div>
              <button
                onClick={() => setShowAddStudent(true)}
                className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 font-semibold"
              >
                <Users className="w-5 h-5" />
                Add Student
              </button>
            </div>

            <div className="space-y-4">
              {filteredStudents.map((student) => (
                <div
                  key={student.registration_no}
                  className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden border border-gray-200/50 transition-all duration-300 hover:scale-[1.02]"
                >
                  <div
                    className="p-6 cursor-pointer hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-300"
                    onClick={() =>
                      setExpandedStudent(
                        expandedStudent === student.registration_no
                          ? null
                          : student.registration_no
                      )
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-lg font-extrabold text-gray-800">{student.student_name}</h3>
                          <span className="px-3 py-1 text-xs font-bold text-blue-700 bg-blue-100 rounded-full border border-blue-200">
                            {student.registration_no}
                          </span>
                        </div>
                        <div className="flex gap-6 text-sm text-gray-600 font-medium">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                            Class: <span className="font-bold text-purple-600">{student.class} {student.division}</span>
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            Roll: <span className="font-bold text-green-600">{student.roll_number}</span>
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                            Attendance: <span className="font-bold text-orange-600">{student.attendance_percentage}%</span>
                          </span>
                        </div>
                      </div>
                      <ChevronDown
                        className={`w-6 h-6 text-gray-400 transition-all duration-300 ${expandedStudent === student.registration_no ? 'rotate-180 text-purple-600' : ''
                          }`}
                      />
                    </div>
                  </div>

                  {expandedStudent === student.registration_no && (
                    <div className="border-t border-gray-200 p-4 bg-gray-50">
                      {editingStudentId === student.registration_no ? (
                        // Edit Mode
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Name
                              </label>
                              <input
                                type="text"
                                value={editingStudentData?.student_name || ''}
                                onChange={(e) =>
                                  handleStudentFieldChange(
                                    'student_name',
                                    e.target.value
                                  )
                                }
                                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Class
                              </label>
                              <input
                                type="text"
                                value={editingStudentData?.class || ''}
                                onChange={(e) =>
                                  handleStudentFieldChange(
                                    'class',
                                    e.target.value
                                  )
                                }
                                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Division
                              </label>
                              <input
                                type="text"
                                value={editingStudentData?.division || ''}
                                onChange={(e) =>
                                  handleStudentFieldChange(
                                    'division',
                                    e.target.value
                                  )
                                }
                                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Roll Number
                              </label>
                              <input
                                type="number"
                                value={editingStudentData?.roll_number || ''}
                                onChange={(e) =>
                                  handleStudentFieldChange(
                                    'roll_number',
                                    parseInt(e.target.value)
                                  )
                                }
                                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Total Fees (₹)
                              </label>
                              <input
                                type="number"
                                value={editingStudentData?.fees_amount || ''}
                                onChange={(e) =>
                                  handleStudentFieldChange(
                                    'fees_amount',
                                    parseFloat(e.target.value)
                                  )
                                }
                                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Fees Paid (₹)
                              </label>
                              <input
                                type="number"
                                value={editingStudentData?.fees_paid || ''}
                                onChange={(e) =>
                                  handleStudentFieldChange(
                                    'fees_paid',
                                    parseFloat(e.target.value)
                                  )
                                }
                                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Attendance (%)
                              </label>
                              <input
                                type="number"
                                value={editingStudentData?.attendance_percentage || ''}
                                onChange={(e) =>
                                  handleStudentFieldChange(
                                    'attendance_percentage',
                                    parseFloat(e.target.value)
                                  )
                                }
                                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Phone
                              </label>
                              <input
                                type="text"
                                value={editingStudentData?.phone || ''}
                                onChange={(e) =>
                                  handleStudentFieldChange(
                                    'phone',
                                    e.target.value
                                  )
                                }
                                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Email
                              </label>
                              <input
                                type="email"
                                value={editingStudentData?.email || ''}
                                onChange={(e) =>
                                  handleStudentFieldChange(
                                    'email',
                                    e.target.value
                                  )
                                }
                                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Fees Status
                              </label>
                              <select
                                value={editingStudentData?.fees_status || ''}
                                onChange={(e) =>
                                  handleStudentFieldChange(
                                    'fees_status',
                                    e.target.value
                                  )
                                }
                                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="Paid">Paid</option>
                                <option value="Pending">Pending</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                              <input type="date" value={editingStudentData?.dob || ''} onChange={e => handleStudentFieldChange('dob', e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Gender</label>
                              <select value={editingStudentData?.gender || ''} onChange={e => handleStudentFieldChange('gender', e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Parent/Guardian Name</label>
                              <input type="text" value={editingStudentData?.parent_name || ''} onChange={e => handleStudentFieldChange('parent_name', e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Blood Group</label>
                              <input type="text" value={editingStudentData?.blood_group || ''} onChange={e => handleStudentFieldChange('blood_group', e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div className="col-span-2">
                              <label className="block text-sm font-medium text-gray-700">Address</label>
                              <textarea value={editingStudentData?.address || ''} onChange={e => handleStudentFieldChange('address', e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" rows={2} />
                            </div>
                          </div>
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={cancelEditStudent}
                              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
                              disabled={isLoading}
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => saveStudentChanges(student.registration_no)}
                              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50"
                              disabled={isLoading}
                            >
                              <Save className="w-4 h-4" />
                              {isLoading ? 'Saving...' : 'Save Changes'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        // View Mode
                        <div className="space-y-6">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white p-3 rounded border border-gray-200">
                              <p className="text-xs text-gray-500">Email</p>
                              <p className="text-sm font-medium text-gray-800 break-all">
                                {student.email || 'N/A'}
                              </p>
                            </div>
                            <div className="bg-white p-3 rounded border border-gray-200">
                              <p className="text-xs text-gray-500">Phone</p>
                              <p className="text-sm font-medium text-gray-800">
                                {student.phone || 'N/A'}
                              </p>
                            </div>
                            <div className="bg-white p-3 rounded border border-gray-200">
                              <p className="text-xs text-gray-500">Attendance</p>
                              <div className="flex items-center gap-2">
                                <span className={`text-sm font-bold ${student.attendance_percentage > 75 ? 'text-green-600' : 'text-red-600'}`}>
                                  {student.attendance_percentage}%
                                </span>
                                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                  <div className={`h-full ${student.attendance_percentage > 75 ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${student.attendance_percentage}%` }} />
                                </div>
                              </div>
                            </div>
                            <div className="bg-white p-3 rounded border border-gray-200">
                              <p className="text-xs text-gray-500">Fees Status</p>
                              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${student.fees_status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {student.fees_status}
                              </span>
                            </div>
                          </div>

                          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                            <h4 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                              <Users className="w-4 h-4 text-purple-500" />
                              Personal Information
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                              <div>
                                <p className="text-[10px] text-gray-400 uppercase font-bold">DOB</p>
                                <p className="text-sm font-medium text-gray-800">{student.dob || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-[10px] text-gray-400 uppercase font-bold">Gender</p>
                                <p className="text-sm font-medium text-gray-800">{student.gender || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-[10px] text-gray-400 uppercase font-bold">Parent/Guardian</p>
                                <p className="text-sm font-medium text-gray-800">{student.parent_name || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-[10px] text-gray-400 uppercase font-bold">Blood Group</p>
                                <p className="text-sm font-medium text-gray-800">{student.blood_group || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-[10px] text-gray-400 uppercase font-bold">Address</p>
                                <p className="text-sm font-medium text-gray-800 line-clamp-1" title={student.address || ''}>{student.address || 'N/A'}</p>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                              <h4 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                                <GraduationCap className="w-4 h-4 text-blue-500" />
                                Performance Tracking
                              </h4>
                              <div className="space-y-3">
                                {Object.entries(student.marks || {}).map(([subject, mark]) => (
                                  <div key={subject}>
                                    <div className="flex justify-between text-xs mb-1">
                                      <span className="text-gray-500">{subject}</span>
                                      <span className="font-bold text-gray-700">{mark}%</span>
                                    </div>
                                    <div className="w-full bg-gray-50 h-1.5 rounded-full overflow-hidden">
                                      <div className="bg-blue-400 h-full" style={{ width: `${mark}%` }} />
                                    </div>
                                  </div>
                                ))}
                                {Object.keys(student.marks || {}).length === 0 && (
                                  <p className="text-xs text-gray-400 italic py-4 text-center">No academic data available</p>
                                )}
                              </div>
                            </div>

                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                              <h4 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                                <Bell className="w-4 h-4 text-orange-500" />
                                Parent Contact Logs
                              </h4>
                              <div className="space-y-3">
                                <div className="p-2 bg-orange-50 rounded border border-orange-100">
                                  <p className="text-[10px] font-bold text-orange-600 uppercase">Latest Contact</p>
                                  <p className="text-xs text-gray-700 mt-1">Notified parent regarding pending fees via Automated SMS.</p>
                                  <p className="text-[9px] text-gray-400 mt-1">2 days ago</p>
                                </div>
                                <button className="w-full py-2 border-2 border-dashed border-gray-200 rounded-lg text-xs font-bold text-gray-400 hover:border-gray-300 hover:text-gray-500 transition">
                                  + Record New Contact
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2 justify-end pt-4 border-t border-gray-100">
                            <button
                              onClick={() => startEditStudent(student)}
                              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
                              disabled={isLoading}
                            >
                              <Edit className="w-4 h-4" />
                              Edit Profile
                            </button>
                            <button
                              onClick={() => deleteStudent(student.registration_no)}
                              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50"
                              disabled={isLoading}
                            >
                              <Trash2 className="w-4 h-4" />
                              {isLoading ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* APPLICATIONS TAB */}
        {activeTab === 'applications' && (
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-800 capitalize">
                        {app.application_type}
                      </h3>
                      <span
                        className={`px-3 py-1 text-xs rounded-full font-medium ${app.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : app.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                          }`}
                      >
                        {app.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Student:</strong> {app.registration_no}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Reason:</strong> {app.reason || 'N/A'}
                    </p>
                    <p className="text-xs text-gray-400">
                      Submitted: {new Date(app.submitted_at).toLocaleString()}
                    </p>
                  </div>
                  {app.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateApplicationStatus(app.id, 'approved')}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                      >
                        <Check className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => updateApplicationStatus(app.id, 'rejected')}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                      >
                        <X className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {applications.length === 0 && (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No applications yet</p>
              </div>
            )}
          </div>
        )}

        {/* NOTICES TAB */}
        {activeTab === 'notices' && (
          <div className="space-y-4">
            {!showAddNotice ? (
              <button
                onClick={() => setShowAddNotice(true)}
                className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                <Bell className="w-5 h-5" />
                Publish New Notice
              </button>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Publish New Notice</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={newNotice.title}
                    onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                    placeholder="Notice title..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                  <textarea
                    value={newNotice.content}
                    onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                    placeholder="Notice content..."
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    value={newNotice.priority}
                    onChange={(e) => setNewNotice({ ...newNotice, priority: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setShowAddNotice(false)}
                    className="px-6 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={publishNotice}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                  >
                    <Check className="w-4 h-4" />
                    Publish
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {notices.map((notice) => (
                <div key={notice.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800">{notice.title}</h3>
                      <span
                        className={`inline-block mt-2 px-3 py-1 text-xs rounded-full font-medium ${notice.priority === 'high'
                          ? 'bg-red-100 text-red-800'
                          : notice.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                          }`}
                      >
                        {notice.priority.toUpperCase()}
                      </span>
                    </div>
                    <button
                      onClick={() => deleteNotice(notice.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 whitespace-pre-wrap">
                    {notice.content}
                  </p>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Posted by: {notice.posted_by || 'Admin'}</span>
                    <span>Posted: {new Date(notice.posted_at).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* HOMEWORK TAB */}
        {activeTab === 'homework' && (
          <div className="space-y-4">
            {homeworkSubmissions.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">
                <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p>No homework submissions yet! 📚</p>
              </div>
            ) : (
              homeworkSubmissions.map((sub) => (
                <div key={sub.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">{sub.title}</h3>
                        <span className={`px-3 py-1 text-xs rounded-full font-medium ${sub.status === 'reviewed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                          {sub.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Student:</strong> {sub.students?.student_name} ({sub.registration_no})
                      </p>
                      <p className="text-sm text-gray-600 mb-2">
                        {sub.description || 'No description provided'}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span>Submitted: {new Date(sub.submitted_at).toLocaleString()}</span>
                        <a href={sub.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold hover:underline flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          View Attachment
                        </a>
                      </div>
                    </div>

                    <div className="md:w-64">
                      {editingHomeworkId === sub.id ? (
                        <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                          <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Marks (0-100)</label>
                            <input
                              type="number"
                              value={homeworkReview.marks}
                              onChange={(e) => setHomeworkReview({ ...homeworkReview, marks: parseInt(e.target.value) })}
                              className="w-full px-3 py-2 border rounded text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Teacher Notes</label>
                            <textarea
                              value={homeworkReview.notes}
                              onChange={(e) => setHomeworkReview({ ...homeworkReview, notes: e.target.value })}
                              className="w-full px-3 py-2 border rounded text-sm"
                              rows={3}
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => saveHomeworkReview(sub.id)}
                              className="flex-1 px-3 py-2 bg-green-500 text-white rounded text-sm font-bold shadow-sm"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingHomeworkId(null)}
                              className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded text-sm font-bold"
                            >
                              X
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {sub.status === 'reviewed' ? (
                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-xs text-gray-500">Marks:</span>
                                <span className="text-sm font-bold text-blue-700">{sub.marks}/100</span>
                              </div>
                              <p className="text-xs text-gray-600 italic">"{sub.teacher_notes}"</p>
                              <button
                                onClick={() => {
                                  setEditingHomeworkId(sub.id);
                                  setHomeworkReview({ marks: sub.marks, notes: sub.teacher_notes || '' });
                                }}
                                className="mt-2 w-full text-center text-[10px] text-blue-500 font-bold hover:underline"
                              >
                                Edit Review
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingHomeworkId(sub.id);
                                setHomeworkReview({ marks: 0, notes: '' });
                              }}
                              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 transition shadow-sm"
                            >
                              Review Now
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* CHATBOT INSIGHTS TAB */}
        {activeTab === 'chatbot' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-gray-500 text-sm font-medium mb-1">Total Conversations</h3>
                <h3 className="text-2xl font-bold text-gray-800">{chatSessions.length}</h3>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-gray-500 text-sm font-medium mb-1">Total Messages</h3>
                <h3 className="text-2xl font-bold text-gray-800">
                  {chatSessions.reduce((acc, s) => acc + ((s as any).chat_messages?.length || 0), 0)}
                </h3>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-gray-500 text-sm font-medium mb-1">Low Confidence Hits</h3>
                <h3 className="text-2xl font-bold text-orange-600">
                  {chatSessions.reduce((acc, s) => acc + ((s as any).chat_messages?.filter((m: any) => m.role === 'assistant' && (m.content.includes("don't know") || m.content.includes("sorry"))).length || 0), 0)}
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-bold text-gray-800">Recent Conversations</h3>
                </div>
                <div className="divide-y max-h-[500px] overflow-y-auto">
                  {chatSessions.map((session: any) => (
                    <div key={session.id} className="p-4 hover:bg-gray-50 transition cursor-pointer">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-bold text-gray-800">{session.title || 'Untitled Session'}</span>
                        <span className="text-[10px] text-gray-400">{new Date(session.created_at).toLocaleString()}</span>
                      </div>
                      <div className="space-y-2">
                        {(session.chat_messages || []).slice(0, 2).map((msg: any) => (
                          <div key={msg.id} className="flex gap-2">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold ${msg.role === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>{msg.role}</span>
                            <p className="text-xs text-gray-600 line-clamp-1 italic">"{msg.content}"</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {chatSessions.length === 0 && (
                    <div className="p-12 text-center text-gray-400 italic">No chat data yet</div>
                  )}
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Unanswered / Fallback Queries</h3>
                <div className="space-y-4">
                  {chatSessions.flatMap(s => ((s as any).chat_messages || [])).filter((m: any) => m.role === 'assistant' && (m.content.includes("don't know") || m.content.includes("sorry"))).slice(0, 5).map((msg: any) => (
                    <div key={msg.id} className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                      <p className="text-xs text-orange-800 font-bold mb-1 italic">Bot response:</p>
                      <p className="text-sm text-gray-700 mb-2">"{msg.content}"</p>
                      <button className="text-[10px] font-bold text-blue-600 hover:underline uppercase">Add to Knowledge Base</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* EXAMS TAB */}
        {activeTab === 'exams' && (
          <div className="space-y-6">
            {!selectedExamId ? (
              <>
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-extrabold text-gray-800 flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                      <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                    Exam Schedules & Management
                  </h2>
                  <button
                    onClick={() => {
                      if (availableClasses.length === 0) {
                        alert('No classes found in Student data. Please add students first.');
                        return;
                      }
                      setShowAddExam(true);
                      if (availableClasses.length > 0) {
                        setNewExam(prev => ({
                          ...prev,
                          class: availableClasses[0].class,
                          division: availableClasses[0].division
                        }));
                      }
                    }}
                    className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 font-semibold"
                  >
                    <Plus className="w-5 h-5" />
                    Schedule New Exam
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {exams.map(exam => (
                    <div key={exam.id} className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl border border-gray-200/50 overflow-hidden group transition-all duration-300 hover:scale-105">
                      <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-5">
                          <div>
                            <h3 className="text-lg font-extrabold text-gray-800 mb-1">{exam.title}</h3>
                            <p className="text-xs text-purple-600 font-bold uppercase tracking-wider flex items-center gap-1.5">
                              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                              {exam.subject}
                            </p>
                          </div>
                          <span className="px-3 py-1.5 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 text-xs font-extrabold rounded-full border border-blue-200">
                            CLASS {exam.class}-{exam.division}
                          </span>
                        </div>

                        <div className="space-y-3 mb-6">
                          <div className="flex items-center gap-3 text-sm text-gray-700 font-medium">
                            <div className="p-1.5 bg-green-100 rounded-lg">
                              <Calendar className="w-4 h-4 text-green-600" />
                            </div>
                            <span>{new Date(exam.exam_date).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-700 font-medium">
                            <div className="p-1.5 bg-blue-100 rounded-lg">
                              <Clock className="w-4 h-4 text-blue-600" />
                            </div>
                            <span>{exam.start_time} - {exam.end_time}</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-700 font-medium">
                            <div className="p-1.5 bg-purple-100 rounded-lg">
                              <HelpCircle className="w-4 h-4 text-purple-600" />
                            </div>
                            <span>{exam.total_marks} Marks (Pass: {exam.passing_marks})</span>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100 flex gap-2">
                          <button
                            onClick={async () => {
                              setSelectedExamId(exam.id);
                              // Fetch existing results
                              const { data } = await supabase.from('exam_results').select('*').eq('exam_id', exam.id);
                              setExamResults(data || []);
                              // We also need students of this class & division
                              const { data: stData } = await supabase.from('students')
                                .select('*')
                                .eq('class', exam.class)
                                .eq('division', exam.division || '');
                              setStudents(stData || []);
                            }}
                            className="flex-1 py-2.5 bg-gradient-to-r from-blue-50 to-purple-50 text-purple-700 rounded-xl text-sm font-bold hover:from-blue-100 hover:to-purple-100 transition-all shadow-sm hover:shadow-md"
                          >
                            Manage Results
                          </button>
                          <button
                            onClick={async () => {
                              if (!confirm('Cancel this exam?')) return;
                              await (supabase as any).from('exams').delete().eq('id', exam.id);
                              loadData();
                            }}
                            className="p-2 text-gray-400 hover:text-red-500 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {exams.length === 0 && (
                    <div className="col-span-full bg-white p-12 rounded-xl border border-dashed border-gray-200 text-center">
                      <GraduationCap className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                      <p className="text-gray-500">No exams scheduled yet.</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => { setSelectedExamId(null); setExamResults([]); loadData(); }}
                    className="p-2 bg-white border rounded-lg hover:bg-gray-50 transition"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      Results: {exams.find(e => e.id === selectedExamId)?.title}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {exams.find(e => e.id === selectedExamId)?.subject} | Class {exams.find(e => e.id === selectedExamId)?.class}-{exams.find(e => e.id === selectedExamId)?.division}
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Student</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Roll No</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Marks Obtained</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Grade</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {students.map(student => {
                        const result = examResults.find(r => r.registration_no === student.registration_no);
                        const exam = exams.find(e => e.id === selectedExamId);

                        return (
                          <tr key={student.registration_no} className="hover:bg-gray-50/50 transition">
                            <td className="px-6 py-4">
                              <div className="font-bold text-gray-800">{student.student_name}</div>
                              <div className="text-[10px] text-gray-400">{student.registration_no}</div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{student.roll_number}</td>
                            <td className="px-6 py-4">
                              <input
                                type="number"
                                className="w-20 px-3 py-1 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm font-bold"
                                defaultValue={result?.marks_obtained ?? ''}
                                placeholder="0"
                                onBlur={async (e) => {
                                  const val = parseInt(e.target.value);
                                  if (isNaN(val)) return;

                                  const marks = val;
                                  const total = exam?.total_marks || 100;
                                  const percentage = (marks / total) * 100;
                                  let grade = 'F';
                                  if (percentage >= 90) grade = 'A+';
                                  else if (percentage >= 80) grade = 'A';
                                  else if (percentage >= 70) grade = 'B';
                                  else if (percentage >= 60) grade = 'C';
                                  else if (percentage >= 35) grade = 'D';

                                  try {
                                    const { error } = await (supabase as any).from('exam_results').upsert({
                                      exam_id: selectedExamId,
                                      registration_no: student.registration_no,
                                      marks_obtained: marks,
                                      total_marks: total,
                                      grade: grade
                                    }, { onConflict: 'exam_id,registration_no' });

                                    if (error) throw error;

                                    // Update local state to reflect change without re-fetching everything
                                    setExamResults(prev => {
                                      const existing = prev.findIndex(r => r.registration_no === student.registration_no);
                                      if (existing > -1) {
                                        const next = [...prev];
                                        next[existing] = { ...next[existing], marks_obtained: marks, grade };
                                        return next;
                                      }
                                      return [...prev, { exam_id: selectedExamId!, registration_no: student.registration_no, marks_obtained: marks, total_marks: total, grade } as ExamResult];
                                    });
                                  } catch (err) {
                                    console.error(err);
                                    alert('Error saving marks');
                                  }
                                }}
                              />
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${(result?.grade?.startsWith('A') || result?.grade === 'B') ? 'bg-green-100 text-green-700' :
                                result?.grade === 'F' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                                }`}>
                                {result?.grade || '-'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              {result && (
                                <span className="text-[10px] text-green-500 font-bold flex items-center justify-end gap-1">
                                  <Check className="w-3 h-3" /> Saved
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {students.length === 0 && (
                    <div className="p-12 text-center text-gray-400 italic">
                      No students found in Class {exams.find(e => e.id === selectedExamId)?.class}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Add Exam Modal */}
            {showAddExam && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                  <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                    <h2 className="text-xl font-bold text-gray-800">Schedule Exam</h2>
                    <button onClick={() => setShowAddExam(false)} className="text-gray-400 hover:text-gray-600">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <form className="p-6 space-y-4" onSubmit={async (e) => {
                    e.preventDefault();
                    setIsLoading(true);
                    try {
                      const { error } = await (supabase as any).from('exams').insert([newExam]);
                      if (error) throw error;
                      setShowAddExam(false);
                      setNewExam({ title: '', subject: '', class: '', division: '', exam_date: '', start_time: '', end_time: '', venue: '', total_marks: 100, passing_marks: 35 });
                      loadData();
                    } catch (err: any) {
                      console.error(err);
                      alert('Failed to schedule exam: ' + (err.message || 'Unknown error'));
                    } finally {
                      setIsLoading(false);
                    }
                  }}>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Exam Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Midterm Assessment"
                        className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500"
                        value={newExam.title}
                        onChange={e => setNewExam({ ...newExam, title: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Subject</label>
                        <input
                          type="text"
                          required
                          placeholder="Mathematics"
                          className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500"
                          value={newExam.subject}
                          onChange={e => setNewExam({ ...newExam, subject: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Select Class</label>
                        <select
                          className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 font-bold text-gray-700"
                          value={`${newExam.class}-${newExam.division}`}
                          onChange={e => {
                            const [cls, div] = e.target.value.split('-');
                            setNewExam({ ...newExam, class: cls, division: div });
                          }}
                        >
                          {availableClasses.map(c => (
                            <option key={`${c.class}-${c.division}`} value={`${c.class}-${c.division}`}>
                              Class {c.class} - {c.division}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Exam Date</label>
                      <input
                        type="date"
                        required
                        className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500"
                        value={newExam.exam_date}
                        onChange={e => setNewExam({ ...newExam, exam_date: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Venue</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Room 101, Main Hall"
                        className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500"
                        value={newExam.venue}
                        onChange={e => setNewExam({ ...newExam, venue: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Start Time</label>
                        <input
                          type="time"
                          className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500"
                          value={newExam.start_time}
                          onChange={e => setNewExam({ ...newExam, start_time: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">End Time</label>
                        <input
                          type="time"
                          className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500"
                          value={newExam.end_time}
                          onChange={e => setNewExam({ ...newExam, end_time: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Total Marks</label>
                        <input
                          type="number"
                          className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500"
                          value={newExam.total_marks}
                          onChange={e => setNewExam({ ...newExam, total_marks: parseInt(e.target.value) })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Passing Marks</label>
                        <input
                          type="number"
                          className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500"
                          value={newExam.passing_marks}
                          onChange={e => setNewExam({ ...newExam, passing_marks: parseInt(e.target.value) })}
                        />
                      </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddExam(false)}
                        className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition flex items-center justify-center gap-2 shadow-lg"
                      >
                        {isLoading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : 'Schedule'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TIMETABLE TAB */}
        {activeTab === 'timetable' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Class Timetables</h2>
              <button
                onClick={() => {
                  if (availableClasses.length === 0) {
                    alert('No classes found in Student data. Please add students first.');
                    return;
                  }
                  setShowAddTimetable(true);
                  if (availableClasses.length > 0) {
                    setNewTimetable(prev => ({
                      ...prev,
                      class: availableClasses[0].class,
                      division: availableClasses[0].division
                    }));
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition shadow-md"
              >
                <Plus className="w-4 h-4" />
                Add New Schedule
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {timetables.map(t => (
                <div key={t.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group">
                  <div className="bg-blue-600 p-4 text-white flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-white tracking-tight">Class {t.class} {t.division}</h3>
                      <p className="text-blue-100 text-[10px] font-extrabold uppercase tracking-widest">{t.day}</p>
                    </div>
                    <button
                      onClick={async () => {
                        if (!confirm('Delete this timetable entry?')) return;
                        await supabase.from('timetable').delete().eq('id', t.id);
                        loadData();
                      }}
                      className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white transition opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-4 space-y-3">
                    {Object.entries(t.schedule as Record<string, string>).map(([period, subject]) => (
                      <div key={period} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                        <span className="text-[10px] font-extrabold text-gray-400 uppercase">Period {period}</span>
                        <span className="text-sm font-bold text-gray-700">{subject || '-'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {timetables.length === 0 && (
                <div className="col-span-full bg-white p-12 text-center rounded-xl border border-dashed border-gray-200">
                  <Calendar className="w-12 h-12 text-gray-100 mx-auto mb-2" />
                  <p className="text-gray-400 italic">No timetables generated yet.</p>
                </div>
              )}
            </div>

            {/* Add Timetable Modal */}
            {showAddTimetable && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                  <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                    <h2 className="text-xl font-bold text-gray-800">Add Schedule Entry</h2>
                    <button onClick={() => setShowAddTimetable(false)} className="text-gray-400 hover:text-gray-600">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <form className="p-6 space-y-6" onSubmit={async (e) => {
                    e.preventDefault();
                    setIsLoading(true);
                    try {
                      // Check if already exists for this class/day
                      const { data: existing } = await (supabase as any)
                        .from('timetable')
                        .select('id')
                        .eq('class', newTimetable.class)
                        .eq('division', newTimetable.division)
                        .eq('day', newTimetable.day)
                        .maybeSingle();

                      if (existing) {
                        await (supabase as any).from('timetable').update(newTimetable).eq('id', (existing as any).id);
                      } else {
                        await (supabase as any).from('timetable').insert([newTimetable]);
                      }

                      setShowAddTimetable(false);
                      loadData();
                    } catch (err) {
                      console.error(err);
                      alert('Failed to save timetable');
                    } finally {
                      setIsLoading(false);
                    }
                  }}>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Select Class</label>
                        <select
                          className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 font-bold text-gray-700"
                          value={`${newTimetable.class}-${newTimetable.division}`}
                          onChange={e => {
                            const [cls, div] = e.target.value.split('-');
                            setNewTimetable({ ...newTimetable, class: cls, division: div });
                          }}
                        >
                          {availableClasses.map(c => (
                            <option key={`${c.class}-${c.division}`} value={`${c.class}-${c.division}`}>
                              Class {c.class} - {c.division}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Select Day</label>
                        <select
                          className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 font-bold text-gray-700"
                          value={newTimetable.day}
                          onChange={e => setNewTimetable({ ...newTimetable, day: e.target.value })}
                        >
                          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                            <option key={day} value={day}>{day}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b pb-2">Schedule Details</h3>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                        {['1', '2', '3', '4', '5', '6'].map(period => (
                          <div key={period} className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-[10px] font-bold text-blue-500">
                              P{period}
                            </div>
                            <input
                              type="text"
                              placeholder="Subject Name"
                              className="flex-1 px-3 py-2 border border-gray-100 rounded-lg text-sm"
                              value={(newTimetable.schedule as any)?.[period] || ''}
                              onChange={e => {
                                setNewTimetable({
                                  ...newTimetable,
                                  schedule: {
                                    ...(newTimetable.schedule as any),
                                    [period]: e.target.value
                                  }
                                });
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowAddTimetable(false)}
                        className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition flex items-center justify-center gap-2 shadow-lg"
                      >
                        {isLoading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : 'Save Timetable'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* KNOWLEDGE BASE TAB */}
        {activeTab === 'knowledge' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-blue-500" />
                    Rapid Add FAQ
                  </h3>
                  <form className="space-y-4" onSubmit={async (e) => {
                    e.preventDefault();
                    if (!newFAQ.question || !newFAQ.answer) return;
                    setIsLoading(true);
                    try {
                      const { error } = await (supabase as any).from('faqs').insert([newFAQ]);
                      if (error) throw error;
                      setNewFAQ({ question: '', answer: '', category: 'General' });
                      await loadData();
                      alert('FAQ added! ✅');
                    } catch (err) {
                      console.error(err);
                      alert('Failed to add FAQ');
                    } finally {
                      setIsLoading(false);
                    }
                  }}>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
                      <input
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="How long is the semester?"
                        value={newFAQ.question}
                        onChange={e => setNewFAQ({ ...newFAQ, question: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Answer</label>
                      <textarea
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        placeholder="Semesters are typically 5 months..."
                        value={newFAQ.answer}
                        onChange={e => setNewFAQ({ ...newFAQ, answer: e.target.value })}
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-2 bg-blue-500 text-white rounded-lg font-bold shadow-md hover:bg-blue-600 transition disabled:opacity-50"
                    >
                      {isLoading ? 'Adding...' : 'Add FAQ Item'}
                    </button>
                  </form>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-500" />
                    Context Documents
                  </h3>
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center bg-gray-50 hover:bg-white transition">
                    <BookOpen className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 mb-4">Upload PDFs for RAG processing</p>
                    <button className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm font-bold shadow-sm">Pick File</button>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                    <h3 className="text-lg font-bold text-gray-800">Knowledge Base / FAQs</h3>
                    <div className="flex gap-2 text-xs font-bold text-gray-400 uppercase">
                      Total: {faqs.length} items
                    </div>
                  </div>
                  <div className="divide-y max-h-[600px] overflow-y-auto">
                    {faqs.map(faq => (
                      <div key={faq.id} className="p-6 hover:bg-gray-50 transition relative group">
                        <button
                          onClick={async () => {
                            if (!confirm('Delete this FAQ?')) return;
                            await supabase.from('faqs').delete().eq('id', faq.id);
                            loadData();
                          }}
                          className="absolute top-6 right-6 p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{faq.category}</span>
                        <h4 className="font-bold text-gray-800 mt-1 pr-8">{faq.question}</h4>
                        <p className="text-sm text-gray-600 mt-2 leading-relaxed">{faq.answer}</p>
                      </div>
                    ))}
                    {faqs.length === 0 && (
                      <div className="p-12 text-center text-gray-400 italic">
                        No FAQ data found in database.
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-orange-500" />
                    Holiday Calendar
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {holidays.map((holiday) => (
                      <div key={holiday.id} className="p-4 bg-gray-50 rounded-lg border border-gray-100 relative group">
                        <button
                          onClick={async () => {
                            if (!confirm('Delete this holiday?')) return;
                            await supabase.from('holidays').delete().eq('id', holiday.id);
                            loadData();
                          }}
                          className="absolute top-2 right-2 p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <p className="text-[10px] font-extrabold text-orange-600 uppercase mb-1">{holiday.date_range}</p>
                        <p className="text-sm font-bold text-gray-800">{holiday.name}</p>
                      </div>
                    ))}
                    <button
                      onClick={async () => {
                        const name = prompt('Holiday Name:');
                        if (!name) return;
                        const date_range = prompt('Date Range (e.g. June 15 or Dec 20-25):');
                        if (!date_range) return;

                        setIsLoading(true);
                        try {
                          await (supabase as any).from('holidays').insert([{ name, date_range }]);
                          await loadData();
                        } catch (err) {
                          console.error(err);
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                      className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 hover:text-blue-500 hover:border-blue-300 transition group min-h-[80px]"
                    >
                      <Plus className="w-5 h-5 mb-1 group-hover:scale-110 transition" />
                      <span className="text-xs font-bold">Add Holiday</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
