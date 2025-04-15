import React from "react";
import { useUserMode } from "../../contexts/UserModeContext";
import "./ProfileCard.css";

function ProfileCard({ username, age, bio, interest, profilePicture, photos = [] })  {
    const { mode } = useUserMode(); // "couple" o "friendship"

    const cardClass = `profile-card ${mode}`;
    const badgeText = mode === "couple" ? "Perfil Pareja" : "Perfil Amistad";

    return (
        <div className={cardClass}>
            <img
                src={profilePicture}
                alt="Foto de perfil"
                className="main-profile-picture"
            />
            <div className="username">
                {username} <span style={{ fontWeight: "normal" }}>{age}</span>
            </div>
            <div className="interest">{interest}</div>
            <p className="bio">{bio}</p>
            <div className="badge">{badgeText}</div>

            {/* 🎠 Carrusel de fotos */}
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