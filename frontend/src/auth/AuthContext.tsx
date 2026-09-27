import { useState, createContext, useContext, useEffect } from 'react';
import { User } from '../types';
import * as authApi from '../api/auth';
import api from '../api/client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (data: any) => Promise<User>;
  register: (data: any) => Promise<User>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('av_token'));
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('av_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          const userData = res.data?.data || res.data;
          setUser(userData);
          setToken(storedToken);
        } catch {
          localStorage.removeItem('av_token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (credentials: any) => {
    const res = await authApi.login(credentials);
    const newToken = res.token;
    const newUser = res.user;
    localStorage.setItem('av_token', newToken);
    setToken(newToken);
    setUser(newUser);
    return newUser;
  };

  const register = async (userData: any) => {
    const res = await authApi.register(userData);
    const newToken = res.token;
    const newUser = res.user;
    localStorage.setItem('av_token', newToken);
    setToken(newToken);
    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    localStorage.removeItem('av_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
