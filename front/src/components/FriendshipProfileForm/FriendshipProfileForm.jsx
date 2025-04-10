import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './FriendshipProfileForm.css'; // ✅ Importamos los estilos nuevos

function FriendshipProfileForm() {
    // ✅ Estado para manejar los datos del formulario
    const [formData, setFormData] = useState({
        username: '',
        bio: '',
        profilePicture: null,
        interest: '',
    });

    // ✅ NUEVO: Estado para mostrar la imagen como fondo del círculo
    const [preview, setPreview] = useState(null);

    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    // ✅ Recuperamos el username del localStorage al cargar
    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        if (!storedUsername) {
            navigate('/register');
        } else {
            setFormData(prev => ({ ...prev, username: storedUsername }));
        }
    }, [navigate]);

    // ✅ Manejo de cambios en campos de texto
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // ✅ Manejo de imagen y creación de preview
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPreview(URL.createObjectURL(file)); // ✅ NUEVO: Creamos una URL para mostrar como fondo
            setFormData(prev => ({
                ...prev,
                profilePicture: file
            }));
        }
    };

    // ✅ Manejo de envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = new FormData();
        form.append('username', formData.username);
        form.append('bio', formData.bio);
        form.append('profilePicture', formData.profilePicture);
        form.append('interest', formData.interest);

        try {
            const response = await axios.post('http://localhost:5001/profile/friendship-profile', form, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setMessage(response.data.message);
            navigate('/home');
        } catch (error) {
            setMessage('Error creating friendship profile');
        }
    };

    return (
        <div className="form-container friendship"> { /* lo separamos en friendship y couple para que no se superpongan */}
            <div className="form-title">create friend profile first</div>

            <form className="form-wrapper" onSubmit={handleSubmit}>
                {/* ✅ Círculo de subir foto con preview */}
                <label className="upload-photo">
                    <div
                        className="photo-circle"
                        style={{ backgroundImage: preview ? `url(${preview})` : 'none' }}
                    >
                        {!preview && <span>UPLOAD<br />PHOTO</span>}
                    </div>
                    <input
                        type="file"
                        name="profile_picture"
                        accept="image/*"
                        className="hidden-file"
                        onChange={handleFileChange}
                    />
                </label>

                {/* ✅ Nombre (desactivado porque viene del localStorage) */}
                <label className="form-label">WHAT'S YOUR NAME?</label>
                <input
                    type="text"
                    name="username"
                    className="form-input"
                    value={formData.username}
                    disabled
                />

                {/* ✅ Bio */}
                <label className="form-label">WRITE YOUR BIO</label>
                <textarea
                    name="bio"
                    className="form-textarea"
                    placeholder="Tell something about you"
                    value={formData.bio}
                    onChange={handleChange}
                    required
                />

                {/* ✅ Intereses (no se muestra en screenshot, pero mantenido por lógica) */}
                <textarea
                    name="interest"
                    className="form-textarea"
                    placeholder="Write your interests!"
                    value={formData.interest}
                    onChange={handleChange}
                    required
                />

                {/* ✅ Botones de navegación */}
                <div className="form-buttons">
                    <button type="button" className="back-button" onClick={() => navigate(-1)}>BACK</button>
                    <button type="submit" className="submit-button">NEXT</button>
                </div>

                {/* ✅ Mensaje de éxito o error */}
                {message && <p className="form-message">{message}</p>}
            </form>
        </div>
    );
}

export default FriendshipProfileForm;