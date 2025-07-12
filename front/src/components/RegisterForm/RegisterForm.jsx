// // src/components/RegisterForm.jsx
// import { useState } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import axios from 'axios';
// import './RegisterForm.css';
//
// import { FaUser, FaLock, FaEnvelope, FaBirthdayCake, FaVenusMars, FaMapMarkerAlt } from 'react-icons/fa';
//
// function RegisterForm() {
//     const [formData, setFormData] = useState({
//         username: '',
//         password: '',
//         name: '',
//         email: '',
//         age: '',
//         gender: '',
//         location: '',
//     });
//
//     const [wantsPremium, setWantsPremium] = useState(false);
//     const location = useLocation();
//     const withFriendship = location.state?.withFriendship || false;
//     const [message, setMessage] = useState('');
//     const navigate = useNavigate();
//
//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({ ...prev, [name]: value }));
//     };
//
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         try {
//             const response = await axios.post('http://localhost:5001/user/register', formData);
//             setMessage(response.data.message);
//
//             if (response.status === 201) {
//                 const token = response.data.access_token;
//                 localStorage.setItem('token', token);
//                 localStorage.setItem('username', formData.username);
//
//                 // si puso Premium creo la suscripcion
//                 if (wantsPremium) {
//                     await axios.post('http://localhost:5001/user/make_payment', null, {
//                         headers: { Authorization: `Bearer ${token}` }
//                     });
//                 }
//
//                 navigate('/choose-profile');
//             }
//         } catch (error) {
//             if (error.response && error.response.data && error.response.data.error) {
//                 setMessage(error.response.data.error);
//             } else {
//                 setMessage('Fail to register user');
//             }
//         }
//     };
//
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         try {
//             const response = await axios.post('http://localhost:5001/user/register', formData);
//             const token = response.data.access_token;
//             localStorage.setItem('token', token);
//             localStorage.setItem('username', formData.username);
//
//             // 2. Si no quiere Premium → ir al perfil
//             if (!wantsPremium) {
//                 navigate('/choose-profile');
//                 return;
//             }
//
//             // 3. Si quiere Premium → crear preferencia y redirigir a Mercado Pago
//             const pagoResponse = await fetch("http://localhost:5000/crear_pago", {
//                 method: "POST",
//             });
//             const data = await pagoResponse.json();
//             window.location.href = data.init_point;
//
//         } catch (error) {
//             if (error.response?.data?.error) {
//                 setMessage(error.response.data.error);
//             } else {
//                 setMessage('Fail to register user');
//             }
//         }
//     };
//
//     return (
//         <div className="register-container">
//             <div className="logo-circle" />
//
//             <form className="register-form" onSubmit={handleSubmit}>
//                 <div className="input-group">
//                     <FaUser />
//                     <input name="username" placeholder="Username" onChange={handleChange} required />
//                 </div>
//
//                 <div className="input-group">
//                     <FaLock />
//                     <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
//                 </div>
//
//                 <div className="input-group">
//                     <FaUser />
//                     <input name="name" placeholder="Name" onChange={handleChange} required />
//                 </div>
//
//                 <div className="input-group">
//                     <FaEnvelope />
//                     <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
//                 </div>
//
//                 <div className="input-group">
//                     <FaBirthdayCake />
//                     <input name="age" type="number" placeholder="Age" onChange={handleChange} />
//                 </div>
//
//                 <div className="input-group">
//                     <FaVenusMars />
//                     <select name="gender" onChange={handleChange} required>
//                         <option value="">Gender</option>
//                         <option value="FEMALE">Female</option>
//                         <option value="MALE">Male</option>
//                         <option value="OTHER">Other</option>
//                     </select>
//                 </div>
//
//                 <div className="input-group">
//                     <FaMapMarkerAlt />
//                     <input name="location" placeholder="Location" onChange={handleChange} />
//                 </div>
//
//                 <div
//                     className={`premium-option ${wantsPremium ? 'selected' : ''}`}
//                     onClick={handlePremiumClick}
//                 >
//                     {wantsPremium ? 'yes ;)' : 'Join the Premium club?'}
//                 </div>
//
//
//                 <div className="button-group">
//                     <button className="back-button" type="submit">SIGN UP</button>
//                     <button className="back-button" type="button" onClick={() => navigate(-1)}>BACK</button>
//                 </div>
//             </form>
//
//             {message && <p>{message}</p>}
//         </div>
//     );
// }
//
// export default RegisterForm;

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './RegisterForm.css';
import { FaUser, FaLock, FaEnvelope, FaBirthdayCake, FaVenusMars, FaMapMarkerAlt } from 'react-icons/fa';

function RegisterForm() {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        name: '',
        email: '',
        age: '',
        gender: '',
        location: '',
    });

    const [wantsPremium, setWantsPremium] = useState(false);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const withFriendship = location.state?.withFriendship || false;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // 1. Registrar usuario
            const response = await axios.post('http://localhost:5001/user/register', formData);
            const token = response.data.access_token;
            localStorage.setItem('token', token);
            localStorage.setItem('username', formData.username);

            // 2. Si no quiere Premium → ir al perfil
            if (!wantsPremium) {
                navigate('/choose-profile');
                return;
            }

            // 3. Si quiere Premium → crear preferencia y redirigir a Mercado Pago
            const pagoResponse = await fetch("http://localhost:5001/make_payment", {
                method: "POST",
                credentials: "include",
            });
            const data = await pagoResponse.json();
            console.log("✅ Pago response:", data);
            window.location.href = data.init_point;

        } catch (error) {
            if (error.response?.data?.error) {
                setMessage(error.response.data.error);
            } else {
                setMessage('Fail to register user');
            }
        }
    };

    return (
        <div className="register-container">
            <div className="logo-circle" />

            <form className="register-form" onSubmit={handleSubmit}>
                <div className="input-group"><FaUser /><input name="username" placeholder="Username" onChange={handleChange} required /></div>
                <div className="input-group"><FaLock /><input name="password" type="password" placeholder="Password" onChange={handleChange} required /></div>
                <div className="input-group"><FaUser /><input name="name" placeholder="Name" onChange={handleChange} required /></div>
                <div className="input-group"><FaEnvelope /><input name="email" type="email" placeholder="Email" onChange={handleChange} required /></div>
                <div className="input-group"><FaBirthdayCake /><input name="age" type="number" placeholder="Age" onChange={handleChange} /></div>
                <div className="input-group"><FaVenusMars />
                    <select name="gender" onChange={handleChange} required>
                        <option value="">Gender</option>
                        <option value="FEMALE">Female</option>
                        <option value="MALE">Male</option>
                        <option value="OTHER">Other</option>
                    </select>
                </div>
                <div className="input-group"><FaMapMarkerAlt /><input name="location" placeholder="Location" onChange={handleChange} /></div>

                <div
                    className={`premium-option ${wantsPremium ? 'selected' : ''}`}
                    onClick={() => setWantsPremium(!wantsPremium)}
                >
                    {wantsPremium ? 'yes ;)' : 'Join the Premium club?'}
                </div>

                <div className="button-group">
                    <button className="back-button" type="submit">SIGN UP</button>
                    <button className="back-button" type="button" onClick={() => navigate(-1)}>BACK</button>
                </div>
            </form>

            {message && <p>{message}</p>}
        </div>
    );
}

export default RegisterForm;