import { useState } from 'react';
import { X, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Student } from '../types/database';
import type { Database } from '../types/database';

interface ApplicationFormProps {
  student: Student;
  onClose: () => void;
  onSubmit: () => void;
}

export default function ApplicationForm({ student, onClose, onSubmit }: ApplicationFormProps) {
  const [applicationType, setApplicationType] = useState('bonafide');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason.trim()) {
      alert('Arrey yaar! Reason toh bata de 😅');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('applications')
        .insert([{
          registration_no: student.registration_no,
          application_type: applicationType,
          reason: reason,
          status: 'pending',
        }] as any);

      if (error) throw error;

      alert('Bilkul sorted! Application submit ho gayi hai 🔥\nAdmin check karlega jaldi! ✅');
      onSubmit();
      onClose();
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Oops! Kuch problem aa gayi 😅 Ek baar phir try kar!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Application Form</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Student Details (Auto-filled)
            </label>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <p className="text-sm text-gray-700">
                <strong>Name:</strong> {student.student_name}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Reg No:</strong> {student.registration_no}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Class:</strong> {student.class} {student.division}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Roll No:</strong> {student.roll_number}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Application Type
            </label>
            <select
              value={applicationType}
              onChange={(e) => setApplicationType(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="bonafide">Bonafide Certificate</option>
              <option value="scholarship">Scholarship Application</option>
              <option value="transfer">Transfer Certificate</option>
              <option value="leave">Leave Application</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason / Purpose
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why do you need this application?"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>

        <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
          <p className="text-xs text-yellow-800">
            💡 <strong>Note:</strong> Your application will be reviewed by the admin. You'll be
            notified once it's approved!
          </p>
        </div>
      </div>
    </div>
  );
}
