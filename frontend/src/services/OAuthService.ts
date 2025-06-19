import axios from 'axios';
import AuthService from './AuthService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost/pfe/backend/src/api/';

const OAuthService = {
googleLogin: async (tokenResponse: any) => {
  try {
    console.log('Google login request:', tokenResponse);
    const response = await axios.post(`${API_URL}google.php`, {
      code: tokenResponse.code,
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log('Google login response:', JSON.stringify(response.data, null, 2));
    if (response.data.status === 'success') {
      if (!response.data.data.user.id) {
        throw new Error('User ID is missing in response');
      }
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      localStorage.setItem('token', response.data.data.token);
      console.log('Stored token:', response.data.data.token);
    }
    return response.data;
  } catch (error: any){
    console.error('Google login error:', error.response?.data || error);
    throw error;
  }
},


getOAuthProviders: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    try {
      const response = await axios.get(`${API_URL}providers.php`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Failed to get OAuth providers:', error.response?.data || error);
      throw error;
    }
  },


  linkOAuthProvider: async (provider: string, token: string) => {
    try {
      const authToken = localStorage.getItem('token');
      if (!authToken) {
        throw new Error('No authentication token found');
      }
      
      const response = await axios.post(
        `${API_URL}link.php`,
        { provider, token },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  unlinkOAuthProvider: async (provider: string) => {
    try {
      const authToken = localStorage.getItem('token');
      if (!authToken) {
        throw new Error('No authentication token found');
      }
      
      const response = await axios.post(
        `${API_URL}unlink.php`,
        { provider },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default {
  ...AuthService,
  ...OAuthService,
};