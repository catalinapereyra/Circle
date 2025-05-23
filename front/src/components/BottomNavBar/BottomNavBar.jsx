import React, { useState } from 'react';
import SettingsPanel from "../SettingsPanel/SettingsPanel";
import './BottomNavBar.css';
import { Link, useNavigate } from 'react-router-dom';
import { useUserMode } from "../../contexts/UserModeContext"; // 👈 Importante: usar el hook

const icons = {
    settings: "https://png.pngtree.com/png-clipart/20230428/original/pngtree-settings-line-icon-png-image_9118646.png",
    heart: "https://images.icon-icons.com/2716/PNG/512/heart_icon_173090.png",
    chat: "https://cdn-icons-png.flaticon.com/512/61/61592.png",
    profile: "https://cdn-icons-png.flaticon.com/512/5989/5989226.png",
    home: "https://cdn-icons-png.flaticon.com/512/25/25694.png"
};

function BottomNavBar({ mode }) {
    const { isPremium } = useUserMode(); //treaer si el usuario es premium
    const [showSettings, setShowSettings] = useState(false);
    const navigate = useNavigate();

    const heartClass = mode === "couple" ? "heart-couple" : "heart-friendship";

    const handleChatClick = () => {
        navigate('/matches'); // navegar a matches
    };


    const handleProfileClick = () => {
        if (mode === "couple") {
            navigate("/my-couple-profile");
        } else if (mode === "friendship") {
            navigate("/my-friendship-profile");
        }
    };


    return (
        <>
            <div className="bottom-nav">
                <img src={icons.settings} alt="Settings" className="nav-icon" onClick={() => setShowSettings(true)}/>

                {/* Solo mostrar el corazón si el user es premium */}
                {isPremium && (
                    <Link to="/likes-received">
                        <img src={icons.heart} alt="Likes Received" className="nav-icon"/>
                    </Link>
                )}

                <img src={icons.home} alt="Home" className={`nav-icon ${heartClass}`}/>
                <img src={icons.chat} alt="Chat" className="nav-icon" onClick={handleChatClick}/>
                <img src={icons.profile} alt="Profile" className="nav-icon" onClick={handleProfileClick}/>
            </div>

            <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} mode={mode} />
        </>
    );
}

export default BottomNavBar;
