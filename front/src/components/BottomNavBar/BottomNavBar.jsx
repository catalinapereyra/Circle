import React, { useState } from 'react';
import SettingsPanel from "../SettingsPanel/SettingsPanel";
import './BottomNavBar.css';
import { Link } from 'react-router-dom';

const icons = {
    settings: "https://png.pngtree.com/png-clipart/20230428/original/pngtree-settings-line-icon-png-image_9118646.png",
    heart: "https://images.icon-icons.com/2716/PNG/512/heart_icon_173090.png",
    chat: "https://cdn-icons-png.flaticon.com/512/61/61592.png",
    profile: "https://cdn-icons-png.flaticon.com/512/5989/5989226.png",
    home: "https://cdn-icons-png.flaticon.com/512/25/25694.png"
};

function BottomNavBar({ mode }) {
    const [showSettings, setShowSettings] = useState(false);

    const heartClass = mode === "couple" ? "heart-couple" : "heart-friendship";

    return (
        <>
            <div className="bottom-nav">
                <img src={icons.settings} alt="Settings" className="nav-icon" onClick={() => setShowSettings(true)} />
                <Link to="/likes-received">
                    <img src={icons.heart} alt="Likes Received" className="nav-icon" />
                </Link>
                <img src={icons.home} alt="Likes" className={`nav-icon ${heartClass}`} />
                <img src={icons.chat} alt="Chat" className="nav-icon" />
                <img src={icons.profile} alt="Profile" className="nav-icon" />

            </div>
            <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} mode={mode} />
        </>
    );
}

export default BottomNavBar;