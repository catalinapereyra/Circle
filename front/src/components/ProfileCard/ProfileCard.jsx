import React from "react";
import { useUserMode } from "../../contexts/UserModeContext";
import "./ProfileCard.css";

function ProfileCard({ username, age, bio, interest, profilePicture }) {
    const { mode } = useUserMode(); // "couple" o "friendship"

    const cardClass = `profile-card ${mode}`;
    const badgeText = mode === "couple" ? "Perfil Pareja" : "Perfil Amistad";

    return (
        <div className={cardClass}>
            <img src={profilePicture} alt={`${username}`} className="profile-picture" />
            <div className="username">{username} <span style={{ fontWeight: "normal" }}>{age}</span></div>
            <div className="interest">{interest}</div>
            <p className="bio">{bio}</p>
            <div className="badge">{badgeText}</div>
        </div>
    );
}

export default ProfileCard;