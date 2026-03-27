import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children, roles }) => {
    const { user, loading, isAuthenticated } = useAuth();

    if (loading) {
        return (
            <div style={{
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                minHeight: '60vh', color: '#ffffff', fontSize: '1.2rem'
            }}>
                Loading...
            </div>
        );
    }

    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (roles && !roles.includes(user.role)) return <Navigate to="/account" replace />;

    return children;
};

export default ProtectedRoute;
