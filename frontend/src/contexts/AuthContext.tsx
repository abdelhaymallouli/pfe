import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AuthService from '../services/AuthService';

interface User {
  id: number;
  username: string;
  email: string;
}

interface AuthContextType {
  currentUser: User | null;
  isLoggedIn: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (username: string, email: string, password: string, confirmPassword: string) => Promise<any>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await AuthService.login(email, password);
      if (response.status === 'success') {
        setCurrentUser(response.data.user);
      }
      return response;
    } catch (error) {
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string, confirmPassword: string) => {
    return AuthService.register(username, email, password, confirmPassword);
  };

  const logout = () => {
    AuthService.logout();
    setCurrentUser(null);
    localStorage.removeItem('venuvibe_user');
  };

  const value = {
    currentUser,
    isLoggedIn: !!currentUser,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};