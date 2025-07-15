import './CardGameResultModal.css';

function CardGameResultModal({ coincidences, onClose }) {
    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <h2>🎉 ¡Matches!</h2>
                {coincidences.length === 0 ? (
                    <p>You didn’t match on any answer 😅</p>
                ) : (
                    <ul>
                        {coincidences.map((c, i) => (
                            <li key={i}>
                                <strong>{c.question}</strong><br />
                                ✅ You both chose: <em>{c.answer}</em>
                            </li>
                        ))}
                    </ul>
                )}
                <button onClick={onClose}>Close</button>
            </div>
        </div>
    );
}

export default CardGameResultModal;
//bien