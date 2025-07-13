import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import MapComponent from "../../components/MapComponent.jsx";
import './CompleteProfilePage.css';

function CompleteProfilePage() {
    const [gender, setGender] = useState('');
    const [age, setAge] = useState('');
    const [location, setLocation] = useState({ latitude: null, longitude: null });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const token = localStorage.getItem('token');

        if (!location.latitude || !location.longitude) {
            setError("Seleccioná tu ubicación en el mapa.");
            return;
        }

        try {
            const response = await axios.post('http://localhost:5001/user/complete-profile', {
                gender,
                age,
                location: {
                    latitude: location.latitude,
                    longitude: location.longitude
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
        <div className="complete-profile-container">
            <h2 className="complete-profile-title">Completa tu perfil</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <form onSubmit={handleSubmit}>
                <div className="profile-form-group">
                    <label className="profile-form-label">Género:</label>
                    <select
                        value={gender}
                        onChange={e => setGender(e.target.value)}
                        required
                        className="profile-form-select"
                    >
                        <option value="">Seleccionar</option>
                        <option value="MALE">Masculino</option>
                        <option value="FEMALE">Femenino</option>
                        <option value="OTHER">Otro</option>
                    </select>
                </div>

                <div className="profile-form-group">
                    <label className="profile-form-label">Edad:</label>
                    <input
                        type="number"
                        value={age}
                        onChange={e => setAge(e.target.value)}
                        min="18"
                        required
                        className="profile-form-input"
                    />
                </div>

                <div className="map-section">
                    <label className="profile-form-label">Seleccioná tu ubicación en el mapa:</label>
                    <MapComponent
                        setLatLng={(coords) => setLocation({ latitude: coords.lat, longitude: coords.lng })}
                    />
                </div>

                <button type="submit" className="submit-button">Guardar</button>
            </form>
        </div>
    );
}

export default CompleteProfilePage;