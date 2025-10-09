import apiClient from '../client';
import { API_ENDPOINTS } from '../../constants/api.constants';

const quotaService = {
  // Get Quota Status
  getQuotaStatus: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.QUOTA.STATUS);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get Upload History
  getUploadHistory: async (months = 6) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.QUOTA.UPLOAD_HISTORY, {
        params: { months },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default quotaService;
