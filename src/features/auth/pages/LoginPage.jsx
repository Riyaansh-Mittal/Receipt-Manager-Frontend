import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMagicLink } from '../hooks/useMagicLink';
import MagicLinkForm from '../components/MagicLinkForm';
import LoadingState from '../../../components/feedback/LoadingState';
import ErrorState from '../../../components/feedback/ErrorState';

/**
 * Login Page Component
 */
const LoginPage = () => {
  const [searchParams] = useSearchParams();
  const { loginWithMagicLink, isLoading } = useMagicLink();
  const [loginStatus, setLoginStatus] = useState('idle'); // idle, processing, error, success

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token && loginStatus === 'idle') {
      setLoginStatus('processing');
      
      loginWithMagicLink(token)
        .then((success) => {
          if (success) {
            setLoginStatus('success');
          } else {
            setLoginStatus('error');
          }
        })
        .catch(() => {
          setLoginStatus('error');
        });
    }
  }, [searchParams, loginWithMagicLink, loginStatus]);

  // Show loading only while actively processing
  if (searchParams.get('token') && loginStatus === 'processing') {
    return <LoadingState message="Signing you in..." />;
  }

  // Show error state if login failed
  if (searchParams.get('token') && loginStatus === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <ErrorState
            message="Login failed. The link may be invalid or expired. Please request a new magic link."
            onRetry={() => {
              setLoginStatus('idle');
              window.history.replaceState({}, '', '/login');
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Receipt Manager
          </h1>
          <p className="text-gray-600">
            Manage your receipts with ease
          </p>
        </div>
        
        <MagicLinkForm />

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            By signing in, you agree to our{' '}
            <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
