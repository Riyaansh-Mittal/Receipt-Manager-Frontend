import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import quotaService from '../../api/services/quota.service';
import { REQUEST_STATUS } from '../../constants/status.constants';
import { CACHE_CONFIG } from '../../constants/api.constants';

// Initial State
const initialState = {
  quotaStatus: null,
  uploadHistory: null,
  quotaStatusFetchStatus: REQUEST_STATUS.IDLE,
  quotaStatusError: null,
  uploadHistoryStatus: REQUEST_STATUS.IDLE,
  uploadHistoryError: null,
  cache: {
    lastFetch: null,
    ttl: CACHE_CONFIG.QUOTA_TTL,
  },
};

// Async Thunks
export const fetchQuotaStatus = createAsyncThunk(
  'quota/fetchStatus',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { quota } = getState();
      const now = Date.now();
      
      // Check cache validity
      if (
        quota.cache.lastFetch &&
        now - quota.cache.lastFetch < quota.cache.ttl &&
        quota.quotaStatus
      ) {
        return { cached: true, data: quota.quotaStatus };
      }

      const response = await quotaService.getQuotaStatus();
      return { ...response, cached: false, fetchTime: now };
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: { message: error.message } });
    }
  }
);

export const fetchUploadHistory = createAsyncThunk(
  'quota/fetchHistory',
  async (months = 6, { rejectWithValue }) => {
    try {
      const response = await quotaService.getUploadHistory(months);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: { message: error.message } });
    }
  }
);

// Quota Slice
const quotaSlice = createSlice({
  name: 'quota',
  initialState,
  reducers: {
    invalidateCache: (state) => {
      state.cache.lastFetch = null;
    },
    clearErrors: (state) => {
      state.quotaStatusError = null;
      state.uploadHistoryError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Quota Status
      .addCase(fetchQuotaStatus.pending, (state) => {
        state.quotaStatusFetchStatus = REQUEST_STATUS.LOADING;
        state.quotaStatusError = null;
      })
      .addCase(fetchQuotaStatus.fulfilled, (state, action) => {
        state.quotaStatusFetchStatus = REQUEST_STATUS.SUCCEEDED;
        
        if (action.payload.cached) {
          return;
        }
        
        state.quotaStatus = action.payload.data;
        state.cache.lastFetch = action.payload.fetchTime;
        state.quotaStatusError = null;
      })
      .addCase(fetchQuotaStatus.rejected, (state, action) => {
        state.quotaStatusFetchStatus = REQUEST_STATUS.FAILED;
        state.quotaStatusError = action.payload;
      })

      // Fetch Upload History
      .addCase(fetchUploadHistory.pending, (state) => {
        state.uploadHistoryStatus = REQUEST_STATUS.LOADING;
        state.uploadHistoryError = null;
      })
      .addCase(fetchUploadHistory.fulfilled, (state, action) => {
        state.uploadHistoryStatus = REQUEST_STATUS.SUCCEEDED;
        state.uploadHistory = action.payload.data;
        state.uploadHistoryError = null;
      })
      .addCase(fetchUploadHistory.rejected, (state, action) => {
        state.uploadHistoryStatus = REQUEST_STATUS.FAILED;
        state.uploadHistoryError = action.payload;
      });
  },
});

// Actions
export const { invalidateCache, clearErrors } = quotaSlice.actions;

// Selectors
export const selectQuotaStatus = (state) => state.quota.quotaStatus;
export const selectUploadHistory = (state) => state.quota.uploadHistory;
export const selectQuotaFetchStatus = (state) => state.quota.quotaStatusFetchStatus;

export default quotaSlice.reducer;
