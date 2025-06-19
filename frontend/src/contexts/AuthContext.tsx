import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AuthService from '../services/AuthService';
import OAuthService from '../services/OAuthService';

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
  googleLogin: (tokenResponse: any) => Promise<any>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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
    try {
      const response = await AuthService.register(username, email, password, confirmPassword);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const googleLogin = async (tokenResponse: any) => {
    try {
      const response = await OAuthService.googleLogin(tokenResponse);
      if (response.status === 'success') {
        setCurrentUser(response.data.user);
      }
      return response;
    } catch (error) {
      throw error;
    }
  };

const logout = () => {
  if (isLoggingOut) return;
  setIsLoggingOut(true);
  console.log('Logging out user:', currentUser);
  setCurrentUser(null);
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  setIsLoggingOut(false);
};
  const value = {
    currentUser,
    isLoggedIn: !!currentUser,
    loading,
    login,
    register,
    googleLogin,
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