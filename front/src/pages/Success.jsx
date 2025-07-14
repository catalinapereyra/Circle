import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Success() {
    const navigate = useNavigate();

    useEffect(() => {
        const timeout = setTimeout(() => {
            navigate('/choose-mood'); // redirige después de éxito
        }, 3000);
        return () => clearTimeout(timeout);
    }, []);

    return (
        <div className="payment-status success">
            <h1>✅ ¡Pago exitoso!</h1>
            <p>Gracias por unirte a Circle Premium 💫</p>
            <p>Redirigiendo a tu perfil...</p>
        </div>
    );
}

export default Success;