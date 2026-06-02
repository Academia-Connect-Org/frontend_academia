import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../constants/routes';

interface PublicRouteProps {
    children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
    const { isAuthenticated, user } = useAuth();

    if (isAuthenticated && user) {
        // Redirect to their dashboard if already logged in
        const userRole = user.role.toUpperCase();
        if (userRole === 'PDG') return <Navigate to={ROUTES.DASHBOARD.PDG.HOME} replace />;
        if (userRole === 'DIRECTION') return <Navigate to={ROUTES.DASHBOARD.DIRECTION.HOME} replace />;
        if (userRole === 'SECRETARIAT') return <Navigate to={ROUTES.DASHBOARD.SECRETARIAT.HOME} replace />;
        if (userRole === 'ENSEIGNANT') return <Navigate to={ROUTES.DASHBOARD.TEACHER.HOME} replace />;
        if (userRole === 'PARENT' || userRole === 'PARENTS') return <Navigate to={ROUTES.DASHBOARD.PARENT.HOME} replace />;
        if (userRole === 'ELEVE') return <Navigate to={ROUTES.DASHBOARD.STUDENT.HOME} replace />;

        return <Navigate to={ROUTES.HOME} replace />;
    }

    return <>{children}</>;
};

export default PublicRoute;
