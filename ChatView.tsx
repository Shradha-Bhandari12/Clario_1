
import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Volume2, Globe, Search, Loader2, Sparkles, AlertCircle, History } from 'lucide-react';
import { FAQ } from './db';

interface ChatViewProps {
  messages: any[];
  isLoading: boolean;
  isVoiceActive: boolean;
  isConnecting: boolean;
  onSendMessage: (text?: string) => void;
  onToggleVoice: () => void;
  onPlayTTS: (text: string, index: number) => void;
  faqs: FAQ[];
}

export const ChatView: React.FC<ChatViewProps> = ({
  messages, isLoading, isVoiceActive, isConnecting,
  onSendMessage, onToggleVoice, onPlayTTS, faqs
}) => {
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = () => {
    if (!input.trim() || isLoading || isVoiceActive) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950">
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scrollbar-hide">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-40 grayscale pointer-events-none">
            <Sparkles size={64} className="mb-4 text-indigo-500" />
            <p className="font-black text-xl">Start chatting with Clario!</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
            <div className={`group relative max-w-[85%] px-6 py-4 rounded-[2rem] shadow-xl transition-all ${
              m.role === 'user' 
              ? 'bg-indigo-600 text-white rounded-br-none shadow-indigo-600/10' 
              : 'bg-white dark:bg-slate-900 dark:border-slate-800 border-slate-200 text-slate-800 dark:text-slate-200 rounded-bl-none shadow-slate-950/5 dark:shadow-none backdrop-blur-sm'
            }`}>
              {m.isVoice && <div className="absolute -top-3 left-4 text-[9px] font-black uppercase tracking-widest text-indigo-400 bg-white dark:bg-slate-950 px-2 py-0.5 rounded-full border dark:border-slate-800 flex items-center gap-1"><History size={10} /> Voice Transcript</div>}
              <div className="flex justify-between items-start gap-4">
                <p className="text-base leading-relaxed whitespace-pre-wrap">{m.content}</p>
                {m.role === 'model' && (
                  <button onClick={() => onPlayTTS(m.content, i)} className={`p-2 rounded-xl transition-all ${m.isPlayingTTS ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600' : 'text-slate-400 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                    {m.isPlayingTTS ? <Loader2 size={16} className="animate-spin" /> : <Volume2 size={16} />}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-1.5 p-4 bg-white/50 dark:bg-slate-900/50 w-fit rounded-3xl border border-slate-100 dark:border-slate-800 animate-pulse">
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]" />
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]" />
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Quick Action Bar */}
      <div className="px-6 py-2 overflow-x-auto whitespace-nowrap scrollbar-hide flex gap-2">
        {faqs.map(faq => (
          <button key={faq.id} onClick={() => onSendMessage(faq.question)} className="px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-xs font-bold text-slate-500 dark:text-slate-400 hover:border-indigo-500 hover:text-indigo-500 transition-all shadow-sm active:scale-95 flex items-center gap-2">
            <Search size={14} className="opacity-40" /> {faq.question}
          </button>
        ))}
      </div>

      {/* Main Input Area */}
      <div className="p-4 md:p-8 bg-white/80 dark:bg-slate-950/80 backdrop-blur-2xl border-t dark:border-slate-800">
        <div className="max-w-5xl mx-auto flex gap-4">
          <button 
            onClick={onToggleVoice} 
            disabled={isConnecting}
            className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all transform active:scale-95 shadow-xl relative ${
              isVoiceActive 
              ? 'bg-rose-500 text-white shadow-rose-500/30 animate-pulse' 
              : 'bg-indigo-600 text-white shadow-indigo-600/20 hover:bg-indigo-700'
            }`}
          >
            {isConnecting ? <Loader2 className="animate-spin" /> : (isVoiceActive ? <MicOff size={28} /> : <Mic size={28} />)}
            {isVoiceActive && <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center"><div className="w-2 h-2 bg-rose-500 rounded-full animate-ping" /></div>}
          </button>
          <div className="flex-1 relative group">
            <input 
              type="text" 
              placeholder={isVoiceActive ? "Clario is listening, Bhai..." : "Talk to Clario, Yaar! Ask me anything..."} 
              disabled={isVoiceActive || isConnecting}
              className="w-full h-16 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[1.5rem] pl-8 pr-16 text-lg dark:text-white text-slate-900 focus:ring-4 focus:ring-indigo-600/10 outline-none transition-all placeholder:text-slate-400 placeholder:font-medium" 
              value={input} 
              onChange={e => setInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSend()}
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="absolute right-3 top-3 bottom-3 aspect-square bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl flex items-center justify-center disabled:opacity-30 disabled:grayscale transition-all active:scale-90 shadow-lg shadow-indigo-600/20"
            >
              <Send size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
