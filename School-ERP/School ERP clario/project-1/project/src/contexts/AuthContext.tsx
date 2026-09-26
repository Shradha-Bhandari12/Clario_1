import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Student, Admin } from '../types/database';

interface AuthContextType {
  user: Student | null;
  admin: Admin | null;
  login: (registrationNo: string, password: string) => Promise<boolean>;
  adminLogin: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Student | null>(null);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('student');
    const storedAdmin = localStorage.getItem('admin');

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    if (storedAdmin) {
      setAdmin(JSON.parse(storedAdmin));
    }

    setIsLoading(false);
  }, []);

  const login = async (registrationNo: string, password: string): Promise<boolean> => {
    try {
      const { supabase } = await import('../lib/supabase');
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('registration_no', registrationNo.toUpperCase())
        .maybeSingle<Student>();

      if (error || !data) {
        return false;
      }

      if (data.student_name.toLowerCase() === password.toLowerCase()) {
        setUser(data);
        localStorage.setItem('student', JSON.stringify(data));
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const adminLogin = async (username: string, password: string): Promise<boolean> => {
    try {
      const { supabase } = await import('../lib/supabase');
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .maybeSingle();

      if (error || !data) {
        return false;
      }

      setAdmin(data);
      localStorage.setItem('admin', JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Admin login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setAdmin(null);
    localStorage.removeItem('student');
    localStorage.removeItem('admin');
  };

  return (
    <AuthContext.Provider value={{ user, admin, login, adminLogin, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
