import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const Notifications: React.FC<{ role: string }> = () => {
    const location = useLocation();
    const targetPath = location.pathname.replace('/notifications', '/messages');
    
    return <Navigate to={targetPath} replace />;
};

export default Notifications;
