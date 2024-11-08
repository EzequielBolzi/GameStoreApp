import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '../auth.service';

export const ProtectedRoute = ({ children, roles }) => {
  const location = useLocation();
  
  if (!authService.getRole()) {
    // Not logged in, redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !authService.hasRole(roles)) {
    // Role not authorized, redirect to home page
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};
