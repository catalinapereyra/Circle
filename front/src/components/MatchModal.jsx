import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


function MatchModal({ username, onClose }) {
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 6000); // Cierra automático a los 6 segundos

        return () => clearTimeout(timer);
    }, [onClose]);

    const handleYes = () => {
        navigate('/matches'); // Ir a la pantalla de matches
    };

    const handleNo = () => {
        onClose(); // Solo cerrar el modal y quedarse en Home
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <h2>🎉 ¡Match logrado!</h2>
                <p>Con <strong>@{username}</strong></p>
                <p style={{ marginTop: '1rem' }}>Do you want to chat?</p>
                <div style={styles.buttonContainer}>
                    <button onClick={handleYes} style={styles.buttonYes}>Yes</button>
                    <button onClick={handleNo} style={styles.buttonNo}>No</button>
                </div>
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
    },
    buttonContainer: {
        marginTop: '1rem',
        display: 'flex',
        justifyContent: 'center',
        gap: '1rem'
    },
    buttonYes: {
        padding: '0.5rem 1rem',
        backgroundColor: 'pink',
        border: 'none',
        borderRadius: '8px',
        fontWeight: 'bold',
        cursor: 'pointer'
    },
    buttonNo: {
        padding: '0.5rem 1rem',
        backgroundColor: 'gray',
        border: 'none',
        borderRadius: '8px',
        fontWeight: 'bold',
        cursor: 'pointer'
    }
};


export default MatchModal;