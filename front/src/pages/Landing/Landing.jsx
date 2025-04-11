import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './LandingIntro.css';

function Landing() {
    const navigate = useNavigate();
    const [hideIntro, setHideIntro] = useState(false);

    useEffect(() => {
        // Después de 2.5s inicia la salida, luego a los 3s navega
        const timeout1 = setTimeout(() => setHideIntro(true), 2500);
        const timeout2 = setTimeout(() => navigate('/landing'), 3000);

        return () => {
            clearTimeout(timeout1);
            clearTimeout(timeout2);
        };
    }, [navigate]);

    return (
        <div className={`intro-screen ${hideIntro ? 'fade-out' : 'fade-in'}`}>
            <div className="intro-circle"></div>
        </div>
    );
}

export default Landing;