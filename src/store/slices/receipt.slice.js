import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import receiptService from '../../api/services/receipt.service';
import { REQUEST_STATUS } from '../../constants/status.constants';
import { RECEIPT_STATUS, STATUS_MAP } from '../../constants/receipt.constants';
import { parseApiError, RECEIPT_ERROR_CODES } from '../../constants/error.constants';

// Initial State
const initialState = {
  receipts: [],
  currentReceipt: null,
  extractedData: null,
  uploadProgress: 0,
  uploadStatus: REQUEST_STATUS.IDLE,
  uploadError: null,
  listStatus: REQUEST_STATUS.IDLE,
  listError: null,
  detailStatus: REQUEST_STATUS.IDLE,
  detailError: null,
  confirmStatus: REQUEST_STATUS.IDLE,
  confirmError: null,
  pollingStatus: REQUEST_STATUS.IDLE,
  pagination: {
    count: 0,
    currentPage: 1,
    totalPages: 0,
    pageSize: 20,
    hasNext: false,
    hasPrevious: false,
  },
  filters: {
    status: null,
    ordering: '-created_at',
  },
  cache: {
    lastFetch: null,
    ttl: 300000, // 5 minutes
  },
};

// Async Thunks
export const uploadReceipt = createAsyncThunk(
  'receipts/upload',
  async ({ file, onProgress }, { rejectWithValue }) => {
    try {
      const response = await receiptService.uploadReceipt(file, (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        if (onProgress) onProgress(percentCompleted);
      });
      return response;
    } catch (error) {
      const parsedError = parseApiError(error.response?.data);
      return rejectWithValue(parsedError);
    }
  }
);

export const pollUploadStatus = createAsyncThunk(
  'receipts/pollStatus',
  async (receiptId, { rejectWithValue }) => {
    try {
      const response = await receiptService.getUploadStatus(receiptId);
      return response;
    } catch (error) {
      const parsedError = parseApiError(error.response?.data);
      return rejectWithValue(parsedError);
    }
  }
);

export const fetchExtractedData = createAsyncThunk(
  'receipts/fetchExtractedData',
  async (receiptId, { rejectWithValue }) => {
    try {
      const response = await receiptService.getExtractedData(receiptId);
      return response;
    } catch (error) {
      const parsedError = parseApiError(error.response?.data);
      return rejectWithValue(parsedError);
    }
  }
);

export const fetchReceiptDetails = createAsyncThunk(
  'receipts/fetchDetails',
  async (receiptId, { rejectWithValue }) => {
    try {
      const response = await receiptService.getReceiptDetails(receiptId);
      return response;
    } catch (error) {
      const parsedError = parseApiError(error.response?.data);
      return rejectWithValue(parsedError);
    }
  }
);

export const confirmReceipt = createAsyncThunk(
  'receipts/confirm',
  async ({ receiptId, confirmationData }, { rejectWithValue }) => {
    try {
      const response = await receiptService.confirmReceipt(receiptId, confirmationData);
      return response;
    } catch (error) {
      const parsedError = parseApiError(error.response?.data);
      return rejectWithValue(parsedError);
    }
  }
);

export const fetchReceipts = createAsyncThunk(
  'receipts/fetchList',
  async (params = {}, { rejectWithValue, getState }) => {
    try {
      const { receipts } = getState();
      const now = Date.now();
      
      // Check cache validity
      if (
        receipts.cache.lastFetch &&
        now - receipts.cache.lastFetch < receipts.cache.ttl &&
        !params.forceRefresh
      ) {
        return { cached: true, data: receipts.receipts };
      }

      const response = await receiptService.listReceipts(params);
      return { ...response, cached: false, fetchTime: now };
    } catch (error) {
      const parsedError = parseApiError(error.response?.data);
      return rejectWithValue(parsedError);
    }
  }
);

// Helper function to normalize receipt data
const normalizeReceiptData = (receipt) => {
  if (!receipt) return null;
  
  return {
    ...receipt,
    status: STATUS_MAP[receipt.status?.toLowerCase()] || receipt.status,
  };
};

