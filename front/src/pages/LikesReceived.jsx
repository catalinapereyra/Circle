import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useUserMode } from '../contexts/UserModeContext'; // contexto global

function LikesReceived() {
    const [likes, setLikes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [premiumError, setPremiumError] = useState(false);

    const navigate = useNavigate();
    const { mode, isPremium } = useUserMode();

    const fetchLikes = async () => {
        if (!mode) return;
        setLoading(true);
        try {
            const apiMode = mode === 'friendship' ? 'friend' : mode;
            const response = await axiosInstance.get(`/profile/likes-received?mode=${apiMode}`);
            setLikes(response.data);
            setPremiumError(false);
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

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        fetchLikes();
    }, [mode]);

    useEffect(() => {
        const handleFocus = () => {
            fetchLikes();
        };
        window.addEventListener('focus', handleFocus);
        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, [mode]);

    useEffect(() => {
        if (isPremium) fetchLikes();
    }, [isPremium]);

    // 👉 LIKE BACK (match)
    const handleLike = async (user) => {
        try {
            const response = await axiosInstance.post('/match', {
                swiped_username: user.username,
                type: 'like',
                mode: mode,
            });

            if (response.data.match) {
                alert(`💘 It's a match with ${user.username}!`);
            } else {
                alert(`❤️ You liked back ${user.username}`);
            }

            setLikes(prev => prev.filter(u => u.username !== user.username));
        } catch (err) {
            console.error("Error al hacer like:", err);
        }
    };

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
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {likes.map((user) => (
                    <li key={user.username} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <span>{user.name} ({user.age} years old) - @{user.username}</span>
                        <button
                            onClick={() => handleLike(user)}
                            style={{
                                fontSize: '1.5rem',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'crimson',
                            }}
                            title="Like back"
                        >
                            ❤️
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default LikesReceived;