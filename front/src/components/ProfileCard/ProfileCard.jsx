import React from "react";
import { useUserMode } from "../../contexts/UserModeContext";
import "./ProfileCard.css";

function ProfileCard({ username, age, bio, interest, profilePicture, photos = [] }) {
    const { mode } = useUserMode(); // "couple" o "friendship"
    const cardClass = `profile-card ${mode}`;
    const badgeText = mode === "couple" ? "Perfil Pareja" : "Perfil Amistad";

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
                <div className="badge">{badgeText}</div>
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