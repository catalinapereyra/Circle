// src/components/SettingsPanel.jsx
import React, { useState, useEffect } from 'react';
import './SettingsPanel.css';
import axiosInstance from "../../api/axiosInstance";
import { useUserMode } from "../../contexts/UserModeContext"; // usar contexto global

function SettingsPanel({ isOpen, onClose, mode }) {
    const { isPremium, setIsPremium } = useUserMode(); // traer el estado global de premium
    const [showConfirm, setShowConfirm] = useState(false);
    const [hoverDelete, setHoverDelete] = useState(false);
    const [showSubPopup, setShowSubPopup] = useState(false);
    const [showWelcome, setShowWelcome] = useState(false);

    useEffect(() => {
        const checkSubscription = async () => {
            try {
                const res = await axiosInstance.get("/user/me/subscription");
                setIsPremium(res.data.premium);
            } catch (err) {
                console.error("Error checking subscription:", err);
            }
        };

        checkSubscription();
    }, [setIsPremium]);

    if (!isOpen) return null;

    const handleDelete = async () => {
        try {
            const res = await axiosInstance.delete("/user/delete");
            if (res.status === 200) {
                alert(res.data.message);
                localStorage.removeItem("token");
                localStorage.removeItem("username");
                window.location.href = "/";
            } else {
                console.error("Error deleting account");
            }
        } catch (err) {
            console.error("Error:", err);
        }
    };

    const handleSubscribe = async () => {
        try {
            const res = await axiosInstance.post("/user/subscribe");
            if (res.status === 200) {
                setIsPremium(true); // 💥 Cambiar a premium globalmente
                setShowSubPopup(false);
                setShowWelcome(true);
            } else {
                console.error("Error activating subscription:", res.data);
            }
        } catch (err) {
            console.error("Error:", err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        window.location.href = "/";
    };

    return (
        <div className={`settings-overlay ${mode}`}>
            <div className="settings-panel">
                <button className="close-btn" onClick={onClose}>CLOSE</button>
                <ul>
                    <li
                        className="danger-option"
                        onMouseEnter={() => setHoverDelete(true)}
                        onMouseLeave={() => setHoverDelete(false)}
                        onClick={() => setShowConfirm(true)}
                    >
                        {hoverDelete ? "Are you sure?" : "Delete Account"}
                    </li>

                    <li onClick={() => !isPremium && setShowSubPopup(true)}>
                        Subscription
                        {isPremium && <span className="premium-badge"> :Premium</span>}
                    </li>

                    <li onClick={() => window.location.href = "/choose-mood"}>
                        Change Mode
                    </li>

                    <li onClick={handleLogout}>Log Out</li>
                </ul>

                {showConfirm && (
                    <div className="confirm-popup">
                        <p>Are you sure you want to delete your Circle account?</p>
                        <div className="confirm-buttons">
                            <button onClick={handleDelete} className="yes-btn">YES</button>
                            <button onClick={() => setShowConfirm(false)} className="no-btn">NO</button>
                        </div>
                    </div>
                )}

                {showSubPopup && (
                    <div className="confirm-popup">
                        <p>😢 Ohhh... No Premium Subscription</p>
                        <p>Do you want to activate it?</p>
                        <div className="confirm-buttons">
                            <button onClick={handleSubscribe} className="yes-btn">YES</button>
                            <button onClick={() => setShowSubPopup(false)} className="no-btn">NO</button>
                        </div>
                    </div>
                )}

                {showWelcome && (
                    <div className="confirm-popup">
                        <p>✨ Bienvenidx a Circle Premium</p>
                        <div className="confirm-buttons">
                            <button onClick={() => setShowWelcome(false)} className="yes-btn">OK</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default SettingsPanel;
