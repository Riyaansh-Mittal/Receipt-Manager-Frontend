export const isTokenExpired = (expiryDate) => {
  if (!expiryDate) return true;
  const now = new Date();
  const expiry = new Date(expiryDate);
  return now >= expiry;
};

export const getSecondsUntilExpiry = (expiryDate) => {
  if (!expiryDate) return 0;
  const now = new Date();
  const expiry = new Date(expiryDate);
  return Math.max(0, Math.floor((expiry - now) / 1000));
};

export const shouldRefreshToken = (expiryDate, thresholdSeconds = 300) => {
  const secondsRemaining = getSecondsUntilExpiry(expiryDate);
  return secondsRemaining > 0 && secondsRemaining <= thresholdSeconds;
};

/**
 * Format date to readable string
 */
export const formatDate = (dateString, format = 'short') => {
  if (!dateString) return 'N/A';

  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }

    if (format === 'short') {
      // Returns: Oct 9, 2025
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }

    if (format === 'long') {
      // Returns: October 9, 2025
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }

    if (format === 'time') {
      // Returns: Oct 9, 2025, 3:30 PM
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    }

    if (format === 'iso') {
      // Returns: 2025-10-09
      return date.toISOString().split('T')[0];
    }

    // Default: short format
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid date';
  }
};


export const formatDateTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};


/**
 * Format date to relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (dateString) => {
  if (!dateString) return 'N/A';

  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    }

    // Fall back to formatted date
    return formatDate(dateString);
  } catch (error) {
    console.error('Relative time formatting error:', error);
    return 'Invalid date';
  }
};


/**
 * Get date range string
 */
export const formatDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return 'N/A';

  try {
    const start = formatDate(startDate);
    const end = formatDate(endDate);
    
    return `${start} - ${end}`;
  } catch (error) {
    return 'Invalid date range';
  }
};


/**
 * Check if date is today
 */
export const isToday = (dateString) => {
  if (!dateString) return false;

  try {
    const date = new Date(dateString);
    const today = new Date();
    
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  } catch (error) {
    return false;
  }
};