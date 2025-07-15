// src/components/PublicRoute.jsx
import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';

function PublicRoute({ children }) {
    const [isValidating, setIsValidating] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkToken = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setIsValidating(false);
                setIsAuthenticated(false);
                return;
            }
            try {
                await axiosInstance.get('/user/validate-token');
                setIsAuthenticated(true);
            } catch (error) {
                console.error('invalid or expired token:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('username');
                setIsAuthenticated(false);
            } finally {
                setIsValidating(false);
            }
        };

        checkToken();
    }, []);

    if (isValidating) return <div>Loading...</div>;

    if (isAuthenticated) {
        return <Navigate to="/choose-mood" replace />;
    }

    return children;
}

export default PublicRoute;
