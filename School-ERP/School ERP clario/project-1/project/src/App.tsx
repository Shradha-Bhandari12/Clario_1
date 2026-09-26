import { useAuth } from './contexts/AuthContext';
import LoginPage from './components/LoginPage';
import StudentChatbot from './components/StudentChatbot';
import AdminDashboard from './components/AdminDashboard';

function App() {
  const { user, admin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (admin) {
    return <AdminDashboard />;
  }

  if (user) {
    return <StudentChatbot />;
  }

  return <LoginPage />;
}

export default App;
