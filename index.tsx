
import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Settings, LogOut, MessageSquare, LayoutDashboard, 
  ShieldCheck, Search, Menu, X, Mic, MicOff, Volume2, 
  Loader2, Check, AlertCircle, Play, Info, ArrowRight, UserCircle, History, RotateCcw, FileText
} from 'lucide-react';
import { Modality } from "@google/genai";
import { INITIAL_STUDENTS, INITIAL_FAQS, INITIAL_APPLICATIONS, Student, FAQ, SchoolApplication, UserRole, SUPPORTED_LANGUAGES } from './db';
import { decode, decodeAudioData, createPcmBlob } from './audio-utils';
import { aiService } from './ai-service';
import { Logo } from './Logo';
import { AdminView } from './AdminView';
import { DashboardView } from './DashboardView';
import { ChatView } from './ChatView';

interface Message {
  role: 'user' | 'model';
  content: string;
  isVoice?: boolean;
  isPlayingTTS?: boolean;
}

const AVAILABLE_VOICES = [
  { id: 'Kore', name: 'Kore', description: 'Energetic & Youthful' },
  { id: 'Puck', name: 'Puck', description: 'Friendly & Casual' },
  { id: 'Charon', name: 'Charon', description: 'Calm & Deep' },
  { id: 'Fenrir', name: 'Fenrir', description: 'Strong & Clear' },
  { id: 'Zephyr', name: 'Zephyr', description: 'Warm & Professional' },
];

