import React, { useEffect, useState } from "react";
import { useUserMode } from "../../contexts/UserModeContext";
import axiosInstance from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import './MyProfilePage.css'; // Asegúrate de importar el CSS

function MyProfilePage() {
    const { mode } = useUserMode();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const endpoint = mode === "couple" ? "/profile/my-couple-profile" : "/profile/my-friendship-profile";
                const response = await axiosInstance.get(endpoint);
                setProfile(response.data);
            } catch (error) {
                console.error("Error fetching your profile:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [mode]);

    const handleEditClick = () => {
        // Redirige al usuario a la página de edición del perfil
        navigate(`/edit-profile/${mode}`);
    };

    if (loading) return <p>Cargando perfil...</p>;

    if (!profile) return <p>No se encontró tu perfil.</p>;

    return (
        <div className="profile-container">
            <h2>Profile ({mode === "couple" ? "Couple" : "Friendship"})</h2>
            <img src={`data:image/jpeg;base64,${profile.profile_picture}`} alt="Foto de perfil" className="profile-img" />
            <p><strong>@{profile.username}</strong></p>
            <p>📝 {profile.bio}</p>
            <p>🎯 {profile.interest}</p>

            <div className="profile-buttons">
                <button onClick={handleEditClick} className="edit-button">
                    Edit profile
                </button>
                <button onClick={() => navigate('/home')} className="back-button">
                    Back
                </button>
            </div>
        </div>
    );
}

export default MyProfilePage;
