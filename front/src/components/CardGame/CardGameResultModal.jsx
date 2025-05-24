import "./CardGameResultModal.css";

function CardGameResultModal({ coincidences, onClose }) {
    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <h2>🎉 ¡Coincidencias!</h2>
                {coincidences.length === 0 ? (
                    <p>No coincidieron en ninguna respuesta 😅</p>
                ) : (
                    <ul>
                        {coincidences.map((c, i) => (
                            <li key={i}>
                                <strong>{c.question}</strong><br />
                                ✅ Ambos eligieron: <em>{c.answer}</em>
                            </li>
                        ))}
                    </ul>
                )}
                <button onClick={onClose}>Cerrar</button>
            </div>
        </div>
    );
}

export default CardGameResultModal;