export default function App() {
  const [user, setUser] = useState<{ id: string; name: string; role: UserRole } | null>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'dashboard' | 'admin'>('chat');
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [faqs, setFaqs] = useState<FAQ[]>(INITIAL_FAQS);
  const [applications, setApplications] = useState<SchoolApplication[]>(INITIAL_APPLICATIONS);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState(localStorage.getItem('clario_voice') || 'Kore');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewingVoiceId, setPreviewingVoiceId] = useState<string | null>(null);
  const [selectedLang, setSelectedLang] = useState(localStorage.getItem('clario_lang') || 'en');

  // Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const outAudioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const transcriptionRef = useRef<{ input: string; output: string }>({ input: '', output: '' });
  const currentTTSNodeRef = useRef<AudioBufferSourceNode | null>(null);

  const currentStudent = user?.role === 'student' ? students.find(s => s.id === user.id) : null;

  // Persistence: Load messages on user login
  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`clario_chat_${user.id}`);
      if (saved) {
        setMessages(JSON.parse(saved));
      } else {
        const welcome = `Namaste! I'm Clario, your AI buddy. Bol yaar, kya help karu? (Chatting in ${SUPPORTED_LANGUAGES.find(l=>l.code===selectedLang)?.name})`;
        setMessages([{ role: 'model', content: welcome }]);
      }
    }
  }, [user]);

  // Persistence: Save messages whenever they change
  useEffect(() => {
    if (user && messages.length > 0) {
      localStorage.setItem(`clario_chat_${user.id}`, JSON.stringify(messages));
    }
  }, [messages, user]);

  useEffect(() => {
    return () => {
      cleanupLiveSession();
      if (audioContextRef.current) audioContextRef.current.close();
      if (outAudioContextRef.current) outAudioContextRef.current.close();
      if (currentTTSNodeRef.current) currentTTSNodeRef.current.stop();
    };
  }, []);

  const cleanupLiveSession = () => {
    if (sessionRef.current) {
      try { sessionRef.current.close(); } catch (e) {}
      sessionRef.current = null;
    }
    setIsVoiceActive(false);
    setIsConnecting(false);
    sourcesRef.current.forEach(s => { try { s.stop(); } catch (e) {} });
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
  };

  const playTTS = async (text: string, index?: number) => {
    if (!text || text.trim() === '') return;
    if (currentTTSNodeRef.current) {
      try { currentTTSNodeRef.current.stop(); } catch (e) {}
    }

    if (index !== undefined) {
      setMessages(prev => prev.map((m, i) => i === index ? { ...m, isPlayingTTS: true } : { ...m, isPlayingTTS: false }));
    }

    try {
      const response = await aiService.textToSpeech(text, selectedVoice);
      const base64Audio = response?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        if (!outAudioContextRef.current) outAudioContextRef.current = new AudioContext({ sampleRate: 24000 });
        const ctx = outAudioContextRef.current;
        if (ctx.state === 'suspended') await ctx.resume();
        const buffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.onended = () => {
          if (index !== undefined) setMessages(prev => prev.map((m, i) => i === index ? { ...m, isPlayingTTS: false } : m));
        };
        currentTTSNodeRef.current = source;
        source.start();
      }
    } catch (e) {
      if (index !== undefined) setMessages(prev => prev.map((m, i) => i === index ? { ...m, isPlayingTTS: false } : m));
    }
  };

  const handleSendMessage = async (textOverride?: string) => {
    const userMsg = textOverride || "";
    if (!userMsg.trim() || isLoading || isVoiceActive) return;
    
    const history = [...messages, { role: 'user', content: userMsg } as Message];
    setMessages(history);
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const studentContext = currentStudent ? JSON.stringify(currentStudent) : 'Guest User';
      const faqContext = JSON.stringify(faqs);
      const languageName = SUPPORTED_LANGUAGES.find(l => l.code === selectedLang)?.name || 'English';
      
      const systemPrompt = `You are "Clario", a friendly multilingual school AI buddy. Talk like a friend using slangs like Yaar, Bhai, Bro, Machi, Bondhu. Context: Student Data: ${studentContext}, School FAQs: ${faqContext}. Preferred Language: ${languageName}. If asked about exams, fees or marks, refer to the provided context. If no data exists, suggest talking to Admin, Bhai!`;
      
      const response = await aiService.generateReply(history, systemPrompt);
      const modelReply = response.text || "Sorry bro, something went wrong.";
      const modelMsg: Message = { role: 'model', content: modelReply };
      setMessages(prev => [...prev, modelMsg]);
      playTTS(modelReply, history.length);
    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVoiceMode = async () => {
    if (isVoiceActive) { cleanupLiveSession(); return; }
    setIsConnecting(true);
    setErrorMessage(null);

    try {
      if (!audioContextRef.current) audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      if (!outAudioContextRef.current) outAudioContextRef.current = new AudioContext({ sampleRate: 24000 });
      await audioContextRef.current.resume();
      await outAudioContextRef.current.resume();

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const studentContext = currentStudent ? JSON.stringify(currentStudent) : 'Guest User';
      const systemInstruction = `You are "Clario", conversational bot. Use slangs like Yaar/Bhai/Bro. Data: ${studentContext}. Speak in user's detected language.`;

      const sessionPromise = aiService.connectLive({
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: selectedVoice } } },
        systemInstruction,
        inputAudioTranscription: {},
        outputAudioTranscription: {}
      }, {
        onopen: () => {
          setIsVoiceActive(true);
          setIsConnecting(false);
          const source = audioContextRef.current!.createMediaStreamSource(stream);
          const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
          scriptProcessor.onaudioprocess = (e) => {
            const pcm = createPcmBlob(e.inputBuffer.getChannelData(0));
            sessionPromise.then(s => s.sendRealtimeInput({ media: pcm }));
          };
          source.connect(scriptProcessor);
          scriptProcessor.connect(audioContextRef.current!.destination);
        },
        onmessage: async (message: any) => {
          if (message.serverContent?.inputTranscription) transcriptionRef.current.input += message.serverContent.inputTranscription.text;
          if (message.serverContent?.outputTranscription) transcriptionRef.current.output += message.serverContent.outputTranscription.text;
          if (message.serverContent?.turnComplete) {
            const { input: uIn, output: aOut } = transcriptionRef.current;
            if (uIn || aOut) {
              setMessages(prev => [
                ...prev, 
                ...(uIn ? [{ role: 'user', content: uIn, isVoice: true } as Message] : []), 
                ...(aOut ? [{ role: 'model', content: aOut, isVoice: true } as Message] : [])
              ]);
            }
            transcriptionRef.current = { input: '', output: '' };
          }
          const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (base64Audio) {
            const outCtx = outAudioContextRef.current!;
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outCtx.currentTime);
            const buffer = await decodeAudioData(decode(base64Audio), outCtx, 24000, 1);
            const source = outCtx.createBufferSource();
            source.buffer = buffer;
            source.connect(outCtx.destination);
            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += buffer.duration;
            sourcesRef.current.add(source);
          }
        },
        onerror: () => cleanupLiveSession(),
        onclose: () => cleanupLiveSession()
      });
      sessionRef.current = await sessionPromise;
    } catch (err: any) {
      cleanupLiveSession();
      setErrorMessage("Mic block kar diya kya, Bhai? " + err.message);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const { username, password } = loginForm;
    if (username === 'admin' && password === 'admin123') {
      setUser({ id: '0', name: 'Principal Admin', role: 'admin' });
      setActiveTab('admin');
    } else if (username.startsWith('student') && password === 'pass' + username.slice(7)) {
      const id = username.slice(7);
      const s = students.find(x => x.id === id);
      if (s) { setUser({ id: s.id, name: s.name, role: 'student' }); setActiveTab('dashboard'); }
    } else if (username === 'guest') {
      setUser({ id: 'guest', name: 'Guest Explorer', role: 'guest' });
      setActiveTab('chat');
    } else {
      alert("Creds galat hai, Bhai! Try: guest, admin/admin123, or student101/pass101");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-start p-6 transition-colors font-sans overflow-y-auto scrollbar-hide">
        <div className="fixed inset-0 pointer-events-none opacity-50 dark:opacity-20">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/20 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/20 blur-[120px] rounded-full" />
        </div>

        <div className="w-full max-w-md relative z-10 py-12 pb-24">
          <div className="text-center mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="mb-8 flex justify-center scale-150">
              <Logo className="w-20 h-20" />
            </div>
            <h2 className="text-6xl font-black dark:text-white text-slate-900 mb-2 tracking-tighter">Clario</h2>
            <p className="text-slate-500 font-bold text-lg">Your Smart School Buddy</p>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 duration-500">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl"><UserCircle size={24} /></div>
                <h3 className="text-xl font-black dark:text-white text-slate-800">Login Portal</h3>
              </div>
              
              <form onSubmit={handleLogin} className="space-y-4">
                <input type="text" placeholder="Username" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 dark:text-white text-slate-900 focus:ring-2 focus:ring-indigo-600 outline-none transition-all" value={loginForm.username} onChange={e => setLoginForm({ ...loginForm, username: e.target.value })} required />
                <input type="password" placeholder="Password" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 dark:text-white text-slate-900 focus:ring-2 focus:ring-indigo-600 outline-none transition-all" value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} required />
                <button className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group">
                  Start, Bhai! <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            </div>

            <div className="flex items-center gap-4 px-10">
              <div className="flex-1 h-[1px] bg-slate-200 dark:bg-slate-800" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">or</span>
              <div className="flex-1 h-[1px] bg-slate-200 dark:bg-slate-800" />
            </div>

            <button onClick={() => { setUser({ id: 'guest', name: 'Guest', role: 'guest' }); setActiveTab('chat'); }} className="w-full bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex items-center justify-center gap-3 group hover:bg-white dark:hover:bg-slate-900 transition-all shadow-xl">
              <Search size={24} className="text-indigo-500 group-hover:scale-110 transition-transform" />
              <div className="text-left"><p className="font-black dark:text-white text-slate-900">Explore as Guest</p><p className="text-[10px] text-slate-500 uppercase font-black">Limited access to FAQs & Chat</p></div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white dark:bg-slate-950 font-sans transition-colors overflow-hidden">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 dark:bg-slate-900 bg-white border-r dark:border-slate-800 border-slate-200 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
        <div className="flex flex-col h-full">
          <div className="p-10 flex items-center gap-4">
            <Logo className="w-12 h-12" />
            <h1 className="text-2xl font-black dark:text-white text-slate-900 tracking-tighter">Clario</h1>
          </div>
          <nav className="flex-1 px-4 space-y-2">
            {[
              { id: 'chat', label: 'AI Chat', icon: <MessageSquare size={20} /> },
              ...(user.role !== 'guest' ? [{ id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> }] : []),
              ...(user.role === 'admin' ? [{ id: 'admin', label: 'Admin Panel', icon: <ShieldCheck size={20} /> }] : [])
            ].map(tab => (
              <button key={tab.id} onClick={() => { setActiveTab(tab.id as any); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-4 px-6 py-4 rounded-[1.5rem] font-black transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                {tab.icon} <span>{tab.label}</span>
              </button>
            ))}
          </nav>
          <div className="p-6">
            <div className="bg-slate-100 dark:bg-slate-800/50 rounded-3xl p-6 border dark:border-slate-700">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-black">{user.name[0]}</div>
                <div className="overflow-hidden"><p className="text-sm font-black dark:text-white text-slate-900 truncate">{user.name}</p><p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{user.role}</p></div>
              </div>
              <button onClick={() => setUser(null)} className="w-full flex items-center justify-center gap-2 py-3 text-xs font-black text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"><LogOut size={16} /> Log Out, Yaar!</button>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 border-b dark:border-slate-800 border-slate-200 px-8 flex items-center justify-between dark:bg-slate-950/80 bg-white/80 backdrop-blur-xl sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden p-2 text-slate-500"><Menu size={24} /></button>
            <h2 className="text-xl font-black dark:text-white text-slate-900 uppercase tracking-widest flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]"></span> {activeTab}
            </h2>
          </div>
          <div className="flex items-center gap-4">
             {errorMessage && <div className="hidden md:flex items-center gap-2 text-rose-500 text-xs font-black bg-rose-500/10 px-4 py-2 rounded-full border border-rose-500/20"><AlertCircle size={14} /> {errorMessage}</div>}
             <button onClick={() => setShowSettings(true)} className="p-3 bg-slate-100 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl text-slate-500 hover:text-indigo-500 transition-all shadow-sm active:scale-95"><Settings size={20} /></button>
          </div>
        </header>

        <div className="flex-1 overflow-hidden">
          {activeTab === 'chat' && <ChatView messages={messages} isLoading={isLoading} isVoiceActive={isVoiceActive} isConnecting={isConnecting} onSendMessage={handleSendMessage} onToggleVoice={toggleVoiceMode} onPlayTTS={playTTS} faqs={faqs} />}
          {activeTab === 'dashboard' && currentStudent && <DashboardView currentStudent={currentStudent} dashboardImages={{}} isGeneratingImages={false} onUpdateSettings={()=>{}} onRefreshVisuals={()=>{}} applications={applications} setApplications={setApplications} />}
          {activeTab === 'admin' && <AdminView students={students} setStudents={setStudents} faqs={faqs} setFaqs={setFaqs} applications={applications} setApplications={setApplications} />}
        </div>
      </main>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setShowSettings(false)} />
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-[3rem] p-10 relative shadow-2xl ring-1 ring-white/10 overflow-y-auto max-h-[90vh] scrollbar-hide">
            <div className="flex justify-between items-center mb-10"><h3 className="text-3xl font-black dark:text-white text-slate-900">Settings, Bro!</h3><button onClick={() => setShowSettings(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 transition-colors"><X size={28} /></button></div>
            
            <div className="space-y-8">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-4 px-1">Native Language</label>
                <div className="grid grid-cols-2 gap-3">
                  {SUPPORTED_LANGUAGES.map(l => (
                    <button key={l.code} onClick={() => { setSelectedLang(l.code); localStorage.setItem('clario_lang', l.code); }} className={`px-4 py-3 rounded-2xl border font-bold text-sm flex items-center justify-between transition-all ${selectedLang === l.code ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>
                      {l.native} {selectedLang === l.code && <Check size={14} />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-4 px-1">Clario's Voice</label>
                <div className="space-y-2">
                  {AVAILABLE_VOICES.map(v => (
                    <button key={v.id} onClick={() => { setSelectedVoice(v.id); localStorage.setItem('clario_voice', v.id); }} className={`w-full px-5 py-4 rounded-2xl border font-bold text-sm flex items-center justify-between transition-all ${selectedVoice === v.id ? 'bg-indigo-600/10 border-indigo-500 text-indigo-600' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>
                      <div className="text-left"><p>{v.name}</p><p className="text-[9px] font-black uppercase opacity-60 tracking-wider">{v.description}</p></div>
                      {selectedVoice === v.id && <Check size={16} />}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={() => { localStorage.removeItem(`clario_chat_${user?.id}`); setMessages([]); setShowSettings(false); }} className="w-full flex items-center justify-center gap-3 py-5 border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 rounded-2xl font-black transition-all active:scale-95"><RotateCcw size={20} /> Reset Chat History</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
