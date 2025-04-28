// ChooseMood.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUserMode } from "../contexts/UserModeContext";
import axiosInstance from '../api/axiosInstance';


function ChooseMood() {
    const { setMode } = useUserMode(); // usar hook
    const navigate = useNavigate();
    const [profiles, setProfiles] = useState({
        has_couple_profile: false,
        has_friendship_profile: false
    });
    const [loading, setLoading] = useState(true);

    // Recuperamos el username del usuario logueado
    const username = localStorage.getItem('username');

    useEffect(() => {
        const fetchProfiles = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                console.log("No hay token, no busco perfiles");
                return;
            }

            try {
                const response = await axiosInstance.get('/profile/check-profiles');
                setProfiles(response.data);
            } catch (error) {
                console.error('Error checking profiles:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfiles();
    }, []);



    const handleCoupleModeClick = () => {
        setMode("couple"); // guardo modo elijido
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
        setMode("friendship");
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