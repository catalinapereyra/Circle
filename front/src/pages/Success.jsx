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
            <h1>✅ Payment successful!</h1>
            <p>Thank you for joining Circle Premium 💫</p>
            <p>Redirecting to your profile...</p>
        </div>
    );
}

export default Success;