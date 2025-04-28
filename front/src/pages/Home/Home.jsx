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
    const [subMessage, setSubMessage] = useState('');

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
                setSubMessage(res.data.message || '');
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


    if (loading) return <div className="home-title">Cargando perfiles...</div>;

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

            <div className="card-grid">
                {profiles.map((user, index) => (
                    <div data-aos="fade-up" key={index}>
                        <ProfileCard
                            username={user.username}
                            age={user.age}
                            bio={user.bio}
                            interest={user.interest}
                            profilePicture={`http://localhost:5001/uploads/${mode}_photos/${user.profile_picture}`}
                            photos={user.photos?.map(photo => `http://localhost:5001/uploads/${mode}_photos/${photo}`)}
                        />
                    </div>
                ))}
            </div>

            <BottomNavBar mode={mode} /> {/* ✅ NUEVO: NavBar fija abajo con modo */}
        </div>
    );
}

export default Home;
