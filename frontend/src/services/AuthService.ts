import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost/pfe/backend/src/api/';

const AuthService = {
  login: async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/login.php`, {
        email,
        password
      });

      if (response.data.status === 'success') {
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  register: async (username: string, email: string, password: string, confirmPassword: string) => {
    try {
      const response = await axios.post(`${API_URL}/signup.php`, {
        username,
        email,
        password,
        confirm_password: confirmPassword
      });

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isLoggedIn: () => {
    return !!localStorage.getItem('user');
  },
};

export default AuthService;