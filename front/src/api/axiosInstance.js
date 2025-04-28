import axios from 'axios';

// creo una instancia de axios para configurar el baseURL
const axiosInstance = axios.create({
    baseURL: 'http://localhost:5001',
});

// antes de cada request: agrego el token si existe
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// ⚡ nuevo: después de cada respuesta: capturo errores
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        // si el servidor devuelve 401 (Unauthorized)
        if (error.response && error.response.status === 401) {
            console.warn('⚡ Token inválido o vencido, cerrando sesión automáticamente');
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            window.location.href = '/login'; // redirigir al login
        }
        return Promise.reject(error); // cualquier otro error lo seguimos pasando
    }
);

export default axiosInstance;
