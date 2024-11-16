import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthProvider';

const RequireAuth = ({ allowedRoles }) => {
    const { auth } = useContext(AuthContext);

    return auth?.role && allowedRoles.includes(auth.role) ? (
        <Outlet />
    ) : (
        <Navigate to="/login" />
    );
};

export default RequireAuth;
