
import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Save, X, ShieldCheck, HelpCircle, Users, Globe, FileText, CheckCircle, XCircle } from 'lucide-react';
import { Student, FAQ, SchoolApplication, SUPPORTED_LANGUAGES } from './db';

interface AdminViewProps {
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  faqs: FAQ[];
  setFaqs: React.Dispatch<React.SetStateAction<FAQ[]>>;
  applications: SchoolApplication[];
  setApplications: React.Dispatch<React.SetStateAction<SchoolApplication[]>>;
}

export const AdminView: React.FC<AdminViewProps> = ({ 
  students, setStudents, faqs, setFaqs, applications, setApplications 
}) => {
  const [adminTab, setAdminTab] = useState<'students' | 'faqs' | 'applications'>('students');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Partial<Student> | null>(null);
  const [editingFaq, setEditingFaq] = useState<Partial<FAQ> | null>(null);

  const saveStudent = () => {
    if (!editingStudent) return;
    if (editingStudent.id) {
      setStudents(prev => prev.map(s => s.id === editingStudent.id ? (editingStudent as Student) : s));
    } else {
      const newStudent = {
        ...editingStudent,
        id: `10${students.length + 1}`,
        rollNo: `S2024-${100 + students.length + 1}`,
        notifications: []
      } as Student;
      setStudents(prev => [...prev, newStudent]);
    }
    setIsModalOpen(false);
    setEditingStudent(null);
  };

  const saveFaq = () => {
    if (!editingFaq) return;
    if (editingFaq.id) {
      setFaqs(prev => prev.map(f => f.id === editingFaq.id ? (editingFaq as FAQ) : f));
    } else {
      const newFaq = { ...editingFaq, id: Date.now().toString() } as FAQ;
      setFaqs(prev => [...prev, newFaq]);
    }
    setIsModalOpen(false);
    setEditingFaq(null);
  };

  const deleteFaq = (id: string) => {
    if (window.confirm("Bhai, pakka FAQ delete karna hai?")) {
      setFaqs(prev => prev.filter(f => f.id !== id));
    }
  };

  const updateApplicationStatus = (id: string, status: 'Approved' | 'Rejected') => {
    setApplications(prev => prev.map(app => app.id === id ? { ...app, status } : app));
  };

  return (
    <div className="p-4 md:p-8 h-full flex flex-col space-y-6 overflow-y-auto scrollbar-hide">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/50 p-6 rounded-[2.5rem] border border-slate-800 backdrop-blur-md">
        <div>
          <h2 className="text-3xl font-black text-white flex items-center gap-3">
            <ShieldCheck className="text-indigo-500" /> Admin Panel
          </h2>
          <p className="text-slate-500 text-sm mt-1 font-medium">Manage Clario's students and school requests</p>
        </div>
        <div className="flex gap-2 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700 overflow-x-auto max-w-full">
          <button 
            onClick={() => setAdminTab('students')} 
            className={`px-4 md:px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap ${adminTab === 'students' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            <Users size={14} /> STUDENTS
          </button>
          <button 
            onClick={() => setAdminTab('faqs')} 
            className={`px-4 md:px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap ${adminTab === 'faqs' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            <HelpCircle size={14} /> FAQs
          </button>
          <button 
            onClick={() => setAdminTab('applications')} 
            className={`px-4 md:px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap ${adminTab === 'applications' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            <FileText size={14} /> REQUESTS
          </button>
        </div>
      </div>

      {adminTab === 'students' && (
        <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl backdrop-blur-sm">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/20">
             <h3 className="font-bold flex items-center gap-2 text-slate-200">Student Directory ({students.length})</h3>
             <button onClick={() => { setEditingStudent({ name: '', marks: { math: 0, science: 0, english: 0 }, attendance: 0, feesPaid: false }); setEditingFaq(null); setIsModalOpen(true); }} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-2">
               <Plus size={16} /> New Admission
             </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-800/50 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                <tr><th className="px-8 py-5">Name</th><th className="px-6 py-5">Roll ID</th><th className="px-6 py-5 text-center">Avg %</th><th className="px-6 py-5 text-center">Fees</th><th className="px-8 py-5 text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {students.map(s => (
                  <tr key={s.id} className="hover:bg-indigo-600/5 group transition-colors">
                    <td className="px-8 py-5"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-indigo-400 font-bold">{s.name[0]}</div><span className="font-bold text-slate-200">{s.name}</span></div></td>
                    <td className="px-6 py-5 text-slate-500 font-mono text-sm">{s.rollNo}</td>
                    <td className="px-6 py-5 text-center"><span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-lg font-black text-xs">{((s.marks.math + s.marks.science + s.marks.english) / 3).toFixed(0)}%</span></td>
                    <td className="px-6 py-5 text-center">{s.feesPaid ? <span className="text-emerald-500 text-[10px] font-black bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">PAID</span> : <span className="text-rose-500 text-[10px] font-black bg-rose-500/10 px-3 py-1.5 rounded-full border border-rose-500/20">PENDING</span>}</td>
                    <td className="px-8 py-5 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditingStudent(s); setEditingFaq(null); setIsModalOpen(true); }} className="p-2.5 text-slate-400 hover:text-white bg-slate-800 rounded-xl transition-all"><Edit2 size={16} /></button>
                      <button onClick={() => setStudents(prev => prev.filter(x => x.id !== s.id))} className="p-2.5 text-rose-500 hover:text-white bg-rose-500/10 rounded-xl transition-all"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {adminTab === 'faqs' && (
        <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl backdrop-blur-sm flex flex-col">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/20">
             <h3 className="font-bold flex items-center gap-2 text-slate-200">School FAQs (Guest Visible)</h3>
             <button onClick={() => { setEditingFaq({ question: '', answer: '', language: 'en' }); setEditingStudent(null); setIsModalOpen(true); }} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-2">
               <Plus size={16} /> New FAQ
             </button>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-y-auto">
            {faqs.map(f => (
              <div key={f.id} className="bg-slate-800/40 border border-slate-700 p-5 rounded-[1.5rem] group relative transition-all hover:border-indigo-500/50 hover:bg-slate-800/60 shadow-lg">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-black text-indigo-400 uppercase bg-indigo-500/10 px-2 py-1 rounded-md border border-indigo-500/20 flex items-center gap-1">
                    <Globe size={10} /> {SUPPORTED_LANGUAGES.find(l => l.code === f.language)?.name || f.language}
                  </span>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditingFaq(f); setEditingStudent(null); setIsModalOpen(true); }} className="p-2 text-slate-500 hover:text-white bg-slate-700/50 rounded-lg transition-colors"><Edit2 size={12} /></button>
                    <button onClick={() => deleteFaq(f.id)} className="p-2 text-rose-500/50 hover:text-rose-500 bg-rose-500/5 rounded-lg transition-colors"><Trash2 size={12} /></button>
                  </div>
                </div>
                <p className="font-black text-slate-100 text-sm mb-2">{f.question}</p>
                <p className="text-slate-400 text-xs leading-relaxed line-clamp-3">{f.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {adminTab === 'applications' && (
        <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl backdrop-blur-sm flex flex-col">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/20">
             <h3 className="font-bold flex items-center gap-2 text-slate-200">Application Requests</h3>
          </div>
          <div className="p-6 flex-1 overflow-y-auto space-y-4">
            {applications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full opacity-40">
                <FileText size={48} className="mb-2" />
                <p>No requests found, Bhai.</p>
              </div>
            ) : (
              applications.map(app => (
                <div key={app.id} className="bg-slate-800/40 border border-slate-700 p-6 rounded-[2rem] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all hover:bg-slate-800/60">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${app.type === 'Bonafide' ? 'bg-indigo-500/20 text-indigo-400' : app.type === 'Leave' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-500/20 text-slate-400'}`}>
                        {app.type} Request
                      </span>
                      <span className="text-[10px] text-slate-500 font-bold">{app.date}</span>
                    </div>
                    <h4 className="font-black text-slate-200">{app.studentName}</h4>
                    <p className="text-slate-400 text-sm italic">"{app.reason}"</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-black px-3 py-1.5 rounded-full border ${app.status === 'Approved' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : app.status === 'Rejected' ? 'bg-rose-500/10 border-rose-500/30 text-rose-500' : 'bg-slate-700/50 border-slate-600 text-slate-400'}`}>
                      {app.status}
                    </span>
                    {app.status === 'Pending' && (
                      <div className="flex gap-2">
                        <button onClick={() => updateApplicationStatus(app.id, 'Approved')} className="p-2.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-xl transition-all"><CheckCircle size={18} /></button>
                        <button onClick={() => updateApplicationStatus(app.id, 'Rejected')} className="p-2.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-all"><XCircle size={18} /></button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Admin Modals */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setIsModalOpen(false)} />
          <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-[3rem] p-8 md:p-10 relative shadow-2xl overflow-y-auto max-h-[90vh] ring-1 ring-white/10">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-white">{editingStudent ? 'Edit Student Profile' : 'Edit School FAQ'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-800 rounded-full text-slate-500 transition-colors"><X size={28} /></button>
            </div>
            
            {editingStudent && (
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2 px-1">Full Name</label>
                  <input type="text" className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-indigo-600 outline-none transition-all" value={editingStudent.name} onChange={e => setEditingStudent({...editingStudent, name: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2 px-1">Attendance %</label>
                    <input type="number" className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-indigo-600 outline-none transition-all" value={editingStudent.attendance} onChange={e => setEditingStudent({...editingStudent, attendance: Number(e.target.value)})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2 px-1">Fee Status</label>
                    <button 
                      onClick={() => setEditingStudent({...editingStudent, feesPaid: !editingStudent.feesPaid})} 
                      className={`w-full py-4 rounded-2xl border font-black transition-all ${editingStudent.feesPaid ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-500'}`}
                    >
                      {editingStudent.feesPaid ? 'PAID' : 'PENDING'}
                    </button>
                  </div>
                </div>
                <div className="bg-slate-800/40 p-6 rounded-3xl border border-slate-800 space-y-4">
                  <p className="text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">Update Marks</p>
                  <div className="grid grid-cols-3 gap-4">
                    {['math', 'science', 'english'].map((subj) => (
                      <div key={subj}>
                         <label className="text-[9px] font-black text-slate-500 uppercase block mb-1 text-center">{subj}</label>
                         <input 
                           type="number" 
                           className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-center text-sm" 
                           value={(editingStudent.marks as any)?.[subj]} 
                           onChange={e => setEditingStudent({...editingStudent, marks: {...editingStudent.marks!, [subj]: Number(e.target.value)}})} 
                         />
                      </div>
                    ))}
                  </div>
                </div>
                <button onClick={saveStudent} className="w-full bg-indigo-600 py-5 rounded-2xl font-black text-white shadow-xl shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-3">
                  <Save size={20} /> Save Student Info
                </button>
              </div>
            )}

            {editingFaq && (
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2 px-1">FAQ Question</label>
                  <input type="text" className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-indigo-600 outline-none" value={editingFaq.question} onChange={e => setEditingFaq({...editingFaq, question: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2 px-1">Detailed Answer</label>
                  <textarea className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 text-white h-32 focus:ring-2 focus:ring-indigo-600 outline-none resize-none" value={editingFaq.answer} onChange={e => setEditingFaq({...editingFaq, answer: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2 px-1">Language</label>
                  <select className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 text-white outline-none appearance-none cursor-pointer" value={editingFaq.language} onChange={e => setEditingFaq({...editingFaq, language: e.target.value})}>
                    {SUPPORTED_LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name} ({l.native})</option>)}
                  </select>
                </div>
                <button onClick={saveFaq} className="w-full bg-indigo-600 py-5 rounded-2xl font-black text-white shadow-xl shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-3">
                  <Save size={20} /> Save FAQ Entry
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
