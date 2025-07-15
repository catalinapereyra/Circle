import './CardGameInviteModal.css';

export default function CardGameInviteModal({ isOpen, message, onAccept, onCancel }) {
    if (!isOpen) return null;

    return (
        <div className="cardgame-modal-overlay">
            <div className="cardgame-modal">
                <h2>🎴 Card Game</h2>
                <p>{message}</p>
                <div className="cardgame-buttons">
                    <button className="cancel-btn" onClick={onCancel}>Cancel</button>
                    <button className="accept-btn" onClick={onAccept}>Accept</button>
                </div>
            </div>
        </div>
    );
}

////