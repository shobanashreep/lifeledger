import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loader from '../common/Loader';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <Loader label="Checking your session..." />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return children;
}
