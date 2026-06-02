import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../constants/routes';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
    const { isAuthenticated, user } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        // Redirect to login if not authenticated
        return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role.toUpperCase())) {
        // Redirect to their own dashboard if role not allowed
        const userRole = user.role.toUpperCase();
        if (userRole === 'PDG') return <Navigate to={ROUTES.DASHBOARD.PDG.HOME} replace />;
        if (userRole === 'DIRECTION' || userRole === 'PROVISORIAT') return <Navigate to={ROUTES.DASHBOARD.DIRECTION.HOME} replace />;
        if (userRole === 'SECRETARIAT') return <Navigate to={ROUTES.DASHBOARD.SECRETARIAT.HOME} replace />;
        if (userRole === 'ENSEIGNANT') return <Navigate to={ROUTES.DASHBOARD.TEACHER.HOME} replace />;
        if (userRole === 'PARENT' || userRole === 'PARENTS') return <Navigate to={ROUTES.DASHBOARD.PARENT.HOME} replace />;
        if (userRole === 'ELEVE') return <Navigate to={ROUTES.DASHBOARD.STUDENT.HOME} replace />;

        return <Navigate to={ROUTES.HOME} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
