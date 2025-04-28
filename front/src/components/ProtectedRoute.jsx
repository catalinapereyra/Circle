import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance'; // usamos el que ya manda token

function ProtectedRoute({ children }) {
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
                // aca llamamos una ruta protegida chiquita para ver si el token anda
                await axiosInstance.get('/user/validate-token');
                setIsAuthenticated(true);
            } catch (error) {
                console.error('Token inválido o expirado:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('username');
                setIsAuthenticated(false);
            } finally {
                setIsValidating(false);
            }
        };

        checkToken();
    }, []);

    if (isValidating) return <div>Cargando...</div>;

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default ProtectedRoute;
