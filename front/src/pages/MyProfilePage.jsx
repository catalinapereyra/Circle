import React, { useEffect, useState } from "react";
import { useUserMode } from "../contexts/UserModeContext";
import axiosInstance from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";

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

    if (loading) return <p>Cargando perfil...</p>;

    if (!profile) return <p>No se encontró tu perfil.</p>;

    return (
        <div>
            <h2>Mi Perfil ({mode === "couple" ? "Couple" : "Friendship"})</h2>
            <img src={`data:image/jpeg;base64,${profile.profile_picture}`} alt="Foto de perfil" width="120" />
            <p><strong>@{profile.username}</strong></p>
            <p>📝 {profile.bio}</p>
            <p>🎯 {profile.interest}</p>

            <button onClick={() => navigate(-1)} style={{ marginTop: '20px' }}>
                Back
            </button>
        </div>
    );
}

export default MyProfilePage;
