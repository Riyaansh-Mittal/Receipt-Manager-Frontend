import apiClient from '../client';
import { API_ENDPOINTS } from '../../constants/api.constants';

const authService = {
  // Magic Link Authentication
  requestMagicLink: async (email) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.MAGIC_LINK_REQUEST, { email });
      return response.data;
    } catch (error) {
      throw error; // Let interceptor handle it
    }
  },

  magicLinkLogin: async (token) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.MAGIC_LINK_LOGIN, { token });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Token Management
  refreshToken: async (refreshToken) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.TOKEN_REFRESH, {
        refresh: refreshToken,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getTokenStatus: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.AUTH.TOKEN_STATUS);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Logout
  logout: async (refreshToken) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT, {
        refresh: refreshToken,
      });
      return response.data;
    } catch (error) {
      // Even if logout fails on backend, return success for frontend
      return { message: 'Logged out successfully' };
    }
  },

  // Profile Management
  getProfile: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.AUTH.PROFILE);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateProfile: async (profileData) => {
    try {
      const response = await apiClient.put(API_ENDPOINTS.AUTH.PROFILE, profileData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Email Management
  updateEmail: async (newEmail) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.EMAIL_UPDATE, {
        new_email: newEmail,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  verifyEmail: async (token) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.EMAIL_VERIFY, { token });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  resendVerification: async () => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.EMAIL_RESEND);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // User Stats
  getUserStats: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.AUTH.STATS);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default authService;
