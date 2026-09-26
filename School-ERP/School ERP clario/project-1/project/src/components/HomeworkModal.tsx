import { useState, useEffect } from 'react';
import { X, Send, Upload, File, Loader, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Student } from '../types/database';

interface HomeworkModalProps {
    student: Student;
    onClose: () => void;
    onSubmit: () => void;
}

interface Submission {
    id: string;
    title: string;
    description: string;
    file_url: string;
    status: string;
    marks: number | null;
    teacher_notes: string | null;
    submitted_at: string;
}

export default function HomeworkModal({ student, onClose, onSubmit }: HomeworkModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);
    const [uploadProgress, setUploadProgress] = useState(0);

    useEffect(() => {
        loadSubmissions();
    }, []);

    const loadSubmissions = async () => {
        try {
            const { data, error } = await supabase
                .from('homework_submissions')
                .select('*')
                .eq('registration_no', student.registration_no)
                .order('submitted_at', { ascending: false });

            if (error) throw error;
            setSubmissions(data || []);
        } catch (error) {
            console.error('Error loading submissions:', error);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim() || !file) {
            alert('Please provide a title and select a file! 😅');
            return;
        }

        setIsSubmitting(true);
        setUploadProgress(10);

        try {
            // 1. Upload file to Supabase Storage
            const fileExt = file.name.split('.').pop();
            const fileName = `${student.registration_no}_${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            setUploadProgress(30);
            const { error: uploadError } = await supabase.storage
                .from('homework')
                .upload(filePath, file);

            if (uploadError) throw uploadError;
            setUploadProgress(70);

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('homework')
                .getPublicUrl(filePath);

            // 3. Insert metadata into table
            const { error: insertError } = await supabase
                .from('homework_submissions')
                .insert([{
                    registration_no: student.registration_no,
                    title: title,
                    description: description,
                    file_url: publicUrl,
                    status: 'pending'
                }] as any);

            if (insertError) throw insertError;
            setUploadProgress(100);

            alert('Zabardast! Homework submit ho gaya hai 🔥');
            onSubmit();
            setTitle('');
            setDescription('');
            setFile(null);
            await loadSubmissions();
        } catch (error: any) {
            console.error('Error submitting homework:', error);
            alert(`Oops! Submission failed: ${error.message || 'Check if you created the "homework" storage bucket!'}`);
        } finally {
            setIsSubmitting(false);
            setUploadProgress(0);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-6 my-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Homework Portal</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition"
                    >
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Submission Form */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                            <Upload className="w-5 h-5 text-blue-500" />
                            New Submission
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Homework Title*
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Maths Exercise 5.1"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description (Optional)
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Any notes for the teacher?"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    rows={3}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Upload File*
                                </label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400 transition cursor-pointer relative">
                                    <div className="space-y-1 text-center">
                                        <File className="mx-auto h-12 w-12 text-gray-400" />
                                        <div className="flex text-sm text-gray-600">
                                            <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 outline-none">
                                                <span>{file ? file.name : 'Click to select a file'}</span>
                                                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
                                            </label>
                                        </div>
                                        <p className="text-xs text-gray-500">PDF, JPG, PNG up to 10MB</p>
                                    </div>
                                </div>
                            </div>

                            {isSubmitting && (
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-3 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 transition flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader className="w-5 h-5 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        Submit Homework
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Submission History */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            Recent Submissions
                        </h3>

                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                            {isLoadingHistory ? (
                                <div className="flex justify-center py-8">
                                    <Loader className="w-8 h-8 animate-spin text-blue-500" />
                                </div>
                            ) : submissions.length === 0 ? (
                                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    <p className="text-gray-500 italic">No submissions yet! 📚</p>
                                </div>
                            ) : (
                                submissions.map((sub) => (
                                    <div key={sub.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-gray-800">{sub.title}</h4>
                                            <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${sub.status === 'reviewed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {sub.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{sub.description || 'No description'}</p>
                                        <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
                                            <a href={sub.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-semibold hover:underline flex items-center gap-1">
                                                <File className="w-3 h-3" />
                                                View File
                                            </a>
                                            <span className="text-gray-400">{new Date(sub.submitted_at).toLocaleDateString()}</span>
                                        </div>

                                        {sub.status === 'reviewed' && (
                                            <div className="mt-4 pt-4 border-t border-gray-100">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-xs font-bold text-gray-500">Marks:</span>
                                                    <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">{sub.marks}/100</span>
                                                </div>
                                                {sub.teacher_notes && (
                                                    <div className="bg-gray-50 p-2 rounded text-xs text-gray-700 italic border-l-2 border-blue-500">
                                                        "{sub.teacher_notes}"
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
