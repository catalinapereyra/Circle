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
            <h1>⏳ Pago pendiente</h1>
            <p>Estamos procesando tu pago. Podés volver más tarde para verificar el estado.</p>
        </div>
    );
}

export default Pending;