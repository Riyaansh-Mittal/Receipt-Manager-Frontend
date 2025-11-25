import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserStats, selectUserStats, selectUser } from '../../../store/slices/auth.slice';
import Card from '../../../components/ui/Card';
import Spinner from '../../../components/ui/Spinner';
import { formatDate } from '../../../utils/date';
import { REQUEST_STATUS } from '../../../constants/status.constants';

/**
 * User Statistics Component
 */
const UserStats = () => {
  const dispatch = useDispatch();
  const stats = useSelector(selectUserStats);
  const user = useSelector(selectUser);
  const statsStatus = useSelector((state) => state.auth.statsStatus);

  useEffect(() => {
    // Fetch stats on mount and when user changes
    dispatch(fetchUserStats());
  }, [dispatch, user?.id]);

  if (statsStatus === REQUEST_STATUS.LOADING && !stats) {
    return (
      <Card>
        <div className="flex justify-center py-8">
          <Spinner size="lg" className="text-blue-600" />
        </div>
      </Card>
    );
  }

  if (!stats) return null;

  const uploadPercentage = Math.min(
    100,
    Math.round((stats.upload_count / stats.upload_limit) * 100)
  );

  return (
    <Card>
      <h3 className="text-xl font-semibold text-gray-900 mb-6">
        Account Statistics
      </h3>

      <div className="space-y-6">
        {/* Upload Quota */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Upload Quota
            </span>
            <span className="text-sm text-gray-600">
              {stats.upload_count} / {stats.upload_limit}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full transition-all duration-300 ${
                uploadPercentage > 80
                  ? 'bg-red-600'
                  : uploadPercentage > 60
                  ? 'bg-yellow-600'
                  : 'bg-blue-600'
              }`}
              style={{ width: `${uploadPercentage}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {stats.remaining_uploads} uploads remaining this month
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Account Age</p>
            <p className="text-2xl font-semibold text-gray-900">
              {stats.account_age_days} days
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Account Status</p>
            <p className="text-2xl font-semibold text-gray-900 capitalize">
              {stats.account_status}
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="pt-4 border-t border-gray-200 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Email Verified</span>
            <span className="font-medium text-gray-900 flex items-center">
              {stats.email_verified ? (
                <>
                  <svg className="h-4 w-4 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Yes
                </>
              ) : (
                <>
                  <svg className="h-4 w-4 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  No
                </>
              )}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default UserStats;
