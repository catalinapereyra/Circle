import { useNavigate } from 'react-router-dom';

function RegisterProfilePage() {
    const navigate = useNavigate();

    const handleChoice = (choice) => {
        if (choice === 'both') {
            navigate('/couple-profile', { state: { then: '/friend-profile' } });
        } else if (choice === 'couple') {
            navigate('/couple-profile');
        } else if (choice === 'friend') {
            navigate('/friend-profile');
        }
    };

    return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h2>¿Qué tipo de perfil querés crear?</h2>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
                <button onClick={() => handleChoice('couple')}>Couple Mode 💕</button>
                <button onClick={() => handleChoice('friend')}>Friendship Mode 👫</button>
                <button onClick={() => handleChoice('both')}>Ambos 👥</button>
            </div>
        </div>
    );
}

export default RegisterProfilePage;