import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../api/services/auth.service';
import storage from '../../utils/storage';
import { REQUEST_STATUS } from '../../constants/status.constants';
import { tabSyncManager, TabSyncEvents } from '../../utils/tabSync';

// Initial State
const initialState = {
  user: storage.getUser(),
  isAuthenticated: !!storage.getAccessToken(),
  accessToken: storage.getAccessToken(),
  refreshToken: storage.getRefreshToken(),
  tokenExpiry: {
    access: storage.getAccessTokenExpiry(),
    refresh: storage.getRefreshTokenExpiry(),
  },
  status: REQUEST_STATUS.IDLE,
  error: null,
  magicLinkStatus: REQUEST_STATUS.IDLE,
  magicLinkError: null,
  profileStatus: REQUEST_STATUS.IDLE,
  profileError: null,
  emailUpdateStatus: REQUEST_STATUS.IDLE,
  emailUpdateError: null,
  pendingEmail: null, // Track pending email change
  stats: null,
  statsStatus: REQUEST_STATUS.IDLE,
};

// Async Thunks with proper error handling
export const requestMagicLink = createAsyncThunk(
  'auth/requestMagicLink',
  async (email, { rejectWithValue }) => {
    try {
      const response = await authService.requestMagicLink(email);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: { message: error.message } });
    }
  }
);

export const magicLinkLogin = createAsyncThunk(
  'auth/magicLinkLogin',
  async (token, { rejectWithValue }) => {
    try {
      const response = await authService.magicLinkLogin(token);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: { message: error.message } });
    }
  }
);

export const refreshAccessToken = createAsyncThunk(
  'auth/refreshAccessToken',
  async (refreshToken, { rejectWithValue }) => {
    try {
      const response = await authService.refreshToken(refreshToken);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: { message: error.message } });
    }
  }
);

export const fetchProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getProfile();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: { message: error.message } });
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await authService.updateProfile(profileData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: { message: error.message } });
    }
  }
);

export const updateEmail = createAsyncThunk(
  'auth/updateEmail',
  async (newEmail, { rejectWithValue }) => {
    try {
      const response = await authService.updateEmail(newEmail);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: { message: error.message } });
    }
  }
);

export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async (token, { rejectWithValue }) => {
    try {
      const response = await authService.verifyEmail(token);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: { message: error.message } });
    }
  }
);

export const resendVerification = createAsyncThunk(
  'auth/resendVerification',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.resendVerification();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: { message: error.message } });
    }
  }
);

export const fetchUserStats = createAsyncThunk(
  'auth/fetchUserStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getUserStats();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: { message: error.message } });
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { getState }) => {
    try {
      const { auth } = getState();
      const response = await authService.logout(auth.refreshToken);
      return response;
    } catch (error) {
      // Always return success for logout
      return { graceful: true };
    }
  }
);

