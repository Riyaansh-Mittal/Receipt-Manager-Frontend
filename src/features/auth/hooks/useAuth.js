import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import {
  selectAuth,
  selectUser,
  selectIsAuthenticated,
  selectAuthStatus,
  selectAuthError,
  logout,
  clearError,
} from '../../../store/slices/auth.slice';
import { REQUEST_STATUS } from '../../../constants/status.constants';

/**
 * Custom hook for authentication operations
 * @returns {Object} Auth state and operations
 */
export const useAuth = () => {
  const dispatch = useDispatch();
  const auth = useSelector(selectAuth);
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const status = useSelector(selectAuthStatus);
  const error = useSelector(selectAuthError);

  const handleLogout = useCallback(() => {
    dispatch(logout());
  }, [dispatch]);

  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    user,
    isAuthenticated,
    isLoading: status === REQUEST_STATUS.LOADING,
    isSuccess: status === REQUEST_STATUS.SUCCEEDED,
    isError: status === REQUEST_STATUS.FAILED,
    error,
    auth,
    logout: handleLogout,
    clearError: clearAuthError,
  };
};

export default useAuth;
