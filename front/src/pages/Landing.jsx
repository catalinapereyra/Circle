import { useNavigate } from 'react-router-dom';

function Landing() {
    const navigate = useNavigate();

    return (
        <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h1>Bienvenida/o</h1>
            <button onClick={() => navigate('/register')}>Sign Up</button>
            <button onClick={() => navigate('/login')}>Log In</button>
        </div>
    );
}

export default Landing;