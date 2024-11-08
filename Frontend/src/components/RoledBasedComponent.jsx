import React from 'react';
import { authService } from '../auth.service';

export const RoleBasedComponent = ({ 
  roles, 
  children, 
  fallback = null 
}) => {
  if (!authService.hasRole(roles)) {
    return fallback;
  }
  
  return children;
};