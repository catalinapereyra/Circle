import {useState, useEffect} from 'react';
import {useNavigate, useLocation} from 'react-router-dom';
import axios from 'axios';
import './CoupleProfileForm.css';

function CoupleProfileForm() {
    const navigate = useNavigate();
    const location = useLocation();

    const [formData, setFormData] = useState({
        bio: '',
        preferences: 'all',
        profile_picture: null,
        interest: '',
        extra_photos: []
    });

    const [message, setMessage] = useState('');

    // 🔁 Manejar cambios en inputs
    const handleChange = (e) => {
        const { name, value, files } = e.target;

        if (name === 'profile_picture') {
            setFormData((prev) => ({
                ...prev,
                profile_picture: files[0]
            }));
        } else if (name === 'extra_photos') {
            setFormData((prev) => ({
                ...prev,
                extra_photos: Array.from(files)
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value
            }));
        }
    };

    // ✅ Enviar formulario con token en headers
    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();

        data.append('bio', formData.bio);
        data.append('preferences', formData.preferences);
        data.append('interest', formData.interest);

        if (formData.profile_picture) {
            data.append('profile_picture', formData.profile_picture);
        }

        if (formData.extra_photos.length >= 3) {
            formData.extra_photos.forEach(photo => {
                data.append('extra_photos', photo);
            });
        }

        try {
            const token = localStorage.getItem("token");

            const res = await axios.post(
                'http://localhost:5001/profile/couple-profile',
                data,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            setMessage('Perfil creado exitosamente');

            const then = location.state?.then;
            if (then) {
                navigate(then);
            } else {
                navigate('/home');
            }
        } catch (err) {
            setMessage('Error al crear perfil');
            console.error("📛 Error al enviar couple profile:", err.response?.data);
        }
    };

    return (
        <div className="form-container couple">
            <h2 className="form-title">create couple profile</h2>

            <form onSubmit={handleSubmit} className="form-wrapper">
                <label className="upload-profile-photo">
                    <div className="photo-circle">
                        <span>UPLOAD<br />PROFILE<br />PHOTO</span>
                    </div>
                    <input
                        type="file"
                        name="profile_picture"
                        accept="image/*"
                        onChange={handleChange}
                        className="hidden-file"
                    />
                </label>

                <label className="form-label">WRITE YOUR BIO</label>
                <textarea
                    name="bio"
                    placeholder="Write your bio"
                    value={formData.bio}
                    onChange={handleChange}
                    required
                    className="form-textarea"
                />

                <label className="form-label">WHO CATCHES YOUR EYE...</label>
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

                <label className="upload-photos">
                    <div className="photo-square">
                        <span>UPLOAD<br />PHOTOS</span>
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

                <div className="form-buttons">
                    <button type="button" onClick={() => navigate(-1)} className="back-button">BACK</button>
                    <button type="submit" className="submit-button">READY</button>
                </div>

                <p className="form-message">{message}</p>
            </form>
        </div>
    );
}

export default CoupleProfileForm;