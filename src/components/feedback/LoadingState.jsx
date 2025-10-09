import React from 'react';
import Spinner from '../ui/Spinner';

/**
 * Full-page loading state component
 */
const LoadingState = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <Spinner size="lg" className="text-blue-600" />
      <p className="mt-4 text-gray-600 text-lg">{message}</p>
    </div>
  );
};

export default LoadingState;
