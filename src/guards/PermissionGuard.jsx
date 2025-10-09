import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import { ROUTES } from '../constants/routes.constants';
import { ACCOUNT_STATUS } from '../constants/status.constants';

/**
 * Permission-based route guard
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {boolean} props.requireEmailVerified - Require email verification
 * @param {string[]} props.allowedStatuses - Allowed account statuses
 * @returns {React.ReactElement}
 */
const PermissionGuard = ({
  children,
  requireEmailVerified = false,
  allowedStatuses = [ACCOUNT_STATUS.ACTIVE],
}) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // Check email verification
  if (requireEmailVerified && !user?.is_email_verified) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Email Verification Required
          </h2>
          <p className="text-gray-600">
            Please verify your email address to access this page.
          </p>
        </div>
      </div>
    );
  }

  // Check account status
  if (user?.account_status && !allowedStatuses.includes(user.account_status)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600">
            Your account status does not allow access to this page.
          </p>
        </div>
      </div>
    );
  }

  return children;
};

export default PermissionGuard;
