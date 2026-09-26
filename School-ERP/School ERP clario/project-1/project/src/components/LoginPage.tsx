import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { GraduationCap, UserCircle, Lock, LogIn } from 'lucide-react';

export default function LoginPage() {
  const [registrationNo, setRegistrationNo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const { login, adminLogin } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!registrationNo || !password) {
      setError('Arrey bhai! Saari details toh dal do 😅');
      return;
    }

    const success = isAdmin
      ? await adminLogin(registrationNo, password)
      : await login(registrationNo, password);

    if (!success) {
      setError('Galat credentials hai yaar! Check karke phir try karo 🤔');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-full mb-4">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              School ERP Chatbot
            </h1>
            <p className="text-gray-600">
              {isAdmin ? 'Admin Portal 👨‍💼' : 'Student Portal 🎓'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isAdmin ? 'Username' : 'Registration Number'}
              </label>
              <div className="relative">
                <UserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={registrationNo}
                  onChange={(e) => setRegistrationNo(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder={isAdmin ? 'Enter username' : 'Enter Registration No'}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder={isAdmin ? 'Enter password' : 'Enter your name'}
                />
              </div>
              {!isAdmin && (
                <p className="text-xs text-gray-500 mt-1">
                  💡 Password = Your Name (case-insensitive)
                </p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              <LogIn className="w-5 h-5" />
              {isAdmin ? 'Admin Login' : 'Student Login'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsAdmin(!isAdmin);
                setError('');
                setRegistrationNo('');
                setPassword('');
              }}
              className="text-blue-500 hover:text-blue-600 text-sm font-medium"
            >
              {isAdmin ? '← Back to Student Login' : 'Admin Login →'}
            </button>
          </div>

          {!isAdmin && (
            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-xs font-semibold text-blue-900 mb-2">🎯 Demo Credentials:</p>
              <div className="space-y-1 text-xs text-blue-800">
                <p>Reg No: <span className="font-mono font-bold">2024001</span></p>
                <p>Password: <span className="font-mono font-bold">Rahul Sharma</span></p>
              </div>
            </div>
          )}

          {isAdmin && (
            <div className="mt-8 p-4 bg-orange-50 rounded-lg border border-orange-100">
              <p className="text-xs font-semibold text-orange-900 mb-2">🔑 Admin Credentials:</p>
              <div className="space-y-1 text-xs text-orange-800">
                <p>Username: <span className="font-mono font-bold">admin</span></p>
                <p>Password: <span className="font-mono font-bold">admin123</span></p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
