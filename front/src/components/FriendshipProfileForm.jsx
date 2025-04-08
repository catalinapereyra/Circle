import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function FriendshipProfileForm() {
    const [formData, setFormData] = useState({
        username: '',
        bio: '',
        profilePicture: null,
        interest: '',
    });
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        if (!storedUsername) {
            navigate('/register');
        } else {
            setFormData(prev => ({ ...prev, username: storedUsername }));
        }
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        setFormData(prev => ({
            ...prev,
            profilePicture: e.target.files[0]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = new FormData();
        form.append('username', formData.username);
        form.append('bio', formData.bio);
        form.append('profilePicture', formData.profilePicture);
        form.append('interest', formData.interest)

        try {
            const response = await axios.post('http://localhost:5001/profile/friendship-profile', form, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setMessage(response.data.message);
            navigate('/home'); // o donde quieras redirigir luego
        } catch (error) {
            setMessage('Error creating friendship profile');
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <h2>Crear Friendship Profile</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '300px' }}>
                <input type="text" value={formData.username} disabled />

                <textarea
                    name="bio"
                    placeholder="Write your bio"
                    value={formData.bio}
                    onChange={handleChange}
                    required
                />


                <textarea
                    name="interest"
                    placeholder="Write your interests!"
                    value={formData.interest}
                    onChange={handleChange}
                    required
                />

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

export default FriendshipProfileForm;