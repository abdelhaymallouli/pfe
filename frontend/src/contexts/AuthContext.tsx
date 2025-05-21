import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
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
  logout: () => void;
  requestPasswordReset: (email: string) => Promise<any>;
  resetPassword: (token: string, password: string, confirmPassword: string) => Promise<any>;
  googleLogin: (tokenResponse: any) => Promise<any>;
  facebookLogin: (response: any) => Promise<any>;
  getOAuthProviders: () => Promise<any>;
  linkOAuthProvider: (provider: string, token: string) => Promise<any>;
  unlinkOAuthProvider: (provider: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  const user = OAuthService.getCurrentUser();
  if (user) {
    setCurrentUser(user);
  }
  setLoading(false);
}, []);

const login = async (email: string, password: string) => {
  try {
    const response = await OAuthService.login(email, password);
    if (response.status === 'success') {
      setCurrentUser(response.data.user);
    }
    return response;
  } catch (error) {
    throw error;
  }
};

  const register = async (username: string, email: string, password: string, confirmPassword: string) => {
    return OAuthService.register(username, email, password, confirmPassword);
  };

const logout = () => {
  OAuthService.logout();
  setCurrentUser(null);
};


  const requestPasswordReset = async (email: string) => {
    return OAuthService.requestPasswordReset(email);
  };

  const resetPassword = async (token: string, password: string, confirmPassword: string) => {
    return OAuthService.resetPassword(token, password, confirmPassword);
  };

  const googleLogin = async (tokenResponse: any) => {
    try {
      const response = await OAuthService.googleLogin(tokenResponse);
      setCurrentUser(response.data.user);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const facebookLogin = async (response: any) => {
    try {
      const apiResponse = await OAuthService.facebookLogin(response);
      setCurrentUser(apiResponse.data.user);
      return apiResponse;
    } catch (error) {
      throw error;
    }
  };

  const getOAuthProviders = async () => {
    return OAuthService.getOAuthProviders();
  };

  const linkOAuthProvider = async (provider: string, token: string) => {
    return OAuthService.linkOAuthProvider(provider, token);
  };

  const unlinkOAuthProvider = async (provider: string) => {
    return OAuthService.unlinkOAuthProvider(provider);
  };

  const value = {
    currentUser,
    isLoggedIn: !!currentUser,
    loading,
    login,
    register,
    logout,
    requestPasswordReset,
    resetPassword,
    googleLogin,
    facebookLogin,
    getOAuthProviders,
    linkOAuthProvider,
    unlinkOAuthProvider
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
