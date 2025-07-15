export default function CardGameInviteModal({ isOpen, message, onAccept, onCancel }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full">
                <h2 className="text-lg font-bold mb-2">🎴 Juego de cartas</h2>
                <p className="mb-4">{message}</p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onAccept}
                        className="bg-pink-600 text-white hover:bg-pink-700 px-4 py-2 rounded"
                    >
                        Aceptar
                    </button>
                </div>
            </div>
        </div>
    );
}

////