export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  VERSION: import.meta.env.VITE_API_VERSION || 'v1',
  TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000,
};

export const API_ENDPOINTS = {
  AUTH: {
    MAGIC_LINK_REQUEST: '/auth/v1/magic-link/request/',
    MAGIC_LINK_LOGIN: '/auth/v1/magic-link/verify/',
    TOKEN_REFRESH: '/auth/v1/token/refresh/',
    TOKEN_STATUS: '/auth/v1/token/status/',
    LOGOUT: '/auth/v1/logout/',
    PROFILE: '/auth/v1/profile/',
    EMAIL_UPDATE: '/auth/v1/email/update/',
    EMAIL_VERIFY: '/auth/v1/email/verify/',
    EMAIL_RESEND: '/auth/v1/email/resend-verification/',
    STATS: '/auth/v1/stats/',
  },
  RECEIPTS: {
    UPLOAD: '/receipt/v1/receipts/upload/',
    LIST: '/receipt/v1/receipts/',
    DETAIL: '/receipt/v1/receipts/:id/',
    UPLOAD_STATUS: '/receipt/v1/receipts/upload-status/:id/',
    EXTRACTED_DATA: '/receipt/v1/receipts/:id/extracted-data/',
    CONFIRM: '/receipt/v1/receipts/:id/confirm/',
  },
  CATEGORIES: {
    LIST: '/receipt/v1/categories/',
    DETAIL: '/receipt/v1/categories/:id/',
    USAGE_STATS: '/receipt/v1/categories/usage-stats/',
    PREFERENCES: '/receipt/v1/categories/preferences/',
    SUGGEST: '/receipt/v1/categories/suggest/',
    VALIDATE: '/receipt/v1/categories/:id/validate/',
  },
  QUOTA: {
    STATUS: '/receipt/v1/user/quota-status/',
    UPLOAD_HISTORY: '/receipt/v1/user/upload-history/',
  },
};

export const TOKEN_CONFIG = {
  ACCESS_TOKEN_KEY: import.meta.env.VITE_ACCESS_TOKEN_KEY || 'access_token',
  REFRESH_TOKEN_KEY: import.meta.env.VITE_REFRESH_TOKEN_KEY || 'refresh_token',
  REFRESH_THRESHOLD: parseInt(import.meta.env.VITE_TOKEN_REFRESH_THRESHOLD) || 300,
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  PAYLOAD_TOO_LARGE: 413,
  RATE_LIMITED: 429,
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

// File Upload Configuration
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: parseInt(import.meta.env.VITE_MAX_FILE_SIZE) || 10485760, // 10MB
  ALLOWED_TYPES: (import.meta.env.VITE_ALLOWED_FILE_TYPES || 'image/jpeg,image/jpg,image/png,application/pdf').split(','),
  CHUNK_SIZE: parseInt(import.meta.env.VITE_UPLOAD_CHUNK_SIZE) || 1048576, // 1MB chunks
  POLLING_INTERVAL: parseInt(import.meta.env.VITE_POLLING_INTERVAL) || 3000, // 3 seconds
  POLLING_MAX_DURATION: parseInt(import.meta.env.VITE_POLLING_MAX_DURATION) || 120000, // 2 minutes
};

// Cache Configuration
export const CACHE_CONFIG = {
  CATEGORIES_TTL: parseInt(import.meta.env.VITE_CATEGORIES_CACHE_TTL) || 3600000, // 1 hour
  RECEIPTS_TTL: parseInt(import.meta.env.VITE_RECEIPTS_CACHE_TTL) || 300000, // 5 minutes
  QUOTA_TTL: parseInt(import.meta.env.VITE_QUOTA_CACHE_TTL) || 60000, // 1 minute
};
