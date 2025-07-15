// Authentication API
import apiClient from './client';

export const authAPI = {
  // Login user
  login: async (credentials) => {
    try {
      const response = await apiClient.post('/api/method/library_management.api.auth.login', {
        usr: credentials.email,
        pwd: credentials.password
      });
      
      if (response.data.message) {
        // Store auth data
        localStorage.setItem('auth_token', response.data.message.user.api_key);
        localStorage.setItem('user_data', JSON.stringify(response.data.message.user));
        return response.data.message;
      }
      throw new Error('Login failed');
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  // Register new user
  register: async (userData) => {
    try {
      const response = await apiClient.post('/api/method/library_management.api.auth.register', {
        email: userData.email,
        password: userData.password,
        full_name: userData.fullName,
        phone: userData.phone
      });
      return response.data.message;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  // Logout user
  logout: async () => {
    try {
      await apiClient.post('/api/method/library_management.api.auth.logout');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
    } catch (error) {
      // Even if logout fails, clear local storage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const response = await apiClient.get('/api/method/library_management.api.auth.get_current_user');
      return response.data.message;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get user data');
    }
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await apiClient.post('/api/method/library_management.api.auth.change_password', {
        current_password: currentPassword,
        new_password: newPassword
      });
      return response.data.message;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Password change failed');
    }
  }
};