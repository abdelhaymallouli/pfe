import AuthService from '../services/AuthService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost/VenuVibe--A-Personalized-Event-Planning-Platform/backend/src/api/';

// Extended AuthService with OAuth methods
const OAuthService = {
  // Google OAuth login
  googleLogin: async (tokenResponse: any) => {
    try {
      const response = await fetch(`${API_URL}/oauth/google.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: tokenResponse.credential }),
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        localStorage.setItem('user', JSON.stringify(data.data.user));
        localStorage.setItem('token', data.data.token);
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  },
  
  // Facebook OAuth login
  facebookLogin: async (response: any) => {
    try {
      const apiResponse = await fetch(`${API_URL}/api/oauth/facebook.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          accessToken: response.accessToken,
          userID: response.userID
        }),
      });
      
      const data = await apiResponse.json();
      
      if (data.status === 'success') {
        localStorage.setItem('user', JSON.stringify(data.data.user));
        localStorage.setItem('token', data.data.token);
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  },
  
  // Get user's OAuth providers
  getOAuthProviders: async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No token found');
      }
      
      const response = await fetch(`${API_URL}/api/oauth/providers.php`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },
  
  // Link OAuth provider to existing account
  linkOAuthProvider: async (provider: string, token: string) => {
    try {
      const authToken = localStorage.getItem('token');
      
      if (!authToken) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch(`${API_URL}/api/oauth/link.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({ 
          provider,
          token
        }),
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },
  
  // Unlink OAuth provider from existing account
  unlinkOAuthProvider: async (provider: string) => {
    try {
      const authToken = localStorage.getItem('token');
      
      if (!authToken) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch(`${API_URL}/api/oauth/unlink.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({ provider }),
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }
};

// Combine standard AuthService with OAuthService
export default {
  ...AuthService,
  ...OAuthService
};
