import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Send,
  Mic,
  MicOff,
  LogOut,
  User,
  DollarSign,
  BookOpen,
  Calendar,
  FileText,
  Award,
  Loader,
  Volume2,
  Volume,
  Globe,
  Menu,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getChatResponse, getQuickResponseForQuery } from '../services/geminiService';
import { ttsService, INDIAN_LANGUAGES, type IndianLanguage } from '../services/ttsService';
import { elevenLabsTTS } from '../services/elevenLabsTTSService';
import { voiceAssistant, VOICE_LANGUAGES, type SupportedLanguage } from '../services/voiceAssistantService';
import type { Language } from '../lib/translations';
import { LANGUAGE_TO_SPEECH_CODE } from '../lib/translations';
import ApplicationForm from './ApplicationForm';
import HomeworkModal from './HomeworkModal';
import ChatSidebar from './ChatSidebar';

// Map UI language to TTS language
const LANGUAGE_TO_TTS: Record<Language, IndianLanguage> = {
  'en': 'en-IN',
  'hi': 'hi-IN',
  'mr': 'mr-IN',
};

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function StudentChatbot() {
  const { user, logout } = useAuth();
  const { language, setLanguage, t, languageOptions } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: t('welcome', { name: user?.student_name || 'Student' }),
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [showHomeworkModal, setShowHomeworkModal] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<IndianLanguage>('hi-IN');
  const [selectedVoiceLanguage, setSelectedVoiceLanguage] = useState<SupportedLanguage>('hi-IN');
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showTTSMenu, setShowTTSMenu] = useState(false);
  const [showSTTMenu, setShowSTTMenu] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [useElevenLabs, setUseElevenLabs] = useState(elevenLabsTTS.isConfigured()); // Disable if not configured
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load latest session on mount
  useEffect(() => {
    if (user && !currentSessionId) {
      initializeSession();
    }
  }, [user]);

  const initializeSession = async () => {
    try {
      // Check for most recent session
      const { data: sessions } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('student_id', user?.registration_no)
        .order('created_at', { ascending: false })
        .limit(1);

      if (sessions && sessions.length > 0) {
        selectSession(sessions[0].id);
      } else {
        createNewSession();
      }
    } catch (error) {
      console.error('Error initializing session:', error);
    }
  };

  const createNewSession = async () => {
    if (!user) return null;
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert([{
          student_id: user.registration_no,
          title: 'New Chat'
        }])
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setCurrentSessionId(data.id);
        setMessages([{
          role: 'assistant',
          content: t('welcome', { name: user.student_name }),
          timestamp: new Date(),
        }]);
        return data.id;
      }
    } catch (error) {
      console.error('Error creating session:', error);
      return null;
    }
  };

  const selectSession = async (sessionId: string) => {
    setCurrentSessionId(sessionId);
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setMessages(data.map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
          timestamp: new Date(m.created_at)
        })));
      } else {
        // Empty session
        setMessages([{
          role: 'assistant',
          content: t('welcome', { name: user?.student_name || 'Student' }),
          timestamp: new Date(),
        }]);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
      if (window.innerWidth < 768) setIsSidebarOpen(false);
    }
  };

  // Initialize voice assistant on component mount
  useEffect(() => {
    if (voiceAssistant.isSupported()) {
      voiceAssistant.initialize(selectedVoiceLanguage);

      // Set up callbacks for transcript updates
      voiceAssistant.setOnTranscript((result) => {
        console.log('STT Result:', result); // Debug log
        if (result.isFinal) {
          setInputMessage(result.text);
          setInterimTranscript('');
          setIsListening(false);
        } else {
          setInterimTranscript(result.text);
        }
      });

      // Set up error callback
      voiceAssistant.setOnError((error) => {
        console.error('Voice error:', error);
        setIsListening(false);
        const errorMsg: Message = {
          role: 'assistant',
          content: error,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      });
    }
  }, []);

  // Update voice assistant language when it changes
  useEffect(() => {
    if (voiceAssistant.isSupported()) {
      console.log('Changing voice language to:', selectedVoiceLanguage);
      voiceAssistant.setLanguage(selectedVoiceLanguage);
    }
  }, [selectedVoiceLanguage]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !user) return;

    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Ensure we have a session
      let sessionId = currentSessionId;
      if (!sessionId) {
        sessionId = await createNewSession();
      }

      // Save user message to DB
      if (sessionId) {
        await supabase.from('chat_messages').insert([{
          session_id: sessionId,
          role: 'user',
          content: inputMessage
        }]);

        // Update session title if it's the first user message
        if (messages.length <= 1) {
          const title = inputMessage.slice(0, 30) + (inputMessage.length > 30 ? '...' : '');
          await supabase.from('chat_sessions').update({ title }).eq('id', sessionId);
        }
      }

      const conversationHistory = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await getChatResponse(inputMessage, user, conversationHistory, language);

      const assistantMessage: Message = {
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Save assistant message to DB
      if (sessionId) {
        await supabase.from('chat_messages').insert([{
          session_id: sessionId,
          role: 'assistant',
          content: response
        }]);
      }

      // Speak with selected language tone
      if (useElevenLabs && elevenLabsTTS.isConfigured()) {
        elevenLabsTTS.speak(response, language).then(() => {
          setIsSpeaking(false);
        }).catch((err) => {
          console.error('ElevenLabs TTS error, falling back to browser TTS:', err);
          // Fallback to browser TTS
          const ttsLanguage = LANGUAGE_TO_TTS[language];
          ttsService.speak(response, {
            language: ttsLanguage,
            rate: 0.85,
            pitch: 1.0,
            volume: 1.0,
          });
        });
        setIsSpeaking(true);
      } else {
        const ttsLanguage = LANGUAGE_TO_TTS[language];
        ttsService.speak(response, {
          language: ttsLanguage,
          rate: 0.85,
          pitch: 1.0,
          volume: 1.0,
        });
        setIsSpeaking(true);
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Oops! Kuch technical problem hai yaar 🤔 Thodi der baad try karo!',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = async (action: string) => {
    if (!user) return;

    const userMessage: Message = {
      role: 'user',
      content: action === 'fees' ? 'Fees status check kar' :
        action === 'marks' ? 'Mere marks dikha' :
          action === 'attendance' ? 'Attendance kitna hai?' :
            action === 'homework' ? 'Homework submit karna hai' :
              'Meri profile dikha',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    // Ensure session exists
    let sessionId = currentSessionId;
    if (!sessionId) {
      sessionId = await createNewSession();
    }

    // Save quick action message to DB
    if (sessionId) {
      await supabase.from('chat_messages').insert([{
        session_id: sessionId,
        role: 'user',
        content: userMessage.content
      }]);
    }

    if (action === 'homework') {
      setShowHomeworkModal(true);
      return;
    }

    const response = getQuickResponseForQuery(action, user, language);

    const assistantMessage: Message = {
      role: 'assistant',
      content: response,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, assistantMessage]);

    // Save assistant response to DB
    if (sessionId) {
      await supabase.from('chat_messages').insert([{
        session_id: sessionId,
        role: 'assistant',
        content: response
      }]);
    }
    if (useElevenLabs && elevenLabsTTS.isConfigured()) {
      elevenLabsTTS.speak(response, language).then(() => {
        setIsSpeaking(false);
      }).catch((err) => {
        console.error('ElevenLabs TTS error, falling back to browser TTS:', err);
        // Fallback to browser TTS
        const ttsLanguage = LANGUAGE_TO_TTS[language];
        ttsService.speak(response, {
          language: ttsLanguage,
          rate: 0.85,
          pitch: 1.0,
          volume: 1.0,
        });
      });
      setIsSpeaking(true);
    } else {
      const ttsLanguage = LANGUAGE_TO_TTS[language];
      ttsService.speak(response, {
        language: ttsLanguage,
        rate: 0.85,
        pitch: 1.0,
        volume: 1.0,
      });
      setIsSpeaking(true);
    }
  };

  const toggleVoiceInput = () => {
    if (!voiceAssistant.isSupported()) {
      alert(t('voiceNotSupported'));
      return;
    }

    if (isListening) {
      voiceAssistant.stopListening();
      setIsListening(false);
    } else {
      const started = voiceAssistant.startListening();
      if (started) {
        setIsListening(true);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex">
      {user && (
        <ChatSidebar
          student={user}
          currentSessionId={currentSessionId}
          onSelectSession={selectSession}
          onNewChat={createNewSession}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex-1 max-w-4xl mx-auto h-screen flex flex-col w-full">
        <div className="bg-white shadow-lg border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg text-gray-600"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-800">{user?.student_name}</h2>
                <p className="text-xs text-gray-500">{user?.registration_no}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* UI Language Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition text-sm"
                  title="UI Language"
                >
                  <Globe className="w-4 h-4" />
                  <span className="hidden sm:inline">{languageOptions[language].nativeName}</span>
                </button>
                {showLanguageMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    {Object.entries(languageOptions).map(([lang, info]) => (
                      <button
                        key={lang}
                        onClick={() => {
                          setLanguage(lang as any);
                          setShowLanguageMenu(false);
                        }}
                        className={`w-full text-left px-4 py-2 hover:bg-green-50 transition text-sm ${language === lang ? 'bg-green-100 text-green-700 font-semibold' : 'text-gray-700'
                          }`}
                      >
                        <div className="font-medium">{info.name}</div>
                        <div className="text-xs text-gray-500">{info.nativeName}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* TTS Voice Language Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowTTSMenu(!showTTSMenu)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition text-sm"
                  title="Text-to-Speech Voice"
                >
                  <Volume2 className="w-4 h-4" />
                  <span className="hidden sm:inline">{INDIAN_LANGUAGES[selectedLanguage].name}</span>
                </button>
                {showTTSMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    {Object.entries(INDIAN_LANGUAGES).map(([lang, info]) => (
                      <button
                        key={lang}
                        onClick={() => {
                          setSelectedLanguage(lang as IndianLanguage);
                          setShowTTSMenu(false);
                        }}
                        className={`w-full text-left px-4 py-2 hover:bg-purple-50 transition text-sm ${selectedLanguage === lang ? 'bg-purple-100 text-purple-700 font-semibold' : 'text-gray-700'
                          }`}
                      >
                        <div className="font-medium">{info.name}</div>
                        <div className="text-xs text-gray-500">{info.region}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* STT Voice Language Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowSTTMenu(!showSTTMenu)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition text-sm"
                  title="Speech-to-Text Language"
                >
                  <Mic className="w-4 h-4" />
                  <span className="hidden sm:inline text-xs">{VOICE_LANGUAGES[selectedVoiceLanguage].nativeName}</span>
                </button>
                {showSTTMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                    {Object.entries(VOICE_LANGUAGES).map(([lang, info]) => (
                      <button
                        key={lang}
                        onClick={() => {
                          setSelectedVoiceLanguage(lang as SupportedLanguage);
                          setShowSTTMenu(false);
                        }}
                        className={`w-full text-left px-4 py-2 hover:bg-blue-50 transition text-sm ${selectedVoiceLanguage === lang ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-700'
                          }`}
                      >
                        <div className="font-medium">{info.name}</div>
                        <div className="text-xs text-gray-500">{info.flag}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">{t('logout')}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 ${message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-800 shadow-md border border-gray-100'
                  }`}
              >
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                <p
                  className={`text-xs mt-2 ${message.role === 'user' ? 'text-blue-100' : 'text-gray-400'
                    }`}
                >
                  {message.timestamp.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white rounded-2xl px-4 py-3 shadow-md border border-gray-100">
                <Loader className="w-5 h-5 animate-spin text-blue-500" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="bg-white border-t border-gray-200 p-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
            <button
              onClick={() => handleQuickAction('fees')}
              className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition text-sm"
            >
              <DollarSign className="w-4 h-4" />
              {t('fees')}
            </button>
            <button
              onClick={() => handleQuickAction('marks')}
              className="flex items-center gap-2 px-3 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition text-sm"
            >
              <Award className="w-4 h-4" />
              {t('marks')}
            </button>
            <button
              onClick={() => handleQuickAction('attendance')}
              className="flex items-center gap-2 px-3 py-2 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition text-sm"
            >
              <Calendar className="w-4 h-4" />
              {t('attendance')}
            </button>
            <button
              onClick={() => handleQuickAction('profile')}
              className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition text-sm"
            >
              <User className="w-4 h-4" />
              {t('profile')}
            </button>
            <button
              onClick={() => handleQuickAction('homework')}
              className="flex items-center gap-2 px-3 py-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition text-sm"
            >
              <BookOpen className="w-4 h-4" />
              Homework
            </button>
            <button
              onClick={() => setShowApplicationForm(true)}
              className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition text-sm"
            >
              <FileText className="w-4 h-4" />
              {t('apply')}
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={toggleVoiceInput}
              className={`p-3 rounded-lg transition ${isListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              title="Voice Input"
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            {isSpeaking && (
              <button
                onClick={() => {
                  if (useElevenLabs && elevenLabsTTS.isConfigured()) {
                    elevenLabsTTS.stop();
                  } else {
                    ttsService.stop();
                  }
                  setIsSpeaking(false);
                }}
                className="p-3 rounded-lg transition bg-orange-100 text-orange-600 hover:bg-orange-200"
                title="Stop Voice"
              >
                <Volume className="w-5 h-5 animate-pulse" />
              </button>
            )}
            <input
              type="text"
              value={isListening && interimTranscript ? interimTranscript : inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={isListening ? 'Listening... 🎤' : t('messagePlaceholder')}
              className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isListening ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                }`}
              disabled={isLoading || isListening}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {showApplicationForm && user && (
        <ApplicationForm
          student={user}
          onClose={() => setShowApplicationForm(false)}
          onSubmit={() => {
            const message: Message = {
              role: 'assistant',
              content: 'Bilkul sorted bhai! 🔥\nTera application submit ho gaya hai!\n\nAdmin check karlega jaldi aur approve kardega! ✅\n\nAur kuch chahiye? 😊',
              timestamp: new Date(),
            };
            setMessages((prev) => [...prev, message]);
          }}
        />
      )}
      {showHomeworkModal && user && (
        <HomeworkModal
          student={user}
          onClose={() => setShowHomeworkModal(false)}
          onSubmit={() => {
            const message: Message = {
              role: 'assistant',
              content: 'Badhiya bhai! Homework submit ho gaya! 🔥\nTeacher review karke marks dedenge!\n\nKuch aur help chahiye? 😊',
              timestamp: new Date(),
            };
            setMessages((prev) => [...prev, message]);
          }}
        />
      )}
    </div>
  );
}
