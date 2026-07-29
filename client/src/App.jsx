import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Loader from './components/common/Loader';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const LifeItemsPage = lazy(() => import('./pages/LifeItemsPage'));
const LifeItemDetailPage = lazy(() => import('./pages/LifeItemDetailPage'));
const DocumentsPage = lazy(() => import('./pages/DocumentsPage'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';

export default function App() {
  return (
    <Suspense fallback={<Loader label="Loading page..." />}>
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Protected app routes */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/life-items" element={<LifeItemsPage />} />
        <Route path="/life-items/:id" element={<LifeItemDetailPage />} />
        <Route path="/documents" element={<DocumentsPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
    </Suspense>
  );
}
