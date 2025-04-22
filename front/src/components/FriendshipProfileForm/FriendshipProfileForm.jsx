import { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import './FriendshipProfileForm.css';
import {useUserMode} from "../../contexts/UserModeContext.jsx";

function FriendshipProfileForm() {
    const location = useLocation();
    const { setMode } = useUserMode();
    const then = location.state?.then;

    const [formData, setFormData] = useState({
        bio: '',
        profile_picture: null,
        interest: '',
        extra_photos: []
    });

    // ✅ NUEVO: Estado para mostrar la imagen como fondo del círculo
    const [preview, setPreview] = useState(null);

    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    // ✅ Manejo de cambios en campos de texto
    const handleChange = (e) => {
        const { name, value, files } = e.target;

        if (name === 'profile_picture') {
            setFormData((prev) => ({
                ...prev,
                profile_picture: files[0]  // solo una imagen
            }));
            setPreview(URL.createObjectURL(files[0])); // Muestra preview
        } else if (name === 'extra_photos') {
            setFormData((prev) => ({
                ...prev,
                extra_photos: Array.from(files)  // muchas imágenes
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();

        // Ya no enviamos el username, lo valida el backend por token
        data.append('bio', formData.bio);
        data.append('interest', formData.interest);

        if (formData.profile_picture) {
            data.append('profile_picture', formData.profile_picture);
        }

        if (formData.extra_photos.length >= 3) {
            formData.extra_photos.forEach((photo) => {
                data.append('extra_photos', photo); // el mismo nombre para todos
            });
        }

        try {
            const token = localStorage.getItem("token"); //  Autenticación con JWT

            const res = await axios.post(
                'http://localhost:5001/profile/friendship-profile',
                data,
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Se manda el token
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            setMessage('Perfil creado exitosamente');
            setMode('friendship');

            if (then) {
                navigate(then); // en este caso sería '/choose-mood'
            } else {
                navigate('/home');
            }


        } catch (err) {
            setMessage('Error al crear perfil');
            console.error("📛 Error al enviar friendship profile:", err.response?.data); // te dice qué error devolvió el back
        }
    };

    return (
        <div className="form-container friendship"> { /* lo separamos en friendship y couple para que no se superpongan */}
            <div className="form-title">create friend profile</div>

            <form className="form-wrapper" onSubmit={handleSubmit}>
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
                        onChange={handleChange}
                    />
                </label>

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

                <label className="upload-photos"> {/* area clickeable */}
                    <div className="photo-square"> {/* css */}
                        <span>UPLOAD<br/>PHOTOS</span> {/* texto visible para el usuario */}
                    </div>
                    <input
                        type="file"
                        name="extra_photos"
                        accept="image/*"
                        multiple
                        onChange={handleChange}
                        className="hidden-file"
                    />
                </label>

                {/* ✅ Botones de navegación */}
                <div className="form-buttons">
                    <button type="button" className="back-button" onClick={() => navigate(-1)}>BACK</button>
                    <button type="submit" className="submit-button">NEXT</button>
                </div>

                {/* Mensaje de éxito o error */}
                {message && <p className="form-message">{message}</p>}
            </form>
        </div>
    );
}

export default FriendshipProfileForm;
