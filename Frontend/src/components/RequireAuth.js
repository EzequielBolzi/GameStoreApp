import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const RequireAuth = ({ allowedRoles, children }) => {
  const { auth } = useAuth();
  const location = useLocation();
  console.log("Auth in RequireAuth:", auth); // Para debug
    console.log("Allowed roles:", allowedRoles); // Para debug
  // Check if the user is authenticated and their role is in the allowedRoles
  if (!auth?.role || !allowedRoles.includes(auth.role)) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!auth || !allowedRoles.includes(auth.role)) {
    return <div>Loading...</div>;  // Optionally show a loading state until redirection happens
  }

  return children;  // Allow access if authentication is valid
};

export default RequireAuth;
