import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

function CoupleProfileForm() {
    const navigate = useNavigate();
    const location = useLocation();

    const [formData, setFormData] = useState({
        username: '',
        bio: '',
        preferences: 'all', // default value
        profile_picture: null,
    });

    const [message, setMessage] = useState('');

    // Recuperar username desde localStorage
    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        if (!storedUsername) {
            navigate('/register');
        } else {
            setFormData((prev) => ({ ...prev, username: storedUsername }));
        }
    }, [navigate]);

    // Manejar cambios en inputs
    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'profile_picture') {
            setFormData((prev) => ({ ...prev, profile_picture: files[0] }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    // Enviar formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('username', formData.username);
        data.append('bio', formData.bio);
        data.append('preferences', formData.preferences); // ✅ CORREGIDO
        if (formData.profile_picture) {
            data.append('profile_picture', formData.profile_picture);
        }

        try {
            const res = await axios.post('http://localhost:5001/profile/couple-profile', data);
            setMessage('Perfil creado exitosamente');

            const then = location.state?.then;
            if (then) {
                navigate(then);
            } else {
                navigate('/home');
            }
        } catch (err) {
            setMessage('Error al crear perfil');
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <h2>Crear Couple Profile</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '300px' }}>
                <input type="text" value={formData.username} disabled />

                <textarea
                    name="bio"
                    placeholder="Escribí tu bio"
                    value={formData.bio}
                    onChange={handleChange}
                    required
                />

                <label>
                    <strong>Who catches your eye?</strong>
                    <select
                        name="preferences"
                        value={formData.preferences}  // ✅ CORREGIDO
                        onChange={handleChange}
                    >
                        <option value="women">Women</option>
                        <option value="men">Men</option>
                        <option value="both">Both</option>
                        <option value="all">All</option>
                    </select>
                </label>

                <input
                    type="file"
                    name="profile_picture"
                    accept="image/*"
                    onChange={handleChange}
                />

                <button type="submit">Crear Perfil</button>
                <p>{message}</p>
            </form>
        </div>
    );
}

export default CoupleProfileForm;