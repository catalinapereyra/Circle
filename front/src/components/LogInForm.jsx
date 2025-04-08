import { useState } from 'react';
import axios from 'axios';
import {useLocation, useNavigate} from 'react-router-dom';

function LoginForm() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: '', password: '' });
    // crreo objeto formData que arranca con username y password vacio
    const [message, setMessage] = useState(''); // otro estado que se llama message para mandar log in sucedful o no
    const location = useLocation(); // para saber donde estoy navegando
    const fromRegister = location.state?.fromRegister;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5001/user/login', formData);

            //Guardas el username en el localStorage
            localStorage.setItem('username', formData.username);

            setMessage(response.data.message);
            navigate('/home', { state: { fromLogin: true } }); // o donde quieras llevar al usuario después
        } catch (error) {
            setMessage('Fail to log in');
        }
    };

    return (
        <>
            {fromRegister && <p style={{ color: 'green' }}>¡Registro exitoso! Iniciá sesión.</p>}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '300px' }}>
                <input name="username" placeholder="Username" onChange={handleChange} required />
                <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
                <button type="submit">Log In</button>
                <p>{message}</p>
            </form>
        </>
    );
}

export default LoginForm;
//holaaaa