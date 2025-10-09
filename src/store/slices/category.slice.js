import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import categoryService from '../../api/services/category.service';
import { REQUEST_STATUS } from '../../constants/status.constants';
import { CACHE_CONFIG } from '../../constants/api.constants';

// Initial State
const initialState = {
  categories: [],
  preferences: [],
  usageStats: null,
  suggestions: null, // Changed from array to single object
  currentCategory: null,
  listStatus: REQUEST_STATUS.IDLE,
  listError: null,
  preferencesStatus: REQUEST_STATUS.IDLE,
  preferencesError: null,
  usageStatsStatus: REQUEST_STATUS.IDLE,
  usageStatsError: null,
  suggestionsStatus: REQUEST_STATUS.IDLE,
  suggestionsError: null,
  cache: {
    lastFetch: null,
    ttl: CACHE_CONFIG.CATEGORIES_TTL,
  },
};

// Async Thunks
export const fetchCategories = createAsyncThunk(
  'categories/fetchList',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { categories } = getState();
      const now = Date.now();
      
      // Check cache validity
      if (
        categories.cache.lastFetch &&
        now - categories.cache.lastFetch < categories.cache.ttl &&
        categories.categories.length > 0
      ) {
        console.log('✅ Using cached categories');
        return { cached: true, data: categories.categories };
      }

      console.log('📥 Fetching categories from API');
      const response = await categoryService.listCategories();
      console.log('📦 Categories response:', response);
      return { ...response, cached: false, fetchTime: now };
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: { message: error.message } });
    }
  }
);

export const fetchCategoryDetails = createAsyncThunk(
  'categories/fetchDetails',
  async (categoryId, { rejectWithValue }) => {
    try {
      const response = await categoryService.getCategoryDetails(categoryId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: { message: error.message } });
    }
  }
);

export const fetchUsageStats = createAsyncThunk(
  'categories/fetchUsageStats',
  async (months = 12, { rejectWithValue }) => {
    try {
      const response = await categoryService.getUsageStats(months);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: { message: error.message } });
    }
  }
);

export const fetchPreferences = createAsyncThunk(
  'categories/fetchPreferences',
  async (limit = 10, { rejectWithValue }) => {
    try {
      console.log('📥 Fetching category preferences');
      const response = await categoryService.getPreferences(limit);
      console.log('📦 Preferences response:', response);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: { message: error.message } });
    }
  }
);

export const fetchSuggestions = createAsyncThunk(
  'categories/fetchSuggestions',
  async (vendor, { rejectWithValue }) => {
    try {
      console.log('📥 Fetching suggestions for vendor:', vendor);
      const response = await categoryService.getSuggestions(vendor);
      console.log('📦 Suggestions response:', response);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: { message: error.message } });
    }
  }
);

export const validateCategory = createAsyncThunk(
  'categories/validate',
  async (categoryId, { rejectWithValue }) => {
    try {
      const response = await categoryService.validateCategory(categoryId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: { message: error.message } });
    }
  }
);

// Category Slice
const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearSuggestions: (state) => {
      state.suggestions = null;
      state.suggestionsStatus = REQUEST_STATUS.IDLE;
      state.suggestionsError = null;
    },
    invalidateCache: (state) => {
      state.cache.lastFetch = null;
    },
    clearErrors: (state) => {
      state.listError = null;
      state.preferencesError = null;
      state.usageStatsError = null;
      state.suggestionsError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Categories
      .addCase(fetchCategories.pending, (state) => {
        state.listStatus = REQUEST_STATUS.LOADING;
        state.listError = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.listStatus = REQUEST_STATUS.SUCCEEDED;
        
        if (action.payload.cached) {
          console.log('✅ Categories loaded from cache');
          return;
        }
        
        // ✅ FIX: Handle response structure - data.categories or data directly
        const categoriesData = action.payload.data?.categories || action.payload.data || [];
        console.log('📦 Storing categories:', categoriesData);
        
        state.categories = Array.isArray(categoriesData) ? categoriesData : [];
        state.cache.lastFetch = action.payload.fetchTime;
        state.listError = null;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.listStatus = REQUEST_STATUS.FAILED;
        state.listError = action.payload;
        console.error('❌ Failed to fetch categories:', action.payload);
      })

      // Fetch Category Details
      .addCase(fetchCategoryDetails.pending, (state) => {
        state.listStatus = REQUEST_STATUS.LOADING;
      })
      .addCase(fetchCategoryDetails.fulfilled, (state, action) => {
        state.listStatus = REQUEST_STATUS.SUCCEEDED;
        state.currentCategory = action.payload.data;
      })
      .addCase(fetchCategoryDetails.rejected, (state, action) => {
        state.listStatus = REQUEST_STATUS.FAILED;
        state.listError = action.payload;
      })

      // Fetch Usage Stats
      .addCase(fetchUsageStats.pending, (state) => {
        state.usageStatsStatus = REQUEST_STATUS.LOADING;
        state.usageStatsError = null;
      })
      .addCase(fetchUsageStats.fulfilled, (state, action) => {
        state.usageStatsStatus = REQUEST_STATUS.SUCCEEDED;
        state.usageStats = action.payload.data;
        state.usageStatsError = null;
      })
      .addCase(fetchUsageStats.rejected, (state, action) => {
        state.usageStatsStatus = REQUEST_STATUS.FAILED;
        state.usageStatsError = action.payload;
      })

      // Fetch Preferences
      .addCase(fetchPreferences.pending, (state) => {
        state.preferencesStatus = REQUEST_STATUS.LOADING;
        state.preferencesError = null;
      })
      .addCase(fetchPreferences.fulfilled, (state, action) => {
        state.preferencesStatus = REQUEST_STATUS.SUCCEEDED;
        // ✅ FIX: Handle response structure
        state.preferences = action.payload.data?.preferences || [];
        state.preferencesError = null;
        console.log('📦 Stored preferences:', state.preferences);
      })
      .addCase(fetchPreferences.rejected, (state, action) => {
        state.preferencesStatus = REQUEST_STATUS.FAILED;
        state.preferencesError = action.payload;
      })

      // Fetch Suggestions
      .addCase(fetchSuggestions.pending, (state) => {
        state.suggestionsStatus = REQUEST_STATUS.LOADING;
        state.suggestionsError = null;
      })
      .addCase(fetchSuggestions.fulfilled, (state, action) => {
        state.suggestionsStatus = REQUEST_STATUS.SUCCEEDED;
        // ✅ FIX: Backend returns single suggestion object, not array
        state.suggestions = action.payload.data?.suggestions || null;
        state.suggestionsError = null;
        console.log('📦 Stored suggestion:', state.suggestions);
      })
      .addCase(fetchSuggestions.rejected, (state, action) => {
        state.suggestionsStatus = REQUEST_STATUS.FAILED;
        state.suggestionsError = action.payload;
      })

      // Validate Category
      .addCase(validateCategory.fulfilled, (state, action) => {
        // Validation result handled in component
      });
  },
});

// Actions
export const { clearSuggestions, invalidateCache, clearErrors } = categorySlice.actions;

// Selectors
export const selectCategories = (state) => state.categories.categories;
export const selectPreferences = (state) => state.categories.preferences;
export const selectUsageStats = (state) => state.categories.usageStats;
export const selectSuggestions = (state) => state.categories.suggestions;
export const selectCategoriesStatus = (state) => state.categories.listStatus;

export default categorySlice.reducer;
