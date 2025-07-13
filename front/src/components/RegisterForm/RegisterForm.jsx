import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './RegisterForm.css';
import { FaUser, FaLock, FaEnvelope, FaBirthdayCake, FaVenusMars, FaMapMarkerAlt } from 'react-icons/fa';
import MapComponent from "../MapComponent";

function RegisterForm() {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        name: '',
        email: '',
        age: '',
        gender: '',
        location: null,
    });

    const [wantsPremium, setWantsPremium] = useState(false);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const withFriendship = location.state?.withFriendship || false;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.location || !formData.location.latitude || !formData.location.longitude) {
            setMessage("Please select your location on the map.");
            return;
        }

        try {
            const payload = {
                ...formData,
                location: formData.location
            };

            const response = await axios.post('http://localhost:5001/user/register', payload);
            const token = response.data.access_token;
            localStorage.setItem('token', token);
            localStorage.setItem('username', formData.username);

            if (!wantsPremium) {
                navigate('/choose-profile');
                return;
            }

            const pagoResponse = await fetch("http://localhost:5001/make_payment", {
                method: "POST",
                credentials: "include",
            });
            const data = await pagoResponse.json();
            window.location.href = data.sandbox_init_point;

        } catch (error) {
            if (error.response?.data?.error) {
                setMessage(error.response.data.error);
            } else {
                setMessage('Fail to register user');
            }
        }
    };

    return (
        <div className="register-container">
            <div className="logo-circle" />

            <form className="register-form" onSubmit={handleSubmit}>
                <div className="input-group"><FaUser /><input name="username" placeholder="Username" onChange={handleChange} required /></div>
                <div className="input-group"><FaLock /><input name="password" type="password" placeholder="Password" onChange={handleChange} required /></div>
                <div className="input-group"><FaUser /><input name="name" placeholder="Name" onChange={handleChange} required /></div>
                <div className="input-group"><FaEnvelope /><input name="email" type="email" placeholder="Email" onChange={handleChange} required /></div>
                <div className="input-group"><FaBirthdayCake /><input name="age" type="number" placeholder="Age" onChange={handleChange} /></div>
                <div className="input-group"><FaVenusMars />
                    <select name="gender" onChange={handleChange} required>
                        <option value="">Gender</option>
                        <option value="FEMALE">Female</option>
                        <option value="MALE">Male</option>
                        <option value="OTHER">Other</option>
                    </select>
                </div>
                {/*<div className="input-group"><FaMapMarkerAlt /><input name="location" placeholder="Location" onChange={handleChange} /></div>*/}
                <div className="input-group map-group">
                    <FaMapMarkerAlt />
                    <span>Select your location on the map</span>
                </div>

                <MapComponent
                    setLatLng={(coords) =>
                        setFormData(prev => ({
                            ...prev,
                            location: {
                                latitude: coords.lat,
                                longitude: coords.lng
                            }
                        }))
                    }
                />
                <div
                    className={`premium-option ${wantsPremium ? 'selected' : ''}`}
                    onClick={() => setWantsPremium(!wantsPremium)}
                >
                    {wantsPremium ? 'yes ;)' : 'Join the Premium club?'}
                </div>

                <div className="button-group">
                    <button className="back-button" type="submit">SIGN UP</button>
                    <button className="back-button" type="button" onClick={() => navigate(-1)}>BACK</button>
                </div>
            </form>

            {message && <p>{message}</p>}
        </div>
    );
}

export default RegisterForm;