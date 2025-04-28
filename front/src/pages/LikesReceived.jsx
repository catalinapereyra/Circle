import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useUserMode } from '../contexts/UserModeContext'; // contexto global

function LikesReceived() {
    const [likes, setLikes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [premiumError, setPremiumError] = useState(false);

    const navigate = useNavigate();
    const { mode, isPremium } = useUserMode(); // traer mode y premium del contexto

    const fetchLikes = async () => {
        if (!mode) return; // si no hay modo, no hago nada
        setLoading(true);
        try {
            const apiMode = mode === 'friendship' ? 'friend' : mode; // corregir naming
            const response = await axiosInstance.get(`/profile/likes-received?mode=${apiMode}`);
            setLikes(response.data);
            setPremiumError(false); // Si pudo traer likes, reseteo error de premium
        } catch (error) {
            if (error.response && error.response.status === 403) {
                setPremiumError(true);
            } else {
                console.error("Error fetching likes received:", error);
            }
        } finally {
            setLoading(false);
        }
    };

    // 1. Cada vez que cambia el modo (al entrar o cambiar modo), busco los likes
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        (async () => {
            await fetchLikes();
        })();
    }, [mode]);

    // 2. Cada vez que vuelve el foco a la página, refresco los likes
    useEffect(() => {
        const handleFocus = () => {
            (async () => {
                await fetchLikes();
            })();
        };

        window.addEventListener('focus', handleFocus);
        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, [mode]);

    // 3. Si me hago premium estando en la página, busco likes inmediatamente
    useEffect(() => {
        if (isPremium) {
            (async () => {
                await fetchLikes();
            })();
        }
    }, [isPremium]);

    if (loading) return <p>Loading...</p>;

    if (premiumError) {
        return (
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <h2>⭐ Only for Premium Users!</h2>
                <p>Upgrade to Premium to see who liked you!</p>
            </div>
        );
    }

    if (likes.length === 0) {
        return <p>No pending likes yet!</p>;
    }

    return (
        <div>
            <h1>People who liked you</h1>
            <ul>
                {likes.map((user) => (
                    <li key={user.username}>
                        {user.name} ({user.age} years old) - @{user.username}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default LikesReceived;
