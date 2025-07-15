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
            <h1>❌ Payment rejected</h1>
            <p>You can try again later</p>
        </div>
    );
}

export default Failure;