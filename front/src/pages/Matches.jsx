import React, { useEffect, useState } from "react";
import axios from "axios";

function Matches() {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMatches = async () => {
            const token = localStorage.getItem("token");

            try {
                const res = await axios.get("http://localhost:5001/match/my-matches", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const usernames = res.data.matches;

                // Ahora pedimos más datos de cada match (por ejemplo, su perfil)
                const profilePromises = usernames.map((username) =>
                    axios.get(`http://localhost:5001/profile/public/${username}`)
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
                matches.map((match) => (
                    <div key={match.username} className="match-card">
                        <img src={`/uploads/couple_photos/${match.profile_picture}`} alt={match.username} width="100" />
                        <p><strong>{match.username}</strong></p>
                        <p>{match.bio}</p>
                        <p>📍 {match.interest}</p>
                    </div>
                ))
            )}
        </div>
    );
}

export default Matches;