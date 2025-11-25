import React from 'react';
import Spinner from '../ui/Spinner';

/**
 * Full-page loading state component with professional styling
 */
const LoadingState = ({ message = 'Loading...', size = 'lg', variant = 'primary' }) => {
  const variants = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    accent: 'text-purple-600',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center px-6 py-12">
      <div className="relative">
        <div className="absolute inset-0 bg-white rounded-full blur-lg opacity-50 animate-pulse"></div>
        <Spinner 
          size={size} 
          className={`${variants[variant]} relative z-10`} 
        />
      </div>
      
      <div className="mt-8 text-center max-w-md">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {message}
        </h2>
        <p className="text-sm text-gray-600">
          Please wait while we prepare your experience
        </p>
      </div>

      <div className="mt-8 flex space-x-2">
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  );
};

export default LoadingState;
