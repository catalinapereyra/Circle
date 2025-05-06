import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance.js";
import { useNavigate } from "react-router-dom";
import { useUserMode } from "../../contexts/UserModeContext.jsx";
import './Matches.css'


function Matches() {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const { mode } = useUserMode();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMatches = async () => {
            try {
                const res = await axiosInstance.get("/match/mine");

                const matchUsers = res.data; // Viene como lista directa

                const profilePromises = matchUsers.map((match) =>
                    axiosInstance.get(`/profile/public/${match.username}`)
                        .then(res => ({
                            ...res.data,
                            mode: match.mode
                        }))
                );

                const profileResponses = await Promise.all(profilePromises);
                // const profiles = profileResponses.map((r) => r.data);

                setMatches(profileResponses);
            } catch (err) {
                console.error("Error fetching matches:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchMatches();
    }, []);

    if (loading) return <p>Cargando matches...</p>;

    const filteredMatches = matches.filter((match) => match.mode === mode);

    return (
        <div className="matches-container">
            <button
                onClick={() => navigate(`/${mode === "couple" ? "home" : "home"}`)}
                style={{
                    background: "none",
                    border: "none",
                    fontSize: "1.5rem",
                    cursor: "pointer",
                    position: "absolute",
                    top: "1rem",
                    left: "1rem"
                }}
            >
                ✖
            </button>

            <h2>Your Matches</h2>
            {filteredMatches.length === 0 ? (
                mode === "couple" ? (
                    <p>No matches in couple mode yet..</p>
                ) : (
                    <p>No matches in friendship mode yet..</p>
                )
            ) : (
                filteredMatches.map((match, index) => {
                    const photoPath = match.mode === "couple"
                        ? `/uploads/couple_photos/${match.profile_picture}`
                        : `/uploads/friendship_photos/${match.profile_picture}`;

                    return (
                        <div
                            key={match.username}
                            className="match-card"
                            data-aos="fade-down"
                            data-aos-duration="800"
                            data-aos-delay={index * 100} // Animación en cascada
                        >
                            <img src={photoPath} alt={match.username} width="100"/>
                            <p><strong>{match.username}</strong></p>
                            <p>{match.bio}</p>
                            <p>📚🍔🐾 {match.interest}</p>
                            <button
                                onClick={() => navigate(`/chat/${match.username}`)}
                                className="chat-button"
                                style={{
                                    marginTop: "0.5rem",
                                    padding: "0.5rem 1rem",
                                    borderRadius: "8px",
                                    backgroundColor: "#9370DB",
                                    color: "white",
                                    border: "none",
                                    cursor: "pointer"
                                }}
                            >
                                Chat 💬
                            </button>
                        </div>
                    );
                })
            )}
        </div>
    );
}

// agregar boton de ir al chat

export default Matches;
