// src/pages/RegisterProfileType.jsx
import { useNavigate } from 'react-router-dom';

function RegisterProfileType() {
    const navigate = useNavigate();
    const storedUsername = localStorage.getItem('username');

    // Si no hay username guardado, redirige al register
    if (!storedUsername) {
        navigate('/register');
        return null;
    }

    const handleChoose = (path, withFriendship = false) => {
        if (withFriendship) {
            navigate(path, { state: { then: '/create-friendship-profile' } });
        } else {
            navigate(path);
        }
    };

    return (
        <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h2>Create your profile/s</h2>
            <button onClick={() => handleChoose('/create-couple-profile')}>Romance me, maybe?</button>
            <button onClick={() => handleChoose('/create-friendship-profile')}>Friendzone me, please?</button>
            <button onClick={() => handleChoose('/create-couple-profile', true)}>Best of both worlds</button>
        </div>
    );
}

export default RegisterProfileType;