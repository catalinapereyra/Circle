// src/components/LoginForm.jsx
import { useState } from 'react';
import axios from 'axios';

function LoginForm() {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });

    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5001/user/login', formData);
            setMessage(response.data.message);
        } catch (error) {
            setMessage('Fail to log in');
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '300px' }}>
            <input name="username" placeholder="Username" onChange={handleChange} required />
            <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
            <button type="submit">Log In</button>
            <p>{message}</p>
        </form>
    );
}

export default LoginForm;