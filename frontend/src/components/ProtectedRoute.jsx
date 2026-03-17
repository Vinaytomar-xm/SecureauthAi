import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate 
        to="/login" 
        replace 
        state={{ 
          message: 'Please sign in first to access this page',
          from: location.pathname 
        }} 
      />
    );
  }

  if (requiredRole && user?.role !== requiredRole) {
    return (
      <Navigate 
        to="/login" 
        replace 
        state={{ 
          message: 'You do not have permission to access this page',
          from: location.pathname 
        }} 
      />
    );
  }

  return children;
};

export default ProtectedRoute;
