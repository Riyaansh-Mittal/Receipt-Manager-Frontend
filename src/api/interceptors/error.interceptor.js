import { HTTP_STATUS } from '../../constants/api.constants';
import { ERROR_CODES, RECEIPT_ERROR_CODES } from '../../constants/error.constants';
import store from '../../store';
import { showNotification } from '../../store/slices/notification.slice';
import { logout } from '../../store/slices/auth.slice';

/**
 * Error Response Interceptor with Simplified 401 Handling
 */
export const errorInterceptor = (error) => {
  if (error.response) {
    const { status, data } = error.response;

    // Extract error details - handle multiple response formats
    const errorCode = data?.error?.code || data?.code || data?.error?.type;
    const errorMessage = data?.error?.message || data?.detail || data?.message;
    const context = data?.error?.context;

    console.error('API Error:', {
      status,
      code: errorCode,
      message: errorMessage,
      context,
      url: error.config?.url,
      fullData: data,
    });

    // ✅ SIMPLIFIED: Any 401 error = logout (except refresh endpoint which will be retried)
    if (status === HTTP_STATUS.UNAUTHORIZED) {
      console.log('🔒 401 Unauthorized - Logging out user');
      
      // Don't show notification or logout for refresh token endpoint
      // Let the auth interceptor handle the refresh flow
      if (error.config?.url?.includes('/token/refresh/')) {
        console.log('⚠️ Refresh token endpoint failed - will logout after retry fails');
        return Promise.reject(error);
      }
      
      // For any other 401, immediately logout
      store.dispatch(
        showNotification({
          type: 'warning',
          message: 'Your session has expired. Please login again.',
          duration: 5000,
        })
      );
      
      // Clear auth state
      store.dispatch(logout());
      
      // Force redirect to login
      setTimeout(() => {
        window.location.href = '/login';
      }, 500);
      
      return Promise.reject(error);
    }

    // Handle specific error codes that should NOT show global notifications
    const silentErrors = [
      RECEIPT_ERROR_CODES.DUPLICATE_RECEIPT,
      RECEIPT_ERROR_CODES.RECEIPT_PROCESSING_IN_PROGRESS,
      RECEIPT_ERROR_CODES.RECEIPT_NOT_PROCESSED,
    ];

    if (silentErrors.includes(errorCode)) {
      return Promise.reject(error);
    }

    // Handle quota exceeded (429)
    if (status === HTTP_STATUS.RATE_LIMITED) {
      const retryAfter = data?.error?.context?.retry_after;
      const resetDate = data?.error?.context?.reset_date;
      
      let message = errorMessage || 'Too many requests. Please try again later.';
      if (resetDate) {
        message += ` Quota resets on ${resetDate}.`;
      } else if (retryAfter) {
        message += ` Please wait ${retryAfter} seconds.`;
      }

      store.dispatch(
        showNotification({
          type: 'warning',
          message,
          duration: 8000,
        })
      );
      return Promise.reject(error);
    }

    // Handle validation errors (400)
    if (status === HTTP_STATUS.BAD_REQUEST) {
      if (errorCode === ERROR_CODES.VALIDATION_ERROR && context) {
        console.log('Validation errors:', context);
      } else {
        store.dispatch(
          showNotification({
            type: 'error',
            message: errorMessage || 'Invalid request. Please check your input.',
          })
        );
      }
      return Promise.reject(error);
    }

    // Handle forbidden errors (403)
    if (status === HTTP_STATUS.FORBIDDEN) {
      store.dispatch(
        showNotification({
          type: 'error',
          message: errorMessage || 'Access denied.',
        })
      );
      return Promise.reject(error);
    }

    // Handle not found errors (404)
    if (status === HTTP_STATUS.NOT_FOUND) {
      console.log('Resource not found:', error.config?.url);
      return Promise.reject(error);
    }

    // Handle conflict errors (409)
    if (status === HTTP_STATUS.CONFLICT) {
      console.log('Conflict error:', errorCode);
      return Promise.reject(error);
    }

    // Handle payload too large (413)
    if (status === HTTP_STATUS.PAYLOAD_TOO_LARGE) {
      store.dispatch(
        showNotification({
          type: 'error',
          message: errorMessage || 'File size exceeds the maximum limit of 10MB.',
        })
      );
      return Promise.reject(error);
    }

    // Handle server errors (500+)
    if (status >= HTTP_STATUS.INTERNAL_ERROR) {
      const correlationId = data?.error?.correlation_id;
      let message = errorMessage || 'Server error occurred. Please try again.';
      
      if (correlationId) {
        message += ` (ID: ${correlationId})`;
      }

      store.dispatch(
        showNotification({
          type: 'error',
          message,
          duration: 8000,
        })
      );
      return Promise.reject(error);
    }

    // Generic error for other status codes
    store.dispatch(
      showNotification({
        type: 'error',
        message: errorMessage || 'An error occurred. Please try again.',
      })
    );
  } else if (error.request) {
    console.error('Network Error:', error.message);
    store.dispatch(
      showNotification({
        type: 'error',
        message: 'Network error. Please check your connection.',
      })
    );
  } else {
    console.error('Error:', error.message);
    store.dispatch(
      showNotification({
        type: 'error',
        message: 'An unexpected error occurred.',
      })
    );
  }

  return Promise.reject(error);
};