// Auth Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      storage.clearAll();
      state.user = null;
      state.isAuthenticated = false;
      state.accessToken = null;
      state.refreshToken = null;
      state.tokenExpiry = { access: null, refresh: null };
      state.status = REQUEST_STATUS.IDLE;
      state.error = null;
      state.stats = null;
      state.pendingEmail = null;
      
      // Broadcast logout to other tabs
      tabSyncManager.broadcast(TabSyncEvents.LOGOUT);
    },
    clearError: (state) => {
      state.error = null;
      state.magicLinkError = null;
      state.profileError = null;
      state.emailUpdateError = null;
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      storage.setUser(state.user);
      
      // Broadcast profile update to other tabs
      tabSyncManager.broadcast(TabSyncEvents.PROFILE_UPDATED, action.payload);
    },
    syncFromOtherTab: (state, action) => {
      const { type, payload } = action.payload;
      
      switch (type) {
        case TabSyncEvents.LOGOUT:
          storage.clearAll();
          state.user = null;
          state.isAuthenticated = false;
          state.accessToken = null;
          state.refreshToken = null;
          state.tokenExpiry = { access: null, refresh: null };
          state.pendingEmail = null;
          break;
          
        case TabSyncEvents.LOGIN:
          state.user = payload.user;
          state.accessToken = payload.accessToken;
          state.refreshToken = payload.refreshToken;
          state.isAuthenticated = true;
          storage.setTokens(payload.accessToken, payload.refreshToken);
          storage.setUser(payload.user);
          break;
          
        case TabSyncEvents.PROFILE_UPDATED:
        case TabSyncEvents.EMAIL_UPDATED:
          if (state.user) {
            state.user = { ...state.user, ...payload };
            storage.setUser(state.user);
          }
          break;
          
        case TabSyncEvents.TOKEN_REFRESHED:
          state.accessToken = payload.accessToken;
          state.refreshToken = payload.refreshToken;
          state.tokenExpiry = payload.tokenExpiry;
          storage.setTokens(payload.accessToken, payload.refreshToken);
          break;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Request Magic Link
      .addCase(requestMagicLink.pending, (state) => {
        state.magicLinkStatus = REQUEST_STATUS.LOADING;
        state.magicLinkError = null;
      })
      .addCase(requestMagicLink.fulfilled, (state) => {
        state.magicLinkStatus = REQUEST_STATUS.SUCCEEDED;
        state.magicLinkError = null;
      })
      .addCase(requestMagicLink.rejected, (state, action) => {
        state.magicLinkStatus = REQUEST_STATUS.FAILED;
        state.magicLinkError = action.payload;
      })

      // Magic Link Login
      .addCase(magicLinkLogin.pending, (state) => {
        state.status = REQUEST_STATUS.LOADING;
        state.error = null;
      })
      .addCase(magicLinkLogin.fulfilled, (state, action) => {
        const { user, tokens } = action.payload.data;
        
        state.status = REQUEST_STATUS.SUCCEEDED;
        state.isAuthenticated = true;
        state.user = user;
        state.accessToken = tokens.access;
        state.refreshToken = tokens.refresh;
        state.tokenExpiry = {
          access: tokens.access_expires_at,
          refresh: tokens.refresh_expires_at,
        };
        state.error = null;

        storage.setTokens(tokens.access, tokens.refresh);
        storage.setTokenExpiry(tokens.access_expires_at, tokens.refresh_expires_at);
        storage.setUser(user);
        
        tabSyncManager.broadcast(TabSyncEvents.LOGIN, {
          user,
          accessToken: tokens.access,
          refreshToken: tokens.refresh,
        });
      })
      .addCase(magicLinkLogin.rejected, (state, action) => {
        state.status = REQUEST_STATUS.FAILED;
        state.error = action.payload;
        state.isAuthenticated = false;
      })

      // Refresh Token
      .addCase(refreshAccessToken.pending, (state) => {
        state.status = REQUEST_STATUS.LOADING;
      })
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        const { tokens } = action.payload.data;
        
        state.status = REQUEST_STATUS.SUCCEEDED;
        state.accessToken = tokens.access;
        state.refreshToken = tokens.refresh;
        state.tokenExpiry = {
          access: tokens.access_expires_at,
          refresh: tokens.refresh_expires_at,
        };

        storage.setTokens(tokens.access, tokens.refresh);
        storage.setTokenExpiry(tokens.access_expires_at, tokens.refresh_expires_at);
        
        tabSyncManager.broadcast(TabSyncEvents.TOKEN_REFRESHED, {
          accessToken: tokens.access,
          refreshToken: tokens.refresh,
          tokenExpiry: state.tokenExpiry,
        });
      })
      .addCase(refreshAccessToken.rejected, (state, action) => {
        state.status = REQUEST_STATUS.FAILED;
        state.error = action.payload;
        state.isAuthenticated = false;
        storage.clearAll();
      })

      // Fetch Profile
      .addCase(fetchProfile.pending, (state) => {
        state.profileStatus = REQUEST_STATUS.LOADING;
        state.profileError = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.profileStatus = REQUEST_STATUS.SUCCEEDED;
        state.user = { ...state.user, ...action.payload.data };
        state.profileError = null;
        storage.setUser(state.user);
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.profileStatus = REQUEST_STATUS.FAILED;
        state.profileError = action.payload;
      })

      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.profileStatus = REQUEST_STATUS.LOADING;
        state.profileError = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.profileStatus = REQUEST_STATUS.SUCCEEDED;
        state.user = { ...state.user, ...action.payload.data };
        state.profileError = null;
        storage.setUser(state.user);
        
        tabSyncManager.broadcast(TabSyncEvents.PROFILE_UPDATED, action.payload.data);
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.profileStatus = REQUEST_STATUS.FAILED;
        state.profileError = action.payload;
      })

      // Update Email
      .addCase(updateEmail.pending, (state) => {
        state.emailUpdateStatus = REQUEST_STATUS.LOADING;
        state.emailUpdateError = null;
      })
      .addCase(updateEmail.fulfilled, (state, action) => {
        state.emailUpdateStatus = REQUEST_STATUS.SUCCEEDED;
        state.emailUpdateError = null;
        
        // Store pending email from backend response
        if (action.payload?.data?.pending_email) {
          state.pendingEmail = action.payload.data.pending_email;
        }
      })
      .addCase(updateEmail.rejected, (state, action) => {
        state.emailUpdateStatus = REQUEST_STATUS.FAILED;
        state.emailUpdateError = action.payload;
      })

      // Verify Email
      .addCase(verifyEmail.pending, (state) => {
        state.profileStatus = REQUEST_STATUS.LOADING;
      })
      .addCase(verifyEmail.fulfilled, (state, action) => {
        state.profileStatus = REQUEST_STATUS.SUCCEEDED;
        
        const responseData = action.payload?.data || action.payload;
        
        if (state.user && responseData) {
          state.user.is_email_verified = true;
          
          // Update email if it was changed
          if (responseData.email) {
            state.user.email = responseData.email;
          }
          
          // Handle new tokens from backend
          if (responseData.tokens) {
            const { tokens } = responseData;
            state.accessToken = tokens.access;
            state.refreshToken = tokens.refresh;
            state.tokenExpiry = {
              access: tokens.expires_at,
              refresh: tokens.refresh_expires_at,
            };
            storage.setTokens(tokens.access, tokens.refresh);
            storage.setTokenExpiry(tokens.expires_at, tokens.refresh_expires_at);
            
            // Clear pending email
            state.pendingEmail = null;
            
            // Broadcast token update
            tabSyncManager.broadcast(TabSyncEvents.TOKEN_REFRESHED, {
              accessToken: tokens.access,
              refreshToken: tokens.refresh,
              tokenExpiry: state.tokenExpiry,
            });
          }
          
          storage.setUser(state.user);
          
          tabSyncManager.broadcast(TabSyncEvents.EMAIL_UPDATED, {
            email: state.user.email,
            is_email_verified: true,
          });
        }
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.profileStatus = REQUEST_STATUS.FAILED;
        console.error('Email verification failed:', action.payload);
      })

      // Resend Verification
      .addCase(resendVerification.pending, (state) => {
        state.emailUpdateStatus = REQUEST_STATUS.LOADING;
      })
      .addCase(resendVerification.fulfilled, (state) => {
        state.emailUpdateStatus = REQUEST_STATUS.SUCCEEDED;
      })
      .addCase(resendVerification.rejected, (state, action) => {
        state.emailUpdateStatus = REQUEST_STATUS.FAILED;
        state.emailUpdateError = action.payload;
      })

      // Fetch User Stats
      .addCase(fetchUserStats.pending, (state) => {
        state.statsStatus = REQUEST_STATUS.LOADING;
      })
      .addCase(fetchUserStats.fulfilled, (state, action) => {
        state.statsStatus = REQUEST_STATUS.SUCCEEDED;
        state.stats = action.payload.data;
      })
      .addCase(fetchUserStats.rejected, (state, action) => {
        state.statsStatus = REQUEST_STATUS.FAILED;
      })

      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        storage.clearAll();
        state.user = null;
        state.isAuthenticated = false;
        state.accessToken = null;
        state.refreshToken = null;
        state.tokenExpiry = { access: null, refresh: null };
        state.status = REQUEST_STATUS.IDLE;
        state.error = null;
        state.stats = null;
        state.pendingEmail = null;
        
        tabSyncManager.broadcast(TabSyncEvents.LOGOUT);
      });
  },
});

export const { logout, clearError, updateUser, syncFromOtherTab } = authSlice.actions;

// Selectors
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthStatus = (state) => state.auth.status;
export const selectAuthError = (state) => state.auth.error;
export const selectUserStats = (state) => state.auth.stats;
export const selectPendingEmail = (state) => state.auth.pendingEmail;

export default authSlice.reducer;
