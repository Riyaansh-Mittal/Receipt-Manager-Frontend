import React from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { useSelector } from 'react-redux';
import { selectUserStats } from '../../../store/slices/auth.slice';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';

/**
 * Dashboard Page Component
 */
const DashboardPage = () => {
  const { user } = useAuth();
  const stats = useSelector(selectUserStats);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.first_name || 'User'}!
        </h1>
        <p className="text-gray-600">
          Here's what's happening with your receipts today.
        </p>
      </div>

      {!user?.is_email_verified && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <svg
              className="h-5 w-5 text-yellow-600 mr-3"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm text-yellow-800">
              Please verify your email address to access all features.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Monthly Uploads
            </h3>
            <Badge variant="info">{Math.max(user?.monthly_upload_count || 0, stats?.upload_count || 0)}</Badge>
          </div>
          <p className="text-gray-600 text-sm">
            Receipts uploaded this month
          </p>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Account Status
            </h3>
            <Badge variant="success">Active</Badge>
          </div>
          <p className="text-gray-600 text-sm">
            Your account is in good standing
          </p>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Quick Actions
            </h3>
          </div>
          <div className="space-y-2">
            <button className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
              Upload Receipt
            </button>
            {/* <button className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
              View Ledger
            </button> */}
          </div>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Recent Activity
          </h3>
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-gray-600">No recent activity</p>
            <p className="text-sm text-gray-500 mt-1">
              Upload your first receipt to get started
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
