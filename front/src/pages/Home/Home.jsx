import AOS from 'aos';
import 'aos/dist/aos.css';
import { useEffect, useState } from "react";
import { useUserMode } from "../../contexts/UserModeContext";
import ProfileCard from "../../components/ProfileCard/ProfileCard";
import "./Home.css";

function Home() {
    const { mode } = useUserMode(); // "couple" o "friendship"
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        AOS.init({
            duration: 800,
            once: true
        });
    }, []);

    useEffect(() => {
        console.log("🏷️ Modo actual:", mode);
        if (!mode) return;

        const fetchProfiles = async () => {
            try {
                const response = await fetch(`http://localhost:5001/profile/home/${mode}`);
                const data = await response.json();
                setProfiles(data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching profiles:", error);
                setLoading(false);
            }
        };

        fetchProfiles();
    }, [mode]);

    if (loading) return <div className="home-title">Cargando perfiles...</div>;

    return (
        <div className={mode === "couple" ? "home-page couple-bg" : "home-page friendship-bg"}>
            <div className="home-header">
                <div className="home-logo"></div>
                <h2 className="home-title">
                    Explorá perfiles en modo {mode === "couple" ? "pareja 💖" : "amistad 🌟"}
                </h2>
            </div>

            <div className="card-grid">
                {profiles.map((user, index) => (
                    <div data-aos="fade-up" key={index}>
                        <ProfileCard
                            username={user.username}
                            bio={user.bio}
                            interest={user.interest}
                            profilePicture={`http://localhost:5001/uploads/${mode}_photos/${user.profile_picture}`}
                            photos={user.photos?.map(photo => `http://localhost:5001/uploads/${mode}_photos/${photo}`)}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Home;