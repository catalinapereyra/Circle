// src/pages/LikesReceived.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useUserMode } from '../contexts/UserModeContext'; // importamos el contexto

function LikesReceived() {
    const [likes, setLikes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [premiumError, setPremiumError] = useState(false);

    const navigate = useNavigate();
    const { mode, isPremium } = useUserMode(); // sacamos si el usuario es premium

    const fetchLikes = async () => {
        if (!mode) return; // si todavía no cargó el modo, no busco
        setLoading(true);
        try {
            const apiMode = mode === 'friendship' ? 'friend' : mode;
            const response = await axiosInstance.get(`/profile/likes-received?mode=${apiMode}`);
            setLikes(response.data);
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


    // ⚡ Cada vez que esta página se monta → traemos los likes
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        fetchLikes();
    }, [mode]);

    // cada vez que el usuario vuelve a esta página → refrescamos
    useEffect(() => {
        const handleFocus = () => {
            fetchLikes();
        };

        window.addEventListener('focus', handleFocus);
        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, [mode]);

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
