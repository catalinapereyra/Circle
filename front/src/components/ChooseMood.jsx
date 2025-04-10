// ChooseMood.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function ChooseMood() {
    const navigate = useNavigate();
    const [profiles, setProfiles] = useState({
        has_couple_profile: false,
        has_friendship_profile: false
    });
    const [loading, setLoading] = useState(true);

    // Recuperamos el username del usuario logueado
    const username = localStorage.getItem('username');

    useEffect(() => {
        // Verificar si el usuario ya tiene perfiles
        if (username) {
            // Asegúrate de usar la URL correcta (puerto 5001)
            axios.get(`http://localhost:5001/profile/check-profiles/${username}`)
                .then(response => {
                    console.log("Perfiles del usuario:", response.data);
                    setProfiles(response.data);
                    setLoading(false);
                })
                .catch(error => {
                    console.error('Error checking profiles:', error);
                    setLoading(false);
                });
        }
    }, [username]);

    const handleCoupleModeClick = () => {
        if (profiles.has_couple_profile) {
            // Si ya tiene perfil de pareja, llevarlo al home
            console.log("Usuario ya tiene perfil de pareja, redirigiendo a home");
            navigate('/home');
        } else {
            // Si no tiene perfil, llevarlo a crear uno
            console.log("Usuario no tiene perfil de pareja, redirigiendo a creación");
            navigate('/couple-profile');
        }
    };

    const handleFriendshipModeClick = () => {
        if (profiles.has_friendship_profile) {
            // Si ya tiene perfil de amistad, llevarlo al home
            console.log("Usuario ya tiene perfil de amistad, redirigiendo a home");
            navigate('/home');
        } else {
            // Si no tiene perfil, llevarlo a crear uno
            console.log("Usuario no tiene perfil de amistad, redirigiendo a creación");
            navigate('/friend-profile');
        }
    };

    if (loading) {
        return <div>Cargando...</div>;
    }

    return (
        <div className="choose-mood-container">
            <h2>¿Cómo quieres usar CIRCLE hoy?</h2>

            <div className="mood-buttons">
                <button onClick={handleCoupleModeClick} className="couple-button">
                    {profiles.has_couple_profile ? 'Entrar en Modo Pareja' : 'Crear Perfil de Pareja'}
                </button>

                <button onClick={handleFriendshipModeClick} className="friendship-button">
                    {profiles.has_friendship_profile ? 'Entrar en Modo Amistad' : 'Crear Perfil de Amistad'}
                </button>
            </div>
        </div>
    );
}

export default ChooseMood;