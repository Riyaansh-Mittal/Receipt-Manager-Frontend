import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { updateEmail, resendVerification, selectUser, selectPendingEmail, logout } from '../../../store/slices/auth.slice';
import { showNotification } from '../../../store/slices/notification.slice';
import { validateEmail } from '../../../utils/validators';
import { REQUEST_STATUS } from '../../../constants/status.constants';
import { ROUTES } from '../../../constants/routes.constants';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';

/**
 * Email Update and Verification Component
 */
const EmailVerification = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const pendingEmail = useSelector(selectPendingEmail);
  const emailUpdateStatus = useSelector((state) => state.auth.emailUpdateStatus);
  const isLoading = emailUpdateStatus === REQUEST_STATUS.LOADING;
  
  const [newEmail, setNewEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  const handleEmailUpdate = async (e) => {
    e.preventDefault();

    // Validate email
    const error = validateEmail(newEmail);
    if (error) {
      setEmailError(error);
      return;
    }

    if (newEmail === user?.email) {
      setEmailError('This is your current email address');
      return;
    }

    setEmailError('');
    
    try {
      const resultAction = await dispatch(updateEmail(newEmail));
      
      if (updateEmail.fulfilled.match(resultAction)) {
        setNewEmail('');
        const responseData = resultAction.payload?.data;
        
        // Check if backend requires re-login
        if (responseData?.requires_relogin) {
          dispatch(
            showNotification({
              type: 'warning',
              message: `Email update initiated. For security, you'll be logged out. Check ${responseData.pending_email} for verification link.`,
              duration: 10000,
            })
          );
          
          // Wait 3 seconds, then logout
          setTimeout(() => {
            dispatch(logout());
            navigate(ROUTES.LOGIN);
          }, 3000);
        } else {
          dispatch(
            showNotification({
              type: 'success',
              message: 'Verification email sent. Please check your inbox.',
              duration: 8000,
            })
          );
        }
      } else {
        const errorMessage = resultAction.payload?.error?.message || 'Failed to update email.';
        dispatch(
          showNotification({
            type: 'error',
            message: errorMessage,
          })
        );
      }
    } catch (error) {
      dispatch(
        showNotification({
          type: 'error',
          message: 'An unexpected error occurred.',
        })
      );
    }
  };

  const handleResendVerification = async () => {
    try {
      const resultAction = await dispatch(resendVerification());
      
      if (resendVerification.fulfilled.match(resultAction)) {
        dispatch(
          showNotification({
            type: 'success',
            message: 'Verification email sent! Check your inbox.',
          })
        );
      } else {
        const errorMessage =
          resultAction.payload?.error?.message || 'Failed to send verification email.';
        dispatch(
          showNotification({
            type: 'error',
            message: errorMessage,
          })
        );
      }
    } catch (error) {
      dispatch(
        showNotification({
          type: 'error',
          message: 'An unexpected error occurred.',
        })
      );
    }
  };

  return (
    <Card>
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Email Management
        </h3>
        <p className="text-gray-600 text-sm">
          Update or verify your email address
        </p>
      </div>

      {/* Pending Email Change Banner */}
      {pendingEmail && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start">
            <svg
              className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-blue-800 mb-1">
                Email Change Pending
              </h4>
              <p className="text-sm text-blue-700">
                Verification email sent to <strong>{pendingEmail}</strong>. 
                Please check your inbox and verify to complete the change.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Unverified Email Banner */}
      {!user?.is_email_verified && !pendingEmail && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start">
            <svg
              className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-yellow-800 mb-1">
                Email Not Verified
              </h4>
              <p className="text-sm text-yellow-700 mb-3">
                Please verify your email address to access all features.
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={handleResendVerification}
                loading={isLoading}
              >
                Resend Verification Email
              </Button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleEmailUpdate} className="space-y-4">
        <Input
          label="New Email Address"
          type="email"
          placeholder="newemail@example.com"
          value={newEmail}
          onChange={(e) => {
            setNewEmail(e.target.value);
            if (emailError) setEmailError('');
          }}
          error={emailError}
          helperText="You'll be logged out after submission for security. Verify the new email to login."
          disabled={!!pendingEmail}
        />

        <Button
          type="submit"
          loading={isLoading}
          disabled={!newEmail || isLoading || !!pendingEmail}
        >
          Update Email
        </Button>
      </form>

      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          <span className="font-medium">Current email:</span>{' '}
          <span className="text-gray-900">{user?.email}</span>
        </p>
        {user?.is_email_verified && (
          <div className="flex items-center mt-2">
            <Badge variant="success">Verified</Badge>
          </div>
        )}
      </div>
    </Card>
  );
};

export default EmailVerification;
