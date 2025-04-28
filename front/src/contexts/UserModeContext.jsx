import { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

// contexto
const UserModeContext = createContext();

// hook
export const useUserMode = () => useContext(UserModeContext);

// provider
export const UserModeProvider = ({ children }) => {
    const [mode, setMode] = useState(null); // puede ser "couple" o "friendship"
    const [isPremium, setIsPremium] = useState(false); // nuevo: saber si es premium

    useEffect(() => {
        const fetchSubscription = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                const res = await axiosInstance.get('/user/me/subscription');
                setIsPremium(res.data.premium);
            } catch (error) {
                console.error('Error fetching subscription status:', error);
            }
        };

        fetchSubscription();
    }, []);

    return (
        <UserModeContext.Provider value={{ mode, setMode, isPremium, setIsPremium }}>
            {children}
        </UserModeContext.Provider>
    );
};
