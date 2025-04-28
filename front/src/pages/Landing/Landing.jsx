import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './LandingIntro.css';
import axiosInstance from '../../api/axiosInstance';

function Landing() {
    const navigate = useNavigate();
    const [hideIntro, setHideIntro] = useState(false);

    useEffect(() => {
        const checkLogin = async () => {
            const token = localStorage.getItem('token');
            if (!token) return; // no hay token, muestro landing normal

            try {
                await axiosInstance.get('/user/validate-token');
                // si el token es valido, mando directo a choose-mood
                navigate('/choose-mood');
            } catch (error) {
                console.log('Token inválido o expirado, seguimos en Landing');
                localStorage.removeItem('token');
                localStorage.removeItem('username');
            }
        };

        checkLogin();
    }, [navigate]);

    useEffect(() => {
        const timeout1 = setTimeout(() => setHideIntro(true), 2500);
        return () => clearTimeout(timeout1);
    }, []);

    return (
        <div className={`intro-screen ${hideIntro ? 'fade-out' : 'fade-in'}`}>
            <div className="intro-circle"></div>

            {hideIntro && (
                <div className="landing-buttons">
                    <button onClick={() => navigate('/register')}>Register</button>
                    <button onClick={() => navigate('/login')}>Log In</button>
                </div>
            )}
        </div>
    );
}

export default Landing;
