// src/pages/Home.jsx
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useEffect, useState } from "react";
import { useUserMode } from "../../contexts/UserModeContext";
import ProfileCard from "../../components/ProfileCard/ProfileCard";
import BottomNavBar from "../../components/BottomNavBar/BottomNavBar";
import "./Home.css";
import axiosInstance from "../../api/axiosInstance";
import MatchModal from "../../components/MatchModal.jsx";

function Home() {
    const { mode } = useUserMode(); // "couple" o "friendship"
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isPremium, setIsPremium] = useState(false);
    const [matchUsername, setMatchUsername] = useState(null);
    const [nearbyOnly, setNearbyOnly] = useState(false);


    useEffect(() => {
        AOS.init({
            duration: 800,
            once: true
        });
    }, []);

    useEffect(() => {
        const checkSubscription = async () => {
            try {
                const res = await axiosInstance.get('/user/me/subscription');
                setIsPremium(res.data.premium);
            } catch (err) {
                console.error("Error al verificar suscripción:", err);
            }
        };

        checkSubscription();
    }, []);

    useEffect(() => {
        if (!mode) return;

        const fetchProfiles = async () => {
            try {
                let url = `/profile/home/${mode}`;
                if (nearbyOnly) {
                    url += '?radius=100';
                }

                const res = await axiosInstance.get(url);
                setProfiles(res.data);
            } catch (error) {
                console.error("Error fetching profiles:", error);
                setProfiles([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProfiles();
    }, [mode, nearbyOnly]);

    const handleLike = async () => {
        const currentProfile = profiles[0];
        if (!currentProfile) return;

        try {
            const response = await axiosInstance.post('/match', {
                swiped_username: currentProfile.username,
                type: 'like',
                mode: mode,
            });

            if (response.data.match) {
                setMatchUsername(response.data.username); // mostramos el modal

                // 💬 Nuevo: Esperamos 6s para sacar el perfil, después de mostrar modal
                setTimeout(() => {
                    setProfiles(prev => prev.slice(1));
                    setMatchUsername(null);
                }, 6000);
            } else {
                // Si no hay match, saco inmediatamente
                setProfiles(prev => prev.slice(1));
            }
        } catch (err) {
            console.error("Error al hacer like:", err);
            setProfiles(prev => prev.slice(1));
        }
    };




    const handleDislike = async () => {
        const currentProfile = profiles[0];
        if (!currentProfile) return;

        try {
            await axiosInstance.post('/match', {
                swiped_username: currentProfile.username,
                type: 'dislike',
                mode: mode,
            });
        } catch (err) {
            console.error("Error al hacer dislike:", err);
            // Aunque falle el post, seguimos igual
        } finally {
            setProfiles(prev => prev.slice(1)); // pase lo que pase, saco el primer perfil
        }
    };


    if (loading) return <div className="home-title">Cargando perfiles...</div>;


    if (profiles.length === 0) {
        return (
            <div className={mode === "couple" ? "home-page couple-bg" : "home-page friendship-bg"}>
                <div className="home-header">
                    <h2 className="home-title">No more profiles for now!</h2>
                </div>

                <label>
                    <input
                        type="checkbox"
                        checked={nearbyOnly}
                        onChange={() => setNearbyOnly(!nearbyOnly)}
                    />
                    Solo personas cercanas (100 km)
                </label>

                <BottomNavBar mode={mode} />
            </div>
        );
    }

    const currentProfile = profiles[0];

    return (
        <div className={mode === "couple" ? "home-page couple-bg" : "home-page friendship-bg"}>
            <div className="home-header">
                <div className="home-logo"></div>
                <h2 className="home-title">
                    {mode === "couple"
                        ? "Swipe slow… this could get serious"
                        : "Good friends are hard to find… unless you swipe"}
                </h2>
            </div>
            <label>
                <input
                    type="checkbox"
                    checked={nearbyOnly}
                    onChange={() => setNearbyOnly(!nearbyOnly)}
                />
                Solo personas cercanas (100 km)
            </label>

            <div className="card-grid" data-aos="fade-up">
                <ProfileCard
                    username={currentProfile.username}
                    age={currentProfile.age}
                    bio={currentProfile.bio}
                    interest={currentProfile.interest}
                    profilePicture={`data:image/jpeg;base64,${currentProfile.profile_picture}`}
                    photos={currentProfile.photos?.map(photo => `http://localhost:5001/uploads/${mode}_photos/${photo}`)}
                />
            </div>

            <div className="home-buttons">
                <button onClick={handleDislike} className="dislike-button">👎</button>
                <button onClick={handleLike} className="like-button">❤️</button>
            </div>

            {matchUsername && <MatchModal username={matchUsername} onClose={() => setMatchUsername(null)} />}

            <BottomNavBar mode={mode}/>
        </div>
    );
}

export default Home;