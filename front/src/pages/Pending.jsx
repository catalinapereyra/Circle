import {useEffect} from "react";
import { useNavigate } from 'react-router-dom';

function Pending() {
    const navigate = useNavigate();

    useEffect(() => {
        const timeout = setTimeout(() => {
            navigate('/choose-profile'); // redirige después de éxito
        }, 3000);
        return () => clearTimeout(timeout);
    }, []);

    return (
        <div className="payment-status pending">
            <h1>⏳ Pending payment</h1>
            <p>We're processing your payment. You can come back later to check the status.</p>
        </div>
    );
}

export default Pending;