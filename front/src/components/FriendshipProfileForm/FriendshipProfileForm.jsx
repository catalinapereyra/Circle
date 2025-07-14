import { useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUserMode } from "../../contexts/UserModeContext.jsx";
import backgroundFriendship from '../../assets/backgroundRegister.jpeg';
import './FriendshipProfileForm.css';
import axiosInstance from '../../api/axiosInstance';


function FriendshipProfileForm() {
    const location = useLocation();
    const { setMode } = useUserMode();
    const then = location.state?.then;
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        bio: '',
        profile_picture: null,
        interest: '',
        extra_photos: []
    });

    const [preview, setPreview] = useState(null);
    const [extraPreviews, setExtraPreviews] = useState([]);
    const [message, setMessage] = useState('');

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
            await axiosInstance.post('/profile/friendship-profile', data, {
                headers: { 'Content-Type': 'multipart/form-data' } // solo content-type
            });

            setMessage('Perfil creado exitosamente');
            setMode('friendship');

            navigate(then ?? '/choose-mood');
        } catch (err) {
            setMessage('Error al crear perfil');
            console.error("Error:", err.response?.data);
        }
    };

    return (
        <div
            className="form-container friendship"
        >
            <div className="overlay">
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

                    <textarea
                        name="bio"
                        className="form-textarea"
                        placeholder="Tell something about you"
                        value={formData.bio}
                        onChange={handleChange}
                        required
                    />

                    <textarea
                        name="interest"
                        className="form-textarea"
                        placeholder="Write your interests!"
                        value={formData.interest}
                        onChange={handleChange}
                        required
                    />

                    <div className="extra-photos-preview">
                        <label className="upload-more-photos">
                            <div className="photo-square">+</div>
                            <input
                                type="file"
                                name="extra_photos"
                                accept="image/*"
                                multiple
                                className="hidden-file"
                                onChange={handleChange}
                            />
                        </label>

                        {extraPreviews.map((src, index) => (
                            <img key={index} src={src} alt={`Preview ${index}`} className="preview-img" />
                        ))}
                    </div>

                    <div className="form-buttons">
                        <button type="button" onClick={() => navigate(-1)} className="back-button">BACK</button>
                        <button type="submit" className="back-button">NEXT</button>
                    </div>

                    <p className="form-message">{message}</p>
                </form>
            </div>
        </div>
    );
}

export default FriendshipProfileForm;