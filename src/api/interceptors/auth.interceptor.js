import storage from '../../utils/storage';
import { shouldRefreshToken } from '../../utils/date';
import { TOKEN_CONFIG } from '../../constants/api.constants';
import store from '../../store';
import { refreshAccessToken } from '../../store/slices/auth.slice';

let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

const onTokenRefreshed = (token) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

export const authInterceptor = async (config) => {
  // Skip auth for public endpoints
  const publicEndpoints = ['/magic-link/request/', '/magic-link/login/', '/email/verify/', '/token/refresh/'];
  const isPublicEndpoint = publicEndpoints.some((endpoint) => config.url.includes(endpoint));
  
  if (isPublicEndpoint) {
    return config;
  }

  const accessToken = storage.getAccessToken();
  const accessExpiry = storage.getAccessTokenExpiry();
  const refreshToken = storage.getRefreshToken();

  // If no access token, reject (will be caught by error interceptor)
  if (!accessToken) {
    return config;
  }

  // Check if token needs refresh
  if (
    import.meta.env.VITE_ENABLE_AUTO_REFRESH === 'true' &&
    shouldRefreshToken(accessExpiry, TOKEN_CONFIG.REFRESH_THRESHOLD) &&
    refreshToken &&
    !config.url.includes('/token/refresh/')
  ) {
    if (!isRefreshing) {
      isRefreshing = true;
      
      try {
        const resultAction = await store.dispatch(refreshAccessToken(refreshToken));
        
        if (refreshAccessToken.fulfilled.match(resultAction)) {
          const newAccessToken = resultAction.payload.tokens.access;
          onTokenRefreshed(newAccessToken);
          config.headers.Authorization = `Bearer ${newAccessToken}`;
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
      } finally {
        isRefreshing = false;
      }
    } else {
      // Wait for token refresh to complete
      return new Promise((resolve) => {
        subscribeTokenRefresh((token) => {
          config.headers.Authorization = `Bearer ${token}`;
          resolve(config);
        });
      });
    }
  } else {
    // Add token to request
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
};
