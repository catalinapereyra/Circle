import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function CompleteProfilePage() {
    const [gender, setGender] = useState('');
    const [age, setAge] = useState('');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const token = localStorage.getItem('token');

        try {
            const response = await axios.post('http://localhost:5001/user/complete-profile', {
                gender,
                age,
                location: {
                    latitude: parseFloat(latitude),
                    longitude: parseFloat(longitude)
                }
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.status === 200) {
                navigate('/choose-mood');
            }
        } catch (err) {
            setError('Error al completar el perfil');
            console.error(err);
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <h2>Completa tu perfil</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Género:</label>
                    <select value={gender} onChange={e => setGender(e.target.value)} required>
                        <option value="">Seleccionar</option>
                        <option value="MALE">Masculino</option>
                        <option value="FEMALE">Femenino</option>
                        <option value="OTHER">Otro</option>
                    </select>
                </div>
                <div>
                    <label>Edad:</label>
                    <input
                        type="number"
                        value={age}
                        onChange={e => setAge(e.target.value)}
                        min="18"
                        required
                    />
                </div>
                <div>
                    <label>Latitud:</label>
                    <input
                        type="number"
                        value={latitude}
                        onChange={e => setLatitude(e.target.value)}
                        step="0.0001"
                        required
                    />
                </div>
                <div>
                    <label>Longitud:</label>
                    <input
                        type="number"
                        value={longitude}
                        onChange={e => setLongitude(e.target.value)}
                        step="0.0001"
                        required
                    />
                </div>
                <button type="submit">Guardar</button>
            </form>
        </div>
    );
}

export default CompleteProfilePage;