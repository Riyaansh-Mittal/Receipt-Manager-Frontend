import React, { useEffect } from 'react';
import { useProfile } from '../hooks/useProfile';
import ProfileForm from '../components/ProfileForm';
import EmailVerification from '../components/EmailVerification';
import UserStats from '../components/UserStats';
import LoadingState from '../../../components/feedback/LoadingState';
import ErrorState from '../../../components/feedback/ErrorState';

/**
 * Profile Page Component
 */
const ProfilePage = () => {
  const { user, loadProfile, isLoading, error } = useProfile();

  useEffect(() => {
    if (!user) {
      loadProfile();
    }
  }, [user, loadProfile]);

  if (isLoading && !user) {
    return <LoadingState message="Loading profile..." />;
  }

  if (error && !user) {
    return <ErrorState message="Failed to load profile" onRetry={loadProfile} />;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
        <p className="text-gray-600">
          Manage your account information and preferences
        </p>
      </div>

      <div className="space-y-6">
        <ProfileForm />
        <EmailVerification />
        <UserStats />
      </div>
    </div>
  );
};

export default ProfilePage;
