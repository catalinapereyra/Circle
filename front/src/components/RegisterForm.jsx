// src/components/RegisterForm.jsx
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function RegisterForm() {
    const [formData, setFormData] = useState({ // aca seteo el formato del form, es decir que cosas van a aparecer para llenar
        // el use State es crear un estado de un objeto. formData es el objeto que tiene todos estos datos
        username: '',
        password: '',
        name: '',
        age: '',
        email: '',
        gender: '',
        location: '',
    });

    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => { // Cuando alguien escriba en un input, guardá ese valor en formData usando el name del campo como clave, es como que cada vez que escribo algo nuevo que sigue en el from me va creando mi objeto user
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => { // es para saber si funciono o no, y aparte lo conecta con axios
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5001/user/register', formData);
            setMessage(response.data.message);

            if (response.status === 201) {
                navigate('/login'); //  Redirige al login
            }
        } catch (error) {
            setMessage('Fail to register user');
        }
    };

    return ( // defino formulario
        // lo que dice input es para hacer el cuadradito
        //  Campo especial: type
        // 	•	type="password": oculta lo que se escribe.
        // 	•	type="number": permite solo números (ideal para edad).
        // 	•	type="email": verifica que sea un email válido (como algo@dominio.com).
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '300px' }}>
            <input name="username" placeholder="Username" onChange={handleChange} required />
            <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
            <input name="name" placeholder="Nombre" onChange={handleChange} />
            <input name="age" type="number" placeholder="Edad" onChange={handleChange} />
            <input name="email" type="email" placeholder="Email" onChange={handleChange} />
            <select name="gender" onChange={handleChange} required>
                <option value="">Gender</option>
                <option value="FEMALE">Female</option>
                <option value="MALE">Male</option>
                <option value="OTHER">Other</option>
            </select>
            <input name="location" placeholder="location" onChange={handleChange} />
            <button type="submit">Sign Up</button>
        </form>
    );
}

export default RegisterForm;