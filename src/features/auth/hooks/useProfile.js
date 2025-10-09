import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useEffect } from 'react';
import {
  fetchProfile,
  updateProfile,
  updateEmail,
  resendVerification,
} from '../../../store/slices/auth.slice';
import { showNotification } from '../../../store/slices/notification.slice';
import { REQUEST_STATUS } from '../../../constants/status.constants';

/**
 * Custom hook for profile management
 * @returns {Object} Profile operations and state
 */
export const useProfile = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const profileStatus = useSelector((state) => state.auth.profileStatus);
  const profileError = useSelector((state) => state.auth.profileError);
  const emailUpdateStatus = useSelector((state) => state.auth.emailUpdateStatus);

  const loadProfile = useCallback(async () => {
    try {
      await dispatch(fetchProfile()).unwrap();
    } catch (error) {
      dispatch(
        showNotification({
          type: 'error',
          message: 'Failed to load profile.',
        })
      );
    }
  }, [dispatch]);

  const saveProfile = useCallback(
    async (profileData) => {
      try {
        await dispatch(updateProfile(profileData)).unwrap();
        dispatch(
          showNotification({
            type: 'success',
            message: 'Profile updated successfully!',
          })
        );
        return true;
      } catch (error) {
        const errorMessage =
          error?.error?.message || 'Failed to update profile.';
        dispatch(
          showNotification({
            type: 'error',
            message: errorMessage,
          })
        );
        return false;
      }
    },
    [dispatch]
  );

  const changeEmail = useCallback(
    async (newEmail) => {
      try {
        await dispatch(updateEmail(newEmail)).unwrap();
        dispatch(
          showNotification({
            type: 'success',
            message: 'Verification email sent to your new email address.',
            duration: 8000,
          })
        );
        return true;
      } catch (error) {
        const errorMessage = error?.error?.message || 'Failed to update email.';
        dispatch(
          showNotification({
            type: 'error',
            message: errorMessage,
          })
        );
        return false;
      }
    },
    [dispatch]
  );

  const resendEmailVerification = useCallback(async () => {
    try {
      await dispatch(resendVerification()).unwrap();
      dispatch(
        showNotification({
          type: 'success',
          message: 'Verification email sent!',
        })
      );
      return true;
    } catch (error) {
      const errorMessage =
        error?.error?.message || 'Failed to send verification email.';
      dispatch(
        showNotification({
          type: 'error',
          message: errorMessage,
        })
      );
      return false;
    }
  }, [dispatch]);

  return {
    user,
    loadProfile,
    saveProfile,
    changeEmail,
    resendEmailVerification,
    isLoading:
      profileStatus === REQUEST_STATUS.LOADING ||
      emailUpdateStatus === REQUEST_STATUS.LOADING,
    error: profileError,
  };
};

export default useProfile;
