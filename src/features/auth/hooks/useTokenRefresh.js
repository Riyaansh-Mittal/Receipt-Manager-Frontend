import { useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { refreshAccessToken } from '../../../store/slices/auth.slice';
import { shouldRefreshToken, getSecondsUntilExpiry } from '../../../utils/date';
import { TOKEN_CONFIG } from '../../../constants/api.constants';

/**
 * Custom hook to handle automatic token refresh
 */
export const useTokenRefresh = () => {
  const dispatch = useDispatch();
  const refreshToken = useSelector((state) => state.auth.refreshToken);
  const accessTokenExpiry = useSelector((state) => state.auth.tokenExpiry.access);
  const intervalRef = useRef(null);

  const checkAndRefreshToken = useCallback(async () => {
    if (
      import.meta.env.VITE_ENABLE_AUTO_REFRESH === 'true' &&
      refreshToken &&
      shouldRefreshToken(accessTokenExpiry, TOKEN_CONFIG.REFRESH_THRESHOLD)
    ) {
      try {
        await dispatch(refreshAccessToken(refreshToken)).unwrap();
        console.log('Token refreshed successfully');
      } catch (error) {
        console.error('Token refresh failed:', error);
      }
    }
  }, [dispatch, refreshToken, accessTokenExpiry]);

  useEffect(() => {
    if (refreshToken && accessTokenExpiry) {
      // Check immediately
      checkAndRefreshToken();

      // Set up periodic check (every minute)
      intervalRef.current = setInterval(() => {
        checkAndRefreshToken();
      }, 60000); // Check every 60 seconds

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [refreshToken, accessTokenExpiry, checkAndRefreshToken]);

  return {
    checkAndRefreshToken,
    secondsUntilExpiry: getSecondsUntilExpiry(accessTokenExpiry),
  };
};

export default useTokenRefresh;