// Receipt Slice
const receiptSlice = createSlice({
  name: 'receipts',
  initialState,
  reducers: {
    setUploadProgress: (state, action) => {
      state.uploadProgress = action.payload;
    },
    resetUploadState: (state) => {
      state.uploadProgress = 0;
      state.uploadStatus = REQUEST_STATUS.IDLE;
      state.uploadError = null;
      state.currentReceipt = null;
      state.extractedData = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.cache.lastFetch = null; // Invalidate cache
    },
    clearCurrentReceipt: (state) => {
      state.currentReceipt = null;
      state.extractedData = null;
      state.detailStatus = REQUEST_STATUS.IDLE;
      state.detailError = null;
    },
    invalidateCache: (state) => {
      state.cache.lastFetch = null;
    },
    clearErrors: (state) => {
      state.uploadError = null;
      state.listError = null;
      state.detailError = null;
      state.confirmError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Upload Receipt
      .addCase(uploadReceipt.pending, (state) => {
        state.uploadStatus = REQUEST_STATUS.LOADING;
        state.uploadError = null;
      })
      .addCase(uploadReceipt.fulfilled, (state, action) => {
        state.uploadStatus = REQUEST_STATUS.SUCCEEDED;
        state.currentReceipt = normalizeReceiptData(action.payload.data);
        state.uploadProgress = 100;
        state.uploadError = null;
      })
      .addCase(uploadReceipt.rejected, (state, action) => {
        state.uploadStatus = REQUEST_STATUS.FAILED;
        state.uploadError = action.payload;
        state.uploadProgress = 0;
        
        // Don't show notification here - let the component handle it
        // This allows for special handling of duplicate receipts
      })

      // Poll Upload Status
      .addCase(pollUploadStatus.pending, (state) => {
        state.pollingStatus = REQUEST_STATUS.LOADING;
      })
      .addCase(pollUploadStatus.fulfilled, (state, action) => {
        state.pollingStatus = REQUEST_STATUS.SUCCEEDED;
        
        if (action.payload.data) {
          const normalizedData = normalizeReceiptData(action.payload.data);
          
          if (state.currentReceipt) {
            state.currentReceipt = {
              ...state.currentReceipt,
              status: normalizedData.status,
              progress_percentage: normalizedData.progress_percentage,
              current_stage: normalizedData.current_stage,
            };
          } else {
            state.currentReceipt = normalizedData;
          }
        }
      })
      .addCase(pollUploadStatus.rejected, (state, action) => {
        state.pollingStatus = REQUEST_STATUS.FAILED;
        // Don't clear currentReceipt on polling error - may be temporary
      })

      // Fetch Extracted Data
      .addCase(fetchExtractedData.pending, (state) => {
        state.detailStatus = REQUEST_STATUS.LOADING;
        state.detailError = null;
      })
      .addCase(fetchExtractedData.fulfilled, (state, action) => {
        state.detailStatus = REQUEST_STATUS.SUCCEEDED;
        state.extractedData = action.payload.data;
        state.detailError = null;
      })
      .addCase(fetchExtractedData.rejected, (state, action) => {
        state.detailStatus = REQUEST_STATUS.FAILED;
        state.detailError = action.payload;
      })

      // Fetch Receipt Details
      .addCase(fetchReceiptDetails.pending, (state) => {
        state.detailStatus = REQUEST_STATUS.LOADING;
        state.detailError = null;
      })
      .addCase(fetchReceiptDetails.fulfilled, (state, action) => {
        state.detailStatus = REQUEST_STATUS.SUCCEEDED;
        state.currentReceipt = normalizeReceiptData(action.payload.data);
        state.detailError = null;
      })
      .addCase(fetchReceiptDetails.rejected, (state, action) => {
        state.detailStatus = REQUEST_STATUS.FAILED;
        state.detailError = action.payload;
      })

      // Confirm Receipt
      .addCase(confirmReceipt.pending, (state) => {
        state.confirmStatus = REQUEST_STATUS.LOADING;
        state.confirmError = null;
      })
      .addCase(confirmReceipt.fulfilled, (state, action) => {
        state.confirmStatus = REQUEST_STATUS.SUCCEEDED;
        state.confirmError = null;
        
        // Update current receipt status
        if (state.currentReceipt) {
          state.currentReceipt.status = RECEIPT_STATUS.CONFIRMED;
        }
        
        // Update in receipts list
        const index = state.receipts.findIndex(
          (r) => r.id === state.currentReceipt?.id
        );
        if (index !== -1) {
          state.receipts[index] = {
            ...state.receipts[index],
            status: RECEIPT_STATUS.CONFIRMED,
          };
        }
        
        // Invalidate cache
        state.cache.lastFetch = null;
      })
      .addCase(confirmReceipt.rejected, (state, action) => {
        state.confirmStatus = REQUEST_STATUS.FAILED;
        state.confirmError = action.payload;
      })

      // Fetch Receipts List
      .addCase(fetchReceipts.pending, (state) => {
        state.listStatus = REQUEST_STATUS.LOADING;
        state.listError = null;
      })
      .addCase(fetchReceipts.fulfilled, (state, action) => {
        state.listStatus = REQUEST_STATUS.SUCCEEDED;
        
        if (action.payload.cached) {
          return; // Don't update if using cached data
        }
        
        // Normalize all receipt statuses
        const normalizedReceipts = (action.payload.data || []).map(normalizeReceiptData);
        
        state.receipts = normalizedReceipts;
        state.pagination = action.payload.pagination || initialState.pagination;
        state.filters = action.payload.filters || state.filters;
        state.cache.lastFetch = action.payload.fetchTime;
        state.listError = null;
      })
      .addCase(fetchReceipts.rejected, (state, action) => {
        state.listStatus = REQUEST_STATUS.FAILED;
        state.listError = action.payload;
      });
  },
});

// Actions
export const {
  setUploadProgress,
  resetUploadState,
  setFilters,
  clearCurrentReceipt,
  invalidateCache,
  clearErrors,
} = receiptSlice.actions;

// Selectors
export const selectReceipts = (state) => state.receipts.receipts;
export const selectCurrentReceipt = (state) => state.receipts.currentReceipt;
export const selectExtractedData = (state) => state.receipts.extractedData;
export const selectUploadProgress = (state) => state.receipts.uploadProgress;
export const selectUploadStatus = (state) => state.receipts.uploadStatus;
export const selectUploadError = (state) => state.receipts.uploadError;
export const selectReceiptsPagination = (state) => state.receipts.pagination;
export const selectReceiptsFilters = (state) => state.receipts.filters;
export const selectListStatus = (state) => state.receipts.listStatus;

export default receiptSlice.reducer;
