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
            setError("Set your location on the map");
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
            <h2 className="complete-profile-title">Complete your profile</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <form onSubmit={handleSubmit}>
                <div className="profile-form-group">
                    <label className="profile-form-label">Gender:</label>
                    <select
                        value={gender}
                        onChange={e => setGender(e.target.value)}
                        required
                        className="profile-form-select"
                    >
                        <option value="">Select</option>
                        <option value="MALE">Man</option>
                        <option value="FEMALE">Women</option>
                        <option value="OTHER">other</option>
                    </select>
                </div>

                <div className="profile-form-group">
                    <label className="profile-form-label">Age:</label>
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
                    <label className="profile-form-label">Select your location on the map</label>
                    <MapComponent
                        setLatLng={(coords) => setLocation({ latitude: coords.lat, longitude: coords.lng })}
                    />
                </div>

                <button type="submit" className="submit-button">Save</button>
            </form>
        </div>
    );
}

export default CompleteProfilePage;