// src/pages/Home.jsx
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useEffect, useState } from "react";
import { useUserMode } from "../../contexts/UserModeContext";
import ProfileCard from "../../components/ProfileCard/ProfileCard";
import BottomNavBar from "../../components/BottomNavBar/BottomNavBar";
import "./Home.css";
import axiosInstance from "../../api/axiosInstance";

function Home() {
    const { mode } = useUserMode(); // "couple" o "friendship"
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isPremium, setIsPremium] = useState(false);

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
                const res = await axiosInstance.get(`/profile/home/${mode}`);
                setProfiles(res.data);
            } catch (error) {
                console.error("Error fetching profiles:", error);
                setProfiles([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProfiles();
    }, [mode]);

    const handleLike = async () => {
        const currentProfile = profiles[0];
        if (!currentProfile) return;

        try {
            await axiosInstance.post('/match', {
                swiped_username: currentProfile.username,
                type: 'like',
                mode: mode,
            });
            setProfiles(prev => prev.slice(1)); // saco el primer perfil
        } catch (err) {
            console.error(err);
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
            setProfiles(prev => prev.slice(1)); // saco el primer perfil
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="home-title">Cargando perfiles...</div>;

    if (profiles.length === 0) {
        return (
            <div className={mode === "couple" ? "home-page couple-bg" : "home-page friendship-bg"}>
                <div className="home-header">
                    <h2 className="home-title">No more profiles for now! 🎉</h2>
                </div>
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

            <div className="card-grid" data-aos="fade-up">
                <ProfileCard
                    username={currentProfile.username}
                    age={currentProfile.age}
                    bio={currentProfile.bio}
                    interest={currentProfile.interest}
                    profilePicture={`http://localhost:5001/uploads/${mode}_photos/${currentProfile.profile_picture}`}
                    photos={currentProfile.photos?.map(photo => `http://localhost:5001/uploads/${mode}_photos/${photo}`)}
                />
            </div>

            <div className="home-buttons">
                <button onClick={handleDislike} className="dislike-button">👎</button>
                <button onClick={handleLike} className="like-button">❤️</button>
            </div>

            <BottomNavBar mode={mode}/>
        </div>
    );
}

export default Home;