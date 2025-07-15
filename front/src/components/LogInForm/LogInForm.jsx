import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
import './LogInForm.css';

function LogInForm() {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await axios.post('http://localhost:5001/user/login', formData);

            if (response.status === 200) {
                localStorage.setItem('token', response.data.access_token);
                localStorage.setItem('username', formData.username);
                navigate('/choose-mood');
            }

        } catch (error) {
            setError('Invalid credentials. Please try again.');
            console.error('Login error:', error);
        }
    };

    return (
        <>
            <div className="logo-center"></div>

            <div className="login-form-container">
                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button type="submit" className="back-button">Log IN</button>
                    <button className="back-button" type="button" onClick={() => navigate(-1)}>BACK</button>
                </form>

                {/* 🔽 Google Sign In */}
                <div className="google-login-container" style={{ marginTop: '1rem', textAlign: 'center' }}>
                    <p>o</p>
                    <GoogleLogin
                        onSuccess={credentialResponse => {
                            const token = credentialResponse.credential;

                            axios.post('http://localhost:5001/user/google-login', { token })
                                .then(res => {
                                    const { access_token, username, needs_profile_completion } = res.data;

                                    localStorage.setItem('token', access_token);
                                    localStorage.setItem('username', username);

                                    if (needs_profile_completion) {
                                        navigate('/complete-profile');
                                    } else {
                                        navigate('/choose-mood');
                                    }
                                })
                                .catch(err => {
                                    console.error("Error with Google login:", err);
                                    setError("Couldn't sign in with Google");
                                });
                        }}
                        onError={() => {
                            setError("Google login failed.");
                            console.log("Google Login Failed");
                        }}
                    />
                </div>
            </div>
        </>
    );
}

export default LogInForm;