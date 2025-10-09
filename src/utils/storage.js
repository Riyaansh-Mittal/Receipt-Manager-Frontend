import { TOKEN_CONFIG } from '../constants/api.constants';

const storage = {
  // Token Management
  setAccessToken: (token) => {
    if (token) {
      sessionStorage.setItem(TOKEN_CONFIG.ACCESS_TOKEN_KEY, token);
    }
  },

  getAccessToken: () => {
    return sessionStorage.getItem(TOKEN_CONFIG.ACCESS_TOKEN_KEY);
  },

  setRefreshToken: (token) => {
    if (token) {
      localStorage.setItem(TOKEN_CONFIG.REFRESH_TOKEN_KEY, token);
    }
  },

  getRefreshToken: () => {
    return localStorage.getItem(TOKEN_CONFIG.REFRESH_TOKEN_KEY);
  },

  setTokens: (accessToken, refreshToken) => {
    storage.setAccessToken(accessToken);
    storage.setRefreshToken(refreshToken);
  },

  clearTokens: () => {
    sessionStorage.removeItem(TOKEN_CONFIG.ACCESS_TOKEN_KEY);
    localStorage.removeItem(TOKEN_CONFIG.REFRESH_TOKEN_KEY);
  },

  // Token Expiry Management
  setTokenExpiry: (accessExpiresAt, refreshExpiresAt) => {
    if (accessExpiresAt) {
      sessionStorage.setItem('access_expires_at', accessExpiresAt);
    }
    if (refreshExpiresAt) {
      localStorage.setItem('refresh_expires_at', refreshExpiresAt);
    }
  },

  getAccessTokenExpiry: () => {
    return sessionStorage.getItem('access_expires_at');
  },

  getRefreshTokenExpiry: () => {
    return localStorage.getItem('refresh_expires_at');
  },

  clearTokenExpiry: () => {
    sessionStorage.removeItem('access_expires_at');
    localStorage.removeItem('refresh_expires_at');
  },

  // User Data
  setUser: (user) => {
    if (user) {
      sessionStorage.setItem('user', JSON.stringify(user));
    }
  },

  getUser: () => {
    const user = sessionStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  clearUser: () => {
    sessionStorage.removeItem('user');
  },

  // Clear All Auth Data
  clearAll: () => {
    storage.clearTokens();
    storage.clearTokenExpiry();
    storage.clearUser();
  },

  // Generic Storage Methods
  set: (key, value) => {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },

  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue;
    }
  },

  remove: (key) => {
    localStorage.removeItem(key);
  },
};

export default storage;
