import React from "react";
import { useUserMode } from "../../contexts/UserModeContext";
import "./ProfileCard.css";
import axios from "axios";
import axiosInstance from "../../api/axiosInstance";

function ProfileCard({ username, age, bio, interest, profilePicture, photos = [] }) {
    const { mode } = useUserMode(); // "couple" o "friendship"
    const cardClass = `profile-card ${mode}`;
    const badgeText = mode === "couple" ? "Perfil Pareja" : "Perfil Amistad";
    const token = localStorage.getItem("token");

    const handleSwipe = async (type) => {
        try {
            console.log("Enviando swipe:", {
                swiped_username: username,
                type,
                mode
            });

            await axiosInstance.post("/match", {
                swiped_username: username,
                type: type, // "like" o "dislike"
                mode: mode,  // "couple" o "friend"
            });

            console.log(`✅ Swipe ${type} a ${username}`);
        } catch (error) {
            console.error("❌ Error en swipe:", error);
        }
    };



    return (
        <div className={cardClass}>
            {/* Background profile picture */}
            <img
                src={profilePicture}
                alt="Foto de perfil"
                className="main-photo"
            />

            {/* Text overlay */}
            <div className="card-overlay">
                <div className="interest">
                    <span className="interest-label">I'm into</span>{' '}
                    <strong className="interest-keyword">{interest}</strong>
                </div>
                <div className="username">{username.toUpperCase()}</div>
                <div className="age">{age}</div>
                <div className="bio">{bio}</div>
                <div className="swipe-buttons">
                    <button onClick={() => handleSwipe("dislike")}>👎</button>
                    <button onClick={() => handleSwipe("like")}>❤️</button>
                </div>
            </div>



            {/* Optional carousel */}
            {photos?.length > 0 && (
                <div className="photo-gallery">
                    {photos.map((url, i) => (
                        <img key={i} src={url} alt={`Foto ${i + 1}`} className="gallery-img" />
                    ))}
                </div>
            )}
        </div>
    );
}

export default ProfileCard;