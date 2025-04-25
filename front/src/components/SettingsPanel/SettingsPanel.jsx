// src/components/SettingsPanel.jsx
import React, { useState, useEffect } from 'react';
import './SettingsPanel.css';

function SettingsPanel({ isOpen, onClose, mode }) {
    const [showConfirm, setShowConfirm] = useState(false);
    const [hoverDelete, setHoverDelete] = useState(false);
    const [isPremium, setIsPremium] = useState(false);
    const [showSubPopup, setShowSubPopup] = useState(false);
    const [showWelcome, setShowWelcome] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            fetch("http://localhost:5001/user/me/subscription", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
                .then(res => res.json())
                .then(data => {
                    setIsPremium(data.premium);
                })
                .catch(err => console.error("Error checking subscription:", err));
        }
    }, []);

    if (!isOpen) return null;

    const handleDelete = async () => {
        const token = localStorage.getItem("token");
        try {
            const res = await fetch("http://localhost:5001/user/delete", {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await res.json();

            if (res.ok) {
                alert(data.message);
                localStorage.removeItem("token");
                window.location.href = "/";
            } else {
                console.error("Error deleting account");
            }
        } catch (err) {
            console.error("Error:", err);
        }
    };

    const handleSubscribe = async () => {
        const token = localStorage.getItem("token");
        try {
            const res = await fetch("http://localhost:5001/user/subscribe", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await res.json();

            if (res.ok) {
                setIsPremium(true);
                setShowSubPopup(false);
                setShowWelcome(true);
            } else {
                console.error("Error activating subscription:", data);
            }
        } catch (err) {
            console.error("Error:", err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.href = "/login";
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
                        {hoverDelete ? "Are you sure?" : "❌ DELETE ACCOUNT"}
                    </li>

                    <li onClick={() => !isPremium && setShowSubPopup(true)}>
                        ⭐ SUBSCRIPTION
                        {isPremium && <span className="premium-badge">✔️ Premium</span>}
                    </li>

                    <li>🔥 MATCHES</li>
                    <li onClick={() => window.location.href = "/choose-mood"}>🔄 CHANGE MODE</li>
                    <li onClick={handleLogout}>↩️ LOG OUT</li>
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
