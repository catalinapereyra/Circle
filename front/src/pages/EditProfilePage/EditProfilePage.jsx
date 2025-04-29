import React, { useEffect, useState } from "react";
import { useUserMode } from "../../contexts/UserModeContext.jsx";
import axiosInstance from "../../api/axiosInstance.js";
import { useNavigate, useParams } from "react-router-dom";
import './EditProfilePage.css'; // Importar el CSS

function EditProfilePage() {
    const { mode } = useUserMode();
    const { mode: profileMode } = useParams(); // Obtener el 'mode' de la URL
    const [profile, setProfile] = useState(null);
    const [bio, setBio] = useState("");
    const [interest, setInterest] = useState("");
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(""); // Estado para el mensaje
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const endpoint = mode === "couple" ? "/profile/my-couple-profile" : "/profile/my-friendship-profile";
                const response = await axiosInstance.get(endpoint);
                setProfile(response.data);
                setBio(response.data.bio);
                setInterest(response.data.interest);
            } catch (error) {
                console.error("Error fetching your profile:", error);
                setMessage("Hubo un error al cargar tu perfil.");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [mode]);

    const handleSaveChanges = async () => {
        // Validar que los campos obligatorios no estén vacíos
        if (!bio || !interest) {
            setMessage("Por favor, completa los campos de bio e intereses.");
            return;  // Evitar enviar la solicitud si hay campos vacíos en el perfil
        }

        // Preparar los datos de perfil
        const profileData = { bio, interest, mode: profileMode };
        console.log("Datos del perfil a enviar:", profileData);

        console.log("Datos del perfil:", profileData);  // Verifica los datos antes de enviarlos

        try {
            // Actualizar el perfil
            const response = await axiosInstance.put(`/profile/update-profile`, profileData);

            if (response.data.message === "profile updated successfully") {
                setMessage("profile updated successfully");  // Mostrar mensaje de éxito
                navigate(`/my-profile`)}

                // // Si el usuario ha modificado su email o contraseña, actualizamos también los datos del usuario
            // if (email || password) {
            //     const userData = { email, password };
            //     await axiosInstance.put(`/user/update-user`, userData);
            // }

            setMessage("Perfil actualizado con éxito!"); // Mensaje de éxito
            navigate(`/my-profile`);
        } catch (error) {
            console.error("Error updating profile:", error);
            setMessage("Hubo un error al guardar los cambios. Por favor, inténtalo de nuevo."); // Mensaje de error
        }
    };
    const handleBackClick = () => {
        navigate('/my-profile'); // Redirige al usuario a la página de Mi Perfil
    };

    if (loading) return <p>Cargando perfil...</p>;

    return (
        <div className="edit-profile-container">
            <h2>Editar Perfil ({profileMode === "couple" ? "Couple" : "Friendship"})</h2>
            <form onSubmit={(e) => e.preventDefault()}>
                <div>
                    <label>Bio:</label>
                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Escribe algo sobre ti..."
                    />
                </div>
                <div>
                    <label>Intereses:</label>
                    <input
                        type="text"
                        value={interest}
                        onChange={(e) => setInterest(e.target.value)}
                        placeholder="¿Qué te interesa?"
                    />
                </div>

                {/* Mostrar el mensaje de éxito o error */}
                {message && <div className={`message ${message.includes('éxito') ? 'message-success' : 'message-error'}`}>{message}</div>}

                <button className="save-button" onClick={handleSaveChanges}>
                    Guardar Cambios
                </button>

                <button className="back-button" onClick={handleBackClick}>
                    Volver a Mi Perfil
                </button>
            </form>
        </div>
    );
}

export default EditProfilePage;