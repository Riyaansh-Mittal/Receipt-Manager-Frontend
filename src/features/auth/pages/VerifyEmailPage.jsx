import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { verifyEmail, fetchProfile } from '../../../store/slices/auth.slice';
import { showNotification } from '../../../store/slices/notification.slice';
import { ROUTES } from '../../../constants/routes.constants';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Spinner from '../../../components/ui/Spinner';

/**
 * Email Verification Page Component
 */
const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [status, setStatus] = useState('verifying');
  
  // Use ref to prevent duplicate API calls
  const hasVerified = useRef(false);

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      return;
    }

    // Prevent duplicate calls
    if (hasVerified.current) {
      return;
    }

    const verify = async () => {
      // Mark as verified before making the call
      hasVerified.current = true;

      try {
        const resultAction = await dispatch(verifyEmail(token));
        
        if (verifyEmail.fulfilled.match(resultAction)) {
          setStatus('success');
          
          // Check if backend returned new tokens
          const hasNewTokens = resultAction.payload?.tokens;
          
          if (!hasNewTokens) {
            // Fetch updated profile if no new tokens
            await dispatch(fetchProfile());
          }
          // If new tokens provided, state is already updated in reducer
          
          dispatch(
            showNotification({
              type: 'success',
              message: 'Email verified successfully!',
            })
          );
        } else {
          setStatus('error');
          const errorMessage =
            resultAction.payload?.error?.message || 
            'Failed to verify email. The link may be invalid or expired.';
          dispatch(
            showNotification({
              type: 'error',
              message: errorMessage,
            })
          );
        }
      } catch (error) {
        setStatus('error');
        const errorMessage =
          error?.error?.message || 
          'Failed to verify email. The link may be invalid or expired.';
        dispatch(
          showNotification({
            type: 'error',
            message: errorMessage,
          })
        );
      }
    };

    verify();
  }, [dispatch, searchParams]);

  const handleContinue = () => {
    // Always go to dashboard, user should be logged in with new tokens
    navigate(ROUTES.DASHBOARD);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        {status === 'verifying' && (
          <>
            <Spinner size="lg" className="mx-auto text-blue-600 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Verifying Your Email
            </h2>
            <p className="text-gray-600">
              Please wait while we verify your email address...
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <svg
              className="mx-auto h-16 w-16 text-green-500 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Email Verified!
            </h2>
            <p className="text-gray-600 mb-6">
              Your email address has been successfully verified. You can now access all features.
            </p>
            <Button onClick={handleContinue} fullWidth>
              Continue to Dashboard
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            <svg
              className="mx-auto h-16 w-16 text-red-500 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Verification Failed
            </h2>
            <p className="text-gray-600 mb-6">
              We couldn't verify your email. The link may be invalid or expired.
            </p>
            <Button onClick={handleContinue} variant="outline" fullWidth>
              Go to Dashboard
            </Button>
          </>
        )}
      </Card>
    </div>
  );
};

export default VerifyEmailPage;
