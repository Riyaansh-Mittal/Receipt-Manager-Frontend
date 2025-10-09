export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  VERIFY_EMAIL: '/verify-email',
  PROFILE: '/profile',
  DASHBOARD: '/dashboard',
  // Receipt Routes
  RECEIPTS: '/receipts',
  RECEIPTS_UPLOAD: '/receipts/upload',
  RECEIPTS_DETAIL: '/receipts/:id',
  RECEIPTS_REVIEW: '/receipts/:id/review',
  // Ledger Routes (placeholder)
  LEDGER: '/ledger',
  SUMMARY: '/summary',
  
  NOT_FOUND: '*',
};

export const PUBLIC_ROUTES = [
  ROUTES.HOME,
  ROUTES.LOGIN,
  ROUTES.VERIFY_EMAIL,
];

export const PROTECTED_ROUTES = [
  ROUTES.DASHBOARD,
  ROUTES.PROFILE,
  ROUTES.RECEIPTS,
  ROUTES.RECEIPTS_UPLOAD,
  ROUTES.RECEIPTS_DETAIL,
  ROUTES.RECEIPTS_REVIEW,
  ROUTES.LEDGER,
  ROUTES.SUMMARY,
];