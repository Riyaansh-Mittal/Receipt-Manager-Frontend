// Auth Error Codes
export const AUTH_ERROR_CODES = {
  AUTHENTICATION_FAILED: 'authentication_failed',
  TOKEN_NOT_VALID: 'token_not_valid',
  TOKEN_EXPIRED: 'token_expired',
  INVALID_CREDENTIALS: 'invalid_credentials',
  USER_NOT_FOUND: 'user_not_found',
  EMAIL_ALREADY_EXISTS: 'email_already_exists',
  INVALID_TOKEN: 'invalid_token',
  TOKEN_BLACKLISTED: 'token_blacklisted',
};

// Receipt Error Codes
export const RECEIPT_ERROR_CODES = {
  // Validation (400)
  VALIDATION_ERROR: 'validation_error',
  RECEIPT_ALREADY_CONFIRMED: 'receipt_already_confirmed',
  RECEIPT_PROCESSING_IN_PROGRESS: 'receipt_processing_in_progress',
  
  // Access (403)
  RECEIPT_ACCESS_DENIED: 'receipt_access_denied',
  CATEGORY_INACTIVE: 'category_inactive',
  
  // Not Found (404)
  RECEIPT_NOT_FOUND: 'receipt_not_found',
  CATEGORY_NOT_FOUND: 'category_not_found',
  
  // Conflict (409)
  DUPLICATE_RECEIPT: 'duplicate_receipt',
  
  // File Size (413)
  FILE_SIZE_EXCEEDED: 'file_size_exceeded',
  
  // Rate Limit (429)
  MONTHLY_UPLOAD_LIMIT_EXCEEDED: 'monthly_upload_limit_exceeded',
  QUOTA_EXCEEDED: 'quota_exceeded',
  
  // Server (500)
  FILE_UPLOAD_ERROR: 'file_upload_error',
  FILE_STORAGE_ERROR: 'file_storage_error',
  RECEIPT_NOT_PROCESSED: 'receipt_not_processed',
  RECEIPT_PROCESSING_FAILED: 'receipt_processing_failed',
  DATABASE_OPERATION_FAILED: 'database_operation_failed',
  QUOTA_CALCULATION_ERROR: 'quota_calculation_error',
};

// Merge all error codes
export const ERROR_CODES = {
  ...AUTH_ERROR_CODES,
  ...RECEIPT_ERROR_CODES,
};

// Error Messages
export const ERROR_MESSAGES = {
  // Auth errors
  [AUTH_ERROR_CODES.AUTHENTICATION_FAILED]: 'Authentication failed. Please login again.',
  [AUTH_ERROR_CODES.TOKEN_NOT_VALID]: 'Invalid token. Please login again.',
  [AUTH_ERROR_CODES.TOKEN_EXPIRED]: 'Session expired. Please login again.',
  [AUTH_ERROR_CODES.INVALID_CREDENTIALS]: 'Invalid credentials provided.',
  [AUTH_ERROR_CODES.USER_NOT_FOUND]: 'User not found.',
  [AUTH_ERROR_CODES.EMAIL_ALREADY_EXISTS]: 'Email already exists.',
  [AUTH_ERROR_CODES.INVALID_TOKEN]: 'Invalid or expired token.',
  [AUTH_ERROR_CODES.TOKEN_BLACKLISTED]: 'Token has been revoked. Please login again.',
  
  // Receipt errors
  [RECEIPT_ERROR_CODES.VALIDATION_ERROR]: 'Validation failed. Please check your input.',
  [RECEIPT_ERROR_CODES.RECEIPT_ALREADY_CONFIRMED]: 'This receipt has already been confirmed.',
  [RECEIPT_ERROR_CODES.RECEIPT_PROCESSING_IN_PROGRESS]: 'Receipt is still being processed. Please wait.',
  [RECEIPT_ERROR_CODES.RECEIPT_ACCESS_DENIED]: 'You do not have permission to access this receipt.',
  [RECEIPT_ERROR_CODES.CATEGORY_INACTIVE]: 'Selected category is no longer available.',
  [RECEIPT_ERROR_CODES.RECEIPT_NOT_FOUND]: 'Receipt not found.',
  [RECEIPT_ERROR_CODES.CATEGORY_NOT_FOUND]: 'Category not found.',
  [RECEIPT_ERROR_CODES.DUPLICATE_RECEIPT]: 'This receipt has already been uploaded.',
  [RECEIPT_ERROR_CODES.FILE_SIZE_EXCEEDED]: 'File size exceeds 10MB limit.',
  [RECEIPT_ERROR_CODES.MONTHLY_UPLOAD_LIMIT_EXCEEDED]: 'Monthly upload limit reached.',
  [RECEIPT_ERROR_CODES.QUOTA_EXCEEDED]: 'Upload quota exceeded.',
  [RECEIPT_ERROR_CODES.FILE_UPLOAD_ERROR]: 'Failed to upload file. Please try again.',
  [RECEIPT_ERROR_CODES.FILE_STORAGE_ERROR]: 'File storage error. Please try again.',
  [RECEIPT_ERROR_CODES.RECEIPT_NOT_PROCESSED]: 'Receipt has not been processed yet.',
  [RECEIPT_ERROR_CODES.RECEIPT_PROCESSING_FAILED]: 'Receipt processing failed. Please try again.',
  [RECEIPT_ERROR_CODES.DATABASE_OPERATION_FAILED]: 'Database error occurred. Please try again.',
  [RECEIPT_ERROR_CODES.QUOTA_CALCULATION_ERROR]: 'Failed to calculate quota.',
};

export const getErrorMessage = (errorCode, defaultMessage = 'An unexpected error occurred') => {
  return ERROR_MESSAGES[errorCode] || defaultMessage;
};

/**
 * Get user-friendly error message from API error response
 */
export const parseApiError = (error) => {
  // Check if error has standard format
  if (error?.error) {
    const { code, message, context, type } = error.error;
    
    return {
      code: code || type,
      message: message || getErrorMessage(code || type),
      context,
      type,
      correlationId: error.error.correlation_id,
    };
  }
  
  // Fallback for non-standard errors
  return {
    code: 'unknown_error',
    message: error?.message || 'An unexpected error occurred',
    context: null,
    type: 'UnknownError',
    correlationId: null,
  };
};
