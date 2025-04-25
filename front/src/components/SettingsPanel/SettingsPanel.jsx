// src/components/SettingsPanel.jsx
import React, { useState } from 'react';
import './SettingsPanel.css';

function SettingsPanel({ isOpen, onClose, mode }) {
    const [showConfirm, setShowConfirm] = useState(false);
    const [hoverDelete, setHoverDelete] = useState(false);

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
                alert(data.message); // Muestra "User deleted successfully!"
                localStorage.removeItem("token");
                window.location.href = "/"; // Redirige a landing
            } else {
                console.error("Error deleting account");
            }
        } catch (err) {
            console.error("Error:", err);
        }
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
                    <li>⭐ SUBSCRIPTION</li>
                    <li>🔥 MATCHES</li>
                    <li>🔄 CHANGE MODE</li>
                    <li>↩️ LOG OUT</li>
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
            </div>
        </div>
    );
}

export default SettingsPanel;
