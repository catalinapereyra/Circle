import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";

function Matches() {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMatches = async () => {
            try {
                const res = await axiosInstance.get("/match/mine");

                const matchUsers = res.data; // viene como lista directa

                const profilePromises = matchUsers.map((match) =>
                    axiosInstance.get(`/profile/public/${match.username}`)
                );

                const profileResponses = await Promise.all(profilePromises);
                const profiles = profileResponses.map((r) => r.data);

                setMatches(profiles);
            } catch (err) {
                console.error("Error fetching matches:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchMatches();
    }, []);

    if (loading) return <p>Cargando matches...</p>;

    return (
        <div>
            <h2>💘 Tus matches</h2>
            {matches.length === 0 ? (
                <p>No tenés matches aún.</p>
            ) : (
                matches.map((match) => {
                    const photoPath = match.mode === "couple"
                        ? `/uploads/couple_photos/${match.profile_picture}`
                        : `/uploads/friendship_photos/${match.profile_picture}`;

                    return (
                        <div key={match.username} className="match-card">
                            <img src={photoPath} alt={match.username} width="100" />
                            <p><strong>{match.username}</strong></p>
                            <p>{match.bio}</p>
                            <p>📍 {match.interest}</p>
                        </div>
                    );
                })
            )}
        </div>
    );
}

export default Matches;
