import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './LandingIntro.css';

function Landing() {
    const navigate = useNavigate();
    const [hideIntro, setHideIntro] = useState(false);

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