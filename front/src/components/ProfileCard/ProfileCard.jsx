import React, { useState } from "react";
import { useUserMode } from "../../contexts/UserModeContext";
import "./ProfileCard.css";

function ProfileCard({ username, age, bio, interest, profilePicture, photos = [] }) {
    const { mode } = useUserMode(); // "couple" o "friendship"
    const cardClass = `profile-card ${mode}`;

    const allPhotos = [profilePicture, ...photos]; // primera es la profilePicture
    const [currentIndex, setCurrentIndex] = useState(0);

    const currentPhoto = allPhotos[currentIndex];

    const nextPhoto = () => {
        setCurrentIndex((prev) => (prev + 1) % allPhotos.length);
    };

    const prevPhoto = () => {
        setCurrentIndex((prev) => (prev - 1 + allPhotos.length) % allPhotos.length);
    };

    return (
        <div className={cardClass}>
            {/* Carrusel de imágenes */}
            <div className="carousel-wrapper">
                <img
                    src={currentPhoto}
                    alt="Foto actual"
                    className="main-photo"
                />
                {allPhotos.length > 1 && (
                    <>
                        <button onClick={prevPhoto} className="carousel-btn left">‹</button>
                        <button onClick={nextPhoto} className="carousel-btn right">›</button>
                    </>
                )}
            </div>

            {/* Text overlay */}
            <div className="card-overlay">
                <div className="interest">
                    <span className="interest-label">I'm into</span>{' '}
                    <strong className="interest-keyword">{interest}</strong>
                </div>
                <div className="username">{username.toUpperCase()}</div>
                <div className="age">{age}</div>
                <div className="bio">{bio}</div>
            </div>
        </div>
    );
}

export default ProfileCard;
