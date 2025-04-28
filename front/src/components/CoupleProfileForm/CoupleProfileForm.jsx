import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './CoupleProfileForm.css';
import backgroundRegister from '../../assets/backgroundRegister.jpeg';
import { useUserMode } from "../../contexts/UserModeContext.jsx";

function CoupleProfileForm() {
    const navigate = useNavigate();
    const location = useLocation();
    const { setMode } = useUserMode();
    const then = location.state?.then;

    const [formData, setFormData] = useState({
        bio: '',
        preferences: '',
        profile_picture: null,
        interest: '',
        extra_photos: []
    });

    const [message, setMessage] = useState('');
    const [preview, setPreview] = useState(null);
    const [extraPreviews, setExtraPreviews] = useState([]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;

        if (name === 'profile_picture') {
            setFormData(prev => ({ ...prev, profile_picture: files[0] }));
            setPreview(URL.createObjectURL(files[0]));
        } else if (name === 'extra_photos') {
            const filesArray = Array.from(files);
            setFormData(prev => ({ ...prev, extra_photos: [...prev.extra_photos, ...filesArray] }));
            const newPreviews = filesArray.map(file => URL.createObjectURL(file));
            setExtraPreviews(prev => [...prev, ...newPreviews]);
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

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
            await axios.post('http://localhost:5001/profile/couple-profile', data, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
            });

            setMessage('Perfil creado exitosamente');
            setMode('couple');
            if (formData.preferences === 'both') {
                navigate('/create-friend', { state: { then: '/choose-mood' } });
            } else {
                navigate(then ? then : '/home');
            }
        } catch (err) {
            setMessage('Error al crear perfil');
            console.error(err.response?.data);
        }
    };

    return (
        <div
            className="form-container couple"
            style={{ backgroundImage: `url(${backgroundRegister})` }}
        >
            <div className="overlay">
                <form onSubmit={handleSubmit} className="form-wrapper">
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

                    <textarea
                        name="bio"
                        placeholder="Write your bio"
                        value={formData.bio}
                        onChange={handleChange}
                        required
                        className="form-textarea"
                    />

                    <select
                        name="preferences"
                        value={formData.preferences}
                        onChange={handleChange}
                        className="form-select"
                        required
                    >
                        <option value="" disabled hidden>Who catches your eye...?</option>
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


                    <div className="extra-photos-preview">
                        <label className="upload-more-photos">
                            <div className="photo-square">
                                <span>+</span>
                            </div>
                            <input
                                type="file"
                                name="extra_photos"
                                accept="image/*"
                                multiple
                                className="hidden-file"
                                onChange={handleChange}
                            />
                        </label>

                        <div className="extra-photos-preview">
                            {extraPreviews.map((src, index) => (
                                <img key={index} src={src} alt={`Extra preview ${index}`} className="preview-img" />
                            ))}
                        </div>
                    </div>

                    <div className="form-buttons">
                        <button type="button" onClick={() => navigate(-1)} className="back-button">BACK</button>
                        <button type="submit" className="submit-button">READY</button>
                    </div>

                    <p className="form-message">{message}</p>
                </form>
            </div>
        </div>
    );
}

export default CoupleProfileForm;