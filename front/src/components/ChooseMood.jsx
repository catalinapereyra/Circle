// components/ChooseMood.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function ChooseMood() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [hasCoupleProfile, setHasCoupleProfile] = useState(false);
    const [hasFriendshipProfile, setHasFriendshipProfile] = useState(false);

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        if (!storedUsername) {
            navigate('/login');
            return;
        }

        setUsername(storedUsername);

        const fetchProfileStatus = async () => {
            try {
                const res = await axios.get(`http://localhost:5001/profile/check?username=${storedUsername}`);
                setHasCoupleProfile(res.data.hasCoupleProfile);
                setHasFriendshipProfile(res.data.hasFriendshipProfile);
            } catch (err) {
                console.error("Error checking profiles:", err);
            }
        };

        fetchProfileStatus();
    }, [navigate]);

    const handleCoupleMode = () => {
        if (hasCoupleProfile) {
            navigate('/home');
        } else {
            if (window.confirm('No tenés perfil en modo Couple. ¿Querés crearlo?')) {
                navigate('/couple-profile', { state: { then: '/home' } });
            }
        }
    };

    const handleFriendshipMode = () => {
        if (hasFriendshipProfile) {
            navigate('/home');
        } else {
            if (window.confirm('No tenés perfil en modo Friendship. ¿Querés crearlo?')) {
                navigate('/friend-profile', { state: { then: '/home' } });
            }
        }
    };

    return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h2>Choose your mood</h2>
            <button onClick={handleCoupleMode} style={{ margin: '1rem', padding: '1rem' }}>
                Couple Mode
            </button>
            <button onClick={handleFriendshipMode} style={{ margin: '1rem', padding: '1rem' }}>
                Friendship Mode
            </button>
        </div>
    );
}

export default ChooseMood;
