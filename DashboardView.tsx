
import React, { useState } from 'react';
import { Info, CreditCard, Calendar, Bell, Sparkles, GraduationCap, FilePlus, X, Send, History, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Student, SchoolApplication } from './db';

interface DashboardViewProps {
  currentStudent: Student;
  dashboardImages: Record<string, string>;
  isGeneratingImages: boolean;
  onUpdateSettings: (id: string, field: string) => void;
  onRefreshVisuals: () => void;
  applications: SchoolApplication[];
  setApplications: React.Dispatch<React.SetStateAction<SchoolApplication[]>>;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ 
  currentStudent, 
  dashboardImages, 
  isGeneratingImages,
  onRefreshVisuals,
  applications,
  setApplications
}) => {
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [newApp, setNewApp] = useState<{ type: SchoolApplication['type']; reason: string }>({
    type: 'Leave',
    reason: ''
  });

  const studentApps = applications.filter(app => app.studentId === currentStudent.id);

  const handleSubmitApp = () => {
    if (!newApp.reason.trim()) {
      alert("Bhai, reason to batao!");
      return;
    }
    const app: SchoolApplication = {
      id: `app-${Date.now()}`,
      studentId: currentStudent.id,
      studentName: currentStudent.name,
      type: newApp.type,
      reason: newApp.reason,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending'
    };
    setApplications(prev => [app, ...prev]);
    setIsAppModalOpen(false);
    setNewApp({ type: 'Leave', reason: '' });
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 h-full overflow-y-auto scrollbar-hide animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-3xl font-black text-white">Academic Overview</h3>
          <p className="text-slate-500">Roll No: {currentStudent.rollNo}</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsAppModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
          >
            <FilePlus size={20} /> New Request
          </button>
          <button onClick={onRefreshVisuals} disabled={isGeneratingImages} className="p-3 bg-indigo-600/10 text-indigo-400 border border-indigo-600/20 rounded-2xl hover:bg-indigo-600 transition-all hover:text-white group">
            <Sparkles size={20} className={isGeneratingImages ? 'animate-spin' : 'group-hover:rotate-12'} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 shadow-xl relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Attendance</p>
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg"><Info size={16} /></div>
          </div>
          <h3 className="text-5xl font-black text-white">{currentStudent.attendance}%</h3>
          <div className="mt-6 w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-indigo-500 h-full transition-all duration-1000" style={{ width: `${currentStudent.attendance}%` }} />
          </div>
          {dashboardImages.attendance && <img src={dashboardImages.attendance} className="absolute -bottom-4 -right-4 w-24 h-24 opacity-20 blur-sm group-hover:blur-0 transition-all" />}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 shadow-xl relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Fee Status</p>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg"><CreditCard size={16} /></div>
          </div>
          <h3 className={`text-2xl font-black mt-2 ${currentStudent.feesPaid ? 'text-emerald-400' : 'text-rose-400'}`}>
            {currentStudent.feesPaid ? 'FULLY PAID' : 'PENDING'}
          </h3>
          <p className="text-[10px] text-slate-500 mt-2">Next due date: 15 Oct, 2024</p>
          {dashboardImages.fees && <img src={dashboardImages.fees} className="absolute -bottom-4 -right-4 w-24 h-24 opacity-20 blur-sm group-hover:blur-0 transition-all" />}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 shadow-xl relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Important Alerts</p>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg animate-bounce"><Bell size={16} /></div>
          </div>
          <div className="space-y-2 max-h-24 overflow-y-auto pr-2 scrollbar-hide">
             {currentStudent.notifications.map(n => (
               <div key={n.id} className="text-[11px] bg-slate-800/50 p-2 rounded-xl border border-slate-700/50">
                 <span className="font-bold text-white block mb-1">{n.text}</span>
                 <span className="opacity-40">{n.date}</span>
               </div>
             ))}
          </div>
          {dashboardImages.exam && <img src={dashboardImages.exam} className="absolute -bottom-4 -right-4 w-24 h-24 opacity-20 blur-sm group-hover:blur-0 transition-all" />}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-8 md:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-5"><GraduationCap size={150} /></div>
          <h4 className="text-xl font-black text-white mb-8 border-b border-slate-800 pb-6 flex items-center gap-4">
            <Sparkles size={20} className="text-indigo-500" />
            Report Card
          </h4>
          <div className="space-y-8 relative z-10">
            {Object.entries(currentStudent.marks).map(([subject, score]) => (
              <div key={subject}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-300 font-bold capitalize text-lg tracking-wide">{subject}</span>
                  <span className="text-white font-black text-xl">{score}<span className="text-slate-600 text-sm ml-1">/100</span></span>
                </div>
                <div className="w-full bg-slate-800 h-3.5 rounded-full overflow-hidden border border-white/5 ring-4 ring-slate-900 shadow-inner">
                  <div 
                    className={`h-full rounded-full transition-all duration-[2s] ease-out ${score > 80 ? 'bg-indigo-500' : score > 50 ? 'bg-amber-500' : 'bg-rose-500'}`} 
                    style={{ width: `${score}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-8 md:p-10 shadow-2xl relative overflow-hidden flex flex-col">
          <h4 className="text-xl font-black text-white mb-8 border-b border-slate-800 pb-6 flex items-center gap-4">
            <History size={20} className="text-indigo-500" />
            My Request Status
          </h4>
          <div className="flex-1 space-y-4 overflow-y-auto pr-2 scrollbar-hide max-h-[350px]">
            {studentApps.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-30 text-center py-10">
                <FilePlus size={48} className="mb-2" />
                <p className="font-bold">No requests submitted yet, yaar.</p>
              </div>
            ) : (
              studentApps.map(app => (
                <div key={app.id} className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-2xl flex justify-between items-center group transition-all hover:bg-slate-800/60">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-indigo-400">{app.type}</p>
                    <p className="text-sm font-bold text-slate-200 truncate max-w-[150px]">{app.reason}</p>
                    <p className="text-[9px] text-slate-500">{app.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {app.status === 'Approved' ? <CheckCircle size={18} className="text-emerald-500" /> : app.status === 'Rejected' ? <XCircle size={18} className="text-rose-500" /> : <Clock size={18} className="text-amber-500 animate-pulse" />}
                    <span className={`text-[10px] font-black uppercase ${app.status === 'Approved' ? 'text-emerald-500' : app.status === 'Rejected' ? 'text-rose-500' : 'text-amber-500'}`}>{app.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Application Modal */}
      {isAppModalOpen && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setIsAppModalOpen(false)} />
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-[3rem] p-8 md:p-10 relative shadow-2xl ring-1 ring-white/10">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-white">New School Request</h3>
              <button onClick={() => setIsAppModalOpen(false)} className="p-2 hover:bg-slate-800 rounded-full text-slate-500"><X size={28} /></button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-4 px-1">Application Type</label>
                <div className="grid grid-cols-3 gap-3">
                  {['Bonafide', 'Leave', 'General'].map(type => (
                    <button 
                      key={type}
                      onClick={() => setNewApp({ ...newApp, type: type as any })}
                      className={`py-3 rounded-2xl border font-black text-xs transition-all ${newApp.type === type ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-white'}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2 px-1">Detailed Reason</label>
                <textarea 
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 text-white h-32 focus:ring-2 focus:ring-indigo-600 outline-none resize-none placeholder:text-slate-600" 
                  placeholder="Bhai, kya kaam hai? Clearly batao..."
                  value={newApp.reason}
                  onChange={e => setNewApp({ ...newApp, reason: e.target.value })}
                />
              </div>

              <button 
                onClick={handleSubmitApp}
                className="w-full bg-indigo-600 py-5 rounded-2xl font-black text-white shadow-xl shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <Send size={20} /> Submit Request, Yaar!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
