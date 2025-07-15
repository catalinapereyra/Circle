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
    const [showVerifyButton, setShowVerifyButton] = useState(false);

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
            const res = await fetch("http://localhost:5001/make_payment", {
                method: "POST",
                credentials: "include",
            });
            const data = await res.json();

            if (data.sandbox_init_point) {
                window.open(data.sandbox_init_point, "_blank");
                setShowVerifyButton(true);
                setShowSubPopup(false);
            } else {
                console.error("No se recibió un init point válido:", data);
            }
        } catch (err) {
            console.error("Error iniciando el pago:", err);
        }
    };

    // const handleSubscribe = async () => {
    //     try {
    //         const res = await axiosInstance.post("/user/subscribe");
    //         if (res.status === 200) {
    //             setIsPremium(true);
    //             setShowSubPopup(false);
    //             setShowWelcome(true);
    //         } else {
    //             console.error("Error activating subscription:", res.data);
    //         }
    //     } catch (err) {
    //         console.error("Error:", err);
    //     }
    // };

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
                        <p>Ohhh... No Premium Subscription yet</p>
                        <p>Do you want to activate it?</p>
                        <div className="confirm-buttons">
                            <button onClick={handleSubscribe} className="yes-btn">YES</button>
                            <button onClick={() => setShowSubPopup(false)} className="no-btn">NO</button>
                        </div>
                    </div>
                )}

                {showVerifyButton && !isPremium && (
                    <div className="confirm-popup">
                        <p>Payment done?</p>
                        <div className="confirm-buttons">
                            <button
                                className="yes-btn"
                                onClick={async () => {
                                    try {
                                        const token = localStorage.getItem("token");
                                        await fetch("http://localhost:5001/user/subscribe", {
                                            method: "POST",
                                            headers: {
                                                "Authorization": `Bearer ${token}`,
                                                "Content-Type": "application/json"
                                            }
                                        });
                                        setIsPremium(true);
                                        setShowVerifyButton(false);
                                        setShowWelcome(true);
                                    } catch (err) {
                                        console.error("Error al simular activación premium:", err);
                                    }
                                }}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                )}

                {showWelcome && (
                    <div className="confirm-popup">
                        <p>Payment done. Enjoy Premium Circle</p>
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
