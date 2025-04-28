import { useEffect } from 'react';

function MatchModal({ username, onClose }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 6000); // Cierra automático a los 3 segundos

        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <h2>🎉 ¡Match logrado!</h2>
                <p>Con <strong>@{username}</strong></p>
            </div>
        </div>
    );
}

const styles = {
    overlay: {
        position: 'fixed',
        top: 0, left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    modal: {
        background: 'white',
        padding: '2rem',
        borderRadius: '1rem',
        textAlign: 'center',
    }
};

export default MatchModal;
