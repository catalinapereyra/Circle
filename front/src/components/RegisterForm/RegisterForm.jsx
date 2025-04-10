// src/components/RegisterForm.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './RegisterForm.css';

// Iconos
import { FaUser, FaLock, FaEnvelope, FaBirthdayCake, FaVenusMars, FaMapMarkerAlt } from 'react-icons/fa';

function RegisterForm() {
    const [formData, setFormData] = useState({ // Estado inicial del formulario
        username: '',
        password: '',
        name: '',
        email: '',
        age: '',
        gender: '',
        location: '',
    });

    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => { // Guarda lo que escribe el usuario en formData
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => { // Envía los datos al backend
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5001/user/register', formData);
            setMessage(response.data.message);

            if (response.status === 201) {
                localStorage.setItem('username', formData.username);
                navigate('/choose-profile');
            }
        } catch (error) {
            setMessage('Fail to register user');
        }
    };

    return (
        <div className="register-container">
            {/* 🔵 Círculo que representa el logo */}
            <div className="logo-circle" />

            {/* 🧾 Formulario de registro */}
            <form className="register-form" onSubmit={handleSubmit}>
                {/* Input: Usuario */}
                <div className="input-group">
                    <FaUser />
                    <input name="username" placeholder="Username" onChange={handleChange} required />
                </div>

                {/* Input: Contraseña */}
                <div className="input-group">
                    <FaLock />
                    <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
                </div>

                <div className="input-group">
                    <FaUser />
                    <input name="name" placeholder="Name" onChange={handleChange} required /> {/* ✅ FIX */}
                </div>

                {/* Input: Email */}
                <div className="input-group">
                    <FaEnvelope />
                    <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
                </div>

                {/* Input: Edad */}
                <div className="input-group">
                    <FaBirthdayCake />
                    <input name="age" type="number" placeholder="Age" onChange={handleChange} />
                </div>

                {/* Input: Género */}
                <div className="input-group">
                    <FaVenusMars />
                    <select name="gender" onChange={handleChange} required>
                        <option value="">Gender</option>
                        <option value="FEMALE">Female</option>
                        <option value="MALE">Male</option>
                        <option value="OTHER">Other</option>
                    </select>
                </div>

                {/* Input: Ubicación */}
                <div className="input-group">
                    <FaMapMarkerAlt />
                    <input name="location" placeholder="Location" onChange={handleChange} />
                </div>

                {/* Botones */}
                <div className="button-group">
                    <button className="register-button" type="submit">SIGN UP</button>
                    <button className="back-button" type="button" onClick={() => navigate(-1)}>BACK</button>
                </div>
            </form>

            {/* Mensaje de feedback */}
            {message && <p>{message}</p>}
        </div>
    );
}

export default RegisterForm;