import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useUserMode } from '../contexts/UserModeContext';
import './LikesReceived.css';
import MatchModal from '../components/MatchModal'; // ajustá el path si es necesario

function LikesReceived() {
    const [likes, setLikes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [premiumError, setPremiumError] = useState(false);

    const navigate = useNavigate();
    const {mode, isPremium} = useUserMode();

    const [showMatchModal, setShowMatchModal] = useState(false);
    const [matchedUser, setMatchedUser] = useState(null);

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
                setMatchedUser(user.username);
                setShowMatchModal(true);
            } else {
                alert(`❤️ You liked back ${user.username}`);
            }

            setLikes(prev => prev.filter(u => u.username !== user.username));
        } catch (err) {
            console.error("Error al hacer like:", err);
        }
    };

    return (
        <>
            {showMatchModal && (
                <MatchModal
                    username={matchedUser}
                    onClose={() => setShowMatchModal(false)}
                />
            )}

            <div className="likes-received-container">
                <div className="back-button-container">
                    <button className="back-button" onClick={() => navigate('/home')}>
                        Back to Home
                    </button>
                </div>
                <div className="likes-received-header">
                    <h1>People who liked you</h1>
                </div>

                {loading && (
                    <div className="loading-container">
                        LOADING
                    </div>
                )}

                {premiumError && (
                    <div className="premium-error-container">
                        <h2>⭐ Only for Premium Users!</h2>
                        <p>Upgrade to Premium to see who liked you!</p>
                        <button className="upgrade-button">UPGRADE NOW</button>
                    </div>
                )}

                {likes.length === 0 && !loading && !premiumError && (
                    <div className="empty-state">
                        No pending likes yet!
                    </div>
                )}

                {likes.length > 0 && !loading && !premiumError && (
                    <>
                        <div className="likes-stats">
                            <div className="likes-count">
                                <span className="likes-count-number">{likes.length}</span>
                                People liked you
                            </div>
                        </div>

                        <ul className="likes-list">
                            {likes.map((user) => (
                                <li key={user.username} className="like-item">
                                    <div className="like-item-content">
                                        <div className="user-info">
                                            <div className="user-name">{user.name}</div>
                                            <div className="user-details">
                                                {user.age} years old - @<span
                                                className="user-username">{user.username}</span>
                                            </div>
                                        </div>
                                        <button
                                            className="like-back-button"
                                            onClick={() => handleLike(user)}
                                            title="Like back"
                                        >
                                            ❤️
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </>
                )}
            </div>
        </>
    );
}
export default LikesReceived;