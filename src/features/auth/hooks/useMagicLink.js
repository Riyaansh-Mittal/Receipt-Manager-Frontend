import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  requestMagicLink,
  magicLinkLogin,
  clearError,
} from '../../../store/slices/auth.slice';
import { showNotification } from '../../../store/slices/notification.slice';
import { ROUTES } from '../../../constants/routes.constants';
import { REQUEST_STATUS } from '../../../constants/status.constants';

export const useMagicLink = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [emailSent, setEmailSent] = useState(false);

  const magicLinkStatus = useSelector((state) => state.auth.magicLinkStatus);
  const magicLinkError = useSelector((state) => state.auth.magicLinkError);

  const sendMagicLink = useCallback(
    async (email) => {
      try {
        // Clear any previous errors
        dispatch(clearError());
        
        const resultAction = await dispatch(requestMagicLink(email));

        if (requestMagicLink.fulfilled.match(resultAction)) {
          setEmailSent(true);
          dispatch(
            showNotification({
              type: 'success',
              message: 'Magic link sent! Check your email to continue.',
              duration: 8000,
            })
          );
          return true;
        } else {
          const errorMessage =
            resultAction.payload?.error?.message ||
            'Failed to send magic link. Please try again.';
          dispatch(
            showNotification({
              type: 'error',
              message: errorMessage,
            })
          );
          return false;
        }
      } catch (error) {
        dispatch(
          showNotification({
            type: 'error',
            message: 'An unexpected error occurred. Please try again.',
          })
        );
        return false;
      }
    },
    [dispatch]
  );

  const loginWithMagicLink = useCallback(
    async (token) => {
      try {
        // Clear any previous errors
        dispatch(clearError());
        
        const resultAction = await dispatch(magicLinkLogin(token));

        if (magicLinkLogin.fulfilled.match(resultAction)) {
          const isNewUser = resultAction.payload.data.is_new_user;
          const message = isNewUser
            ? 'Welcome! Your account has been created successfully.'
            : 'Login successful! Welcome back.';

          dispatch(
            showNotification({
              type: 'success',
              message,
            })
          );

          navigate(ROUTES.DASHBOARD);
          return true;
        } else {
          const errorMessage =
            resultAction.payload?.error?.message ||
            'Login failed. The link may be invalid or expired.';
          dispatch(
            showNotification({
              type: 'error',
              message: errorMessage,
            })
          );
          return false;
        }
      } catch (error) {
        dispatch(
          showNotification({
            type: 'error',
            message: 'An unexpected error occurred during login.',
          })
        );
        return false;
      }
    },
    [dispatch, navigate]
  );

  return {
    sendMagicLink,
    loginWithMagicLink,
    emailSent,
    isLoading: magicLinkStatus === REQUEST_STATUS.LOADING,
    error: magicLinkError,
  };
};

export default useMagicLink;
