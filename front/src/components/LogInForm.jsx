// LogInForm.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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
            // Modificado para usar el puerto 5001
            const response = await axios.post('http://localhost:5001/user/login', formData);

            if (response.status === 200) {
                localStorage.setItem('username', formData.username);
                navigate('/choose-mood');
            }
        } catch (error) {
            setError('Credenciales inválidas. Por favor, inténtelo de nuevo.');
            console.error('Error al iniciar sesión:', error);
        }
    };

    return (
        <div className="login-form-container">
            <h2>Iniciar Sesión</h2>
            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="username">Nombre de usuario</label>
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
                    <label htmlFor="password">Contraseña</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>

                <button type="submit" className="submit-button">Iniciar Sesión</button>
            </form>
        </div>
    );
}

export default LogInForm;