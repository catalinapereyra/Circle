import {useState, useEffect} from 'react';
import {useNavigate, useLocation} from 'react-router-dom';
import axios from 'axios';
import './CoupleProfileForm.css'; // importo style
// FORMATO GENERAL
/* <label className="estilo-contenedor"> -> conectado a CSS
  <div className="lo-que-el-usuario-ve">
    <span>Texto o ícono o imagen</span>
  </div>

  <input
    type="TIPO"
    name="NOMBRE_DEL_INPUT"
    accept="..." // si aplica
    multiple // si aplica
    onChange={handleChange}
    className="hidden" // ocultar el input real
  />
</label>

 */

function CoupleProfileForm() {
    const navigate = useNavigate();
    const location = useLocation();

    const [formData, setFormData] = useState({
        username: '',
        bio: '',
        preferences: 'all', // default value
        profile_picture: null,
        interest: '',
        extra_photos: []
    });

    const [message, setMessage] = useState('');

    // Recuperar username desde localStorage
    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        if (!storedUsername) {
            navigate('/register');
        } else {
            setFormData((prev) => ({...prev, username: storedUsername}));
        }
    }, [navigate]);

    // Manejar cambios en inputs
    const handleChange = (e) => {
        const {name, value, files} = e.target;

        if (name === 'profile_picture') {
            setFormData((prev) => ({
                ...prev,
                profile_picture: files[0]  // solo una imagen
            }));
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

    // Enviar formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('username', formData.username);
        data.append('bio', formData.bio);
        data.append('preferences', formData.preferences);
        data.append('interest', formData.interest)
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
        <div className="form-container couple"> {/* NUEVO: fondo negro y padding */}
            <h2 className="form-title">create couple profile</h2> {/* NUEVO: título más sutil */}

            <form onSubmit={handleSubmit} className="form-wrapper"> {/* NUEVO: usa flex column + gap */}

                <label className="upload-profile-photo"> {/* NUEVO: círculo rosa con texto */}
                    <div className="photo-circle">
                        <span>UPLOAD<br />PROFILE<br />PHOTO</span>
                    </div>
                    <input
                        type="file"
                        name="profile_picture"
                        accept="image/*"
                        onChange={handleChange}
                        className="hidden-file" // NUEVO: ocultar input original
                    />
                </label>

                <label className="form-label">WHAT'S YOUR NAME?</label> {/* NUEVO: estilo rosa y mayúscula */}
                <input
                    type="text"
                    value={formData.username}
                    disabled
                    className="form-input" // NUEVO: sin fondo, subrayado rosa
                />

                <label className="form-label">WRITE YOUR BIO</label> {/* NUEVO */}
                <textarea
                    name="bio"
                    placeholder="Write your bio"
                    value={formData.bio}
                    onChange={handleChange}
                    required
                    className="form-textarea"
                />

                <label className="form-label">WHO CATCHES YOUR EYE...</label> {/* NUEVO */}
                <select
                    name="preferences"
                    value={formData.preferences}
                    onChange={handleChange}
                    className="form-select"
                >
                    <option value="women">Women</option>
                    <option value="men">Men</option>
                    <option value="both">Both</option>
                    <option value="all">All</option>
                </select>

                <textarea
                    name="interest"
                    placeholder="Write your interests!"
                    value={formData.interest}
                    onChange={handleChange}
                    required
                    className="form-textarea"
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

                <div className="form-buttons"> {/* NUEVO: botones separados */}
                    <button type="button" onClick={() => navigate(-1)} className="back-button">BACK</button>
                    {/* NUEVO */}
                    <button type="submit" className="submit-button">READY</button>
                    {/* NUEVO */}
                </div>

                <p className="form-message">{message}</p> {/* NUEVO: texto de feedback centrado */}
            </form>
        </div>
);
}

export default CoupleProfileForm;