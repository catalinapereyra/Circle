import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Failure() {
    const navigate = useNavigate();

    useEffect(() => {
        const timeout = setTimeout(() => {
            navigate('/choose-profile'); // redirige después de éxito
        }, 3000);
        return () => clearTimeout(timeout);
    }, []);

    return (
        <div className="payment-status failure">
            <h1>❌ Pago rechazado</h1>
            <p>Lo podras volver a intentar luego</p>
        </div>
    );
}

export default Failure;