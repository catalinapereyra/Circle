import React, { useState } from "react";
import { useUserMode } from "../../contexts/UserModeContext";
import "./ProfileCard.css";

function ProfileCard({ username, age, bio, interest, profilePicture, photos = [] }) {
    //adapta el diseño según el modo de la card
    const { mode } = useUserMode(); // "couple" o "friendship"
    const cardClass = `profile-card ${mode}`; // clase para el modo de la tarjeta

    // Correcta manipulación de los datos base64
    // La imagen de perfil podría ser base64 sin prefijo, con prefijo, o undefined
    const formattedProfilePicture = profilePicture
        ? (profilePicture.startsWith('data:image')
            ? profilePicture
            : `data:image/jpeg;base64,${profilePicture}`)
        : null;

    // Corrección para las fotos adicionales
    // Asegurarse de que procesamos correctamente los datos base64
    const formattedPhotos = photos.filter(Boolean).map(photo => {
        // Si photo es un string completo de data URL, usarlo directamente
        if (typeof photo === 'string' && photo.startsWith('data:image')) {
            return photo;
        }
        // Si photo ya incluye el prefijo 'data:image/jpeg;base64,' dentro del string, extraerlo
        else if (typeof photo === 'string' && photo.includes('data:image/jpeg;base64,')) {
            // Evitar duplicar el prefijo
            const base64Data = photo.split('data:image/jpeg;base64,').pop();
            return `data:image/jpeg;base64,${base64Data}`;
        }
        // Si es solo datos base64 sin prefijo
        else if (typeof photo === 'string') {
            return `data:image/jpeg;base64,${photo}`;
        }
        return null;
    }).filter(Boolean);

    // Depuración para ver qué está pasando con las fotos
    console.log('Original profile picture:', profilePicture);
    console.log('Formatted profile picture:', formattedProfilePicture);
    console.log('Original photos:', photos);
    console.log('Formatted photos:', formattedPhotos);

    // Juntamos la foto de perfil con las fotos adicionales
    const allPhotos = [formattedProfilePicture, ...formattedPhotos].filter(Boolean); // Filtramos posibles valores nulos
    const [currentIndex, setCurrentIndex] = useState(0); // índice de la foto actual

    const currentPhoto = allPhotos[currentIndex]; // imagen que se muestra actualmente

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
                {currentPhoto ? (
                    <img
                        src={currentPhoto}
                        alt="Foto actual"
                        className="main-photo"
                    />
                ) : (
                    <div className="placeholder-photo">No image available</div>
                )}
                {allPhotos.length > 1 && (
                    <>
                        <button onClick={prevPhoto} className="carousel-btn left">‹</button>
                        <button onClick={nextPhoto} className="carousel-btn right">›</button>
                        <div className="photo-indicator">
                            {allPhotos.map((_, index) => (
                                <span
                                    key={index}
                                    className={`indicator ${index === currentIndex ? 'active' : ''}`}
                                />
                            ))}
                        </div>
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