import { useState, useEffect } from 'react';
import { MessageSquare, Plus, Trash2, X, MessageCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Student } from '../types/database';

interface ChatSession {
    id: string;
    title: string;
    created_at: string;
}

interface ChatSidebarProps {
    student: Student;
    currentSessionId: string | null;
    onSelectSession: (sessionId: string) => void;
    onNewChat: () => void;
    isOpen: boolean;
    onClose: () => void;
}

export default function ChatSidebar({
    student,
    currentSessionId,
    onSelectSession,
    onNewChat,
    isOpen,
    onClose
}: ChatSidebarProps) {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (student) {
            loadSessions();
        }
    }, [student, currentSessionId]); // Reload when session changes to reflect new titles if any

    const loadSessions = async () => {
        try {
            const { data, error } = await supabase
                .from('chat_sessions')
                .select('*')
                .eq('student_id', student.registration_no)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setSessions(data || []);
        } catch (error) {
            console.error('Error loading sessions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const deleteSession = async (e: React.MouseEvent, sessionId: string) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this chat?')) return;

        try {
            const { error } = await supabase
                .from('chat_sessions')
                .delete()
                .eq('id', sessionId);

            if (error) throw error;

            setSessions(sessions.filter(s => s.id !== sessionId));
            if (currentSessionId === sessionId) {
                onNewChat();
            }
        } catch (error) {
            console.error('Error deleting session:', error);
            alert('Failed to delete chat session');
        }
    };

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div className={`
        fixed top-0 left-0 bottom-0 w-64 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 md:w-80 md:shadow-none md:border-r border-gray-200
      `}>
                <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 md:bg-white">
                    <h2 className="font-bold text-gray-800 flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-blue-500" />
                        Chat History
                    </h2>
                    <button onClick={onClose} className="md:hidden p-1 hover:bg-gray-200 rounded">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-4">
                    <button
                        onClick={() => {
                            onNewChat();
                            if (window.innerWidth < 768) onClose();
                        }}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition shadow-sm font-medium"
                    >
                        <Plus className="w-5 h-5" />
                        New Chat
                    </button>
                </div>

                <div className="overflow-y-auto h-[calc(100vh-140px)] px-3 space-y-1">
                    {isLoading ? (
                        <div className="text-center py-4 text-gray-500 text-sm">Loading...</div>
                    ) : sessions.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 text-sm">
                            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-20" />
                            No past chats
                        </div>
                    ) : (
                        sessions.map((session) => (
                            <div
                                key={session.id}
                                onClick={() => {
                                    onSelectSession(session.id);
                                    if (window.innerWidth < 768) onClose();
                                }}
                                className={`
                  group flex items-center justify-between p-3 rounded-lg cursor-pointer transition
                  ${currentSessionId === session.id
                                        ? 'bg-blue-50 text-blue-700 border border-blue-100 shadow-sm'
                                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}
                `}
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <MessageSquare className={`w-4 h-4 flex-shrink-0 ${currentSessionId === session.id ? 'text-blue-500' : 'text-gray-400'}`} />
                                    <div className="truncate text-sm font-medium">
                                        {session.title || 'New Conversation'}
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => deleteSession(e, session.id)}
                                    className={`
                    p-1.5 rounded-full hover:bg-red-100 text-red-500 opacity-0 group-hover:opacity-100 transition
                    ${currentSessionId === session.id ? 'opacity-100' : ''}
                  `}
                                    title="Delete Chat"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
}
