import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes.constants';

import LandingPage from '../features/home/pages/LandingPage';

// Layouts
import MainLayout from '../components/layout/MainLayout';
import AuthLayout from '../components/layout/AuthLayout';

// Guards
import AuthGuard from '../guards/AuthGuard';
import GuestGuard from '../guards/GuestGuard';

// Auth Pages
import LoginPage from '../features/auth/pages/LoginPage';
import ProfilePage from '../features/auth/pages/ProfilePage';
import VerifyEmailPage from '../features/auth/pages/VerifyEmailPage';

// Dashboard
import DashboardPage from '../features/dashboard/pages/DashboardPage';

// Receipt Pages
import ReceiptsListPage from '../features/receipts/pages/ReceiptsListPage';
import UploadReceiptPage from '../features/receipts/pages/UploadReceiptPage';
import ReviewReceiptPage from '../features/receipts/pages/ReviewReceiptPage';
import ReceiptDetailPage from '../features/receipts/pages/ReceiptDetailPage';

// Placeholder components
const LedgerPage = () => (
  <div className="text-center py-12">
    <h2 className="text-2xl font-bold text-gray-900 mb-2">Ledger</h2>
    <p className="text-gray-600">Ledger feature coming soon...</p>
  </div>
);

const SummaryPage = () => (
  <div className="text-center py-12">
    <h2 className="text-2xl font-bold text-gray-900 mb-2">Summary</h2>
    <p className="text-gray-600">Summary feature coming soon...</p>
  </div>
);

const NotFoundPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-8">Page not found</p>
      <a
        href={ROUTES.LOGIN}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Go to Login
      </a>
    </div>
  </div>
);

/**
 * Main Router Component
 */
const AppRouter = () => {
  return (
    <Routes>
      {/* ✅ LANDING PAGE - Served at root */}
      <Route path="/" element={<LandingPage />} />

      {/* Public Routes */}
      <Route element={<AuthLayout />}>
        <Route
          path={ROUTES.LOGIN}
          element={
            <GuestGuard>
              <LoginPage />
            </GuestGuard>
          }
        />
        <Route path={ROUTES.VERIFY_EMAIL} element={<VerifyEmailPage />} />
      </Route>

      {/* Protected Routes */}
      <Route
        element={
          <AuthGuard>
            <MainLayout />
          </AuthGuard>
        }
      >
        <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
        <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
        
        {/* Receipt Routes */}
        <Route path={ROUTES.RECEIPTS_UPLOAD} element={<UploadReceiptPage />} />
        <Route path={ROUTES.RECEIPTS_REVIEW} element={<ReviewReceiptPage />} />
        <Route path={ROUTES.RECEIPTS_DETAIL} element={<ReceiptDetailPage />} />
        <Route path={ROUTES.RECEIPTS} element={<ReceiptsListPage />} />
        
        {/* Other Routes */}
        <Route path={ROUTES.LEDGER} element={<LedgerPage />} />
        <Route path={ROUTES.SUMMARY} element={<SummaryPage />} />
      </Route>

      {/* 404 Not Found */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRouter;
