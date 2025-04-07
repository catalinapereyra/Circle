import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function FriendshipProfileForm() {
    const [formData, setFormData] = useState({
        username: '',
        bio: '',
        profilePicture: null,
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
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', width: '300px', gap: '1rem' }}>
            <h2>Create Friendship Profile</h2>
            <input name="bio" placeholder="Bio" onChange={handleChange} required />
            <input type="file" accept="image/*" onChange={handleFileChange} required />
            <button type="submit">Create Profile</button>
            <p>{message}</p>
        </form>
    );
}

export default FriendshipProfileForm;