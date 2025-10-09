import apiClient from "../client";
import { API_ENDPOINTS } from "../../constants/api.constants";

const categoryService = {
  // List All Categories
  listCategories: async () => {
    try {
      console.log("📡 API Call: GET", API_ENDPOINTS.CATEGORIES.LIST);
      const response = await apiClient.get(API_ENDPOINTS.CATEGORIES.LIST);
      console.log("📦 API Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ API Error:", error);
      throw error;
    }
  },

  // Get Category Details
  getCategoryDetails: async (categoryId) => {
    try {
      const url = API_ENDPOINTS.CATEGORIES.DETAIL.replace(":id", categoryId);
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get Usage Statistics
  getUsageStats: async (months = 12) => {
    try {
      const response = await apiClient.get(
        API_ENDPOINTS.CATEGORIES.USAGE_STATS,
        {
          params: { months },
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get User Preferences
  getPreferences: async (limit = 10) => {
    try {
      const response = await apiClient.get(
        API_ENDPOINTS.CATEGORIES.PREFERENCES,
        {
          params: { limit },
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get AI Suggestions
  getSuggestions: async (vendor) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CATEGORIES.SUGGEST, {
        params: { vendor },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Validate Category
  validateCategory: async (categoryId) => {
    try {
      const url = API_ENDPOINTS.CATEGORIES.VALIDATE.replace(":id", categoryId);
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default categoryService;
