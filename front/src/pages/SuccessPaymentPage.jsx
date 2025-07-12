import { useEffect } from 'react';
import axios from 'axios';

function SuccessPaymentPage() {
    useEffect(() => {
        const confirmPremium = async () => {
            const token = localStorage.getItem("token");
            try {
                await axios.post("http://localhost:5001/user/make_payment", null, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                console.log("Premium confirmado");
            } catch (error) {
                console.error("Error confirmando Premium", error);
            }
        };

        confirmPremium();
    }, []);

    return (
        <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <h1>Enjoy our premium tools</h1>
            <p>Payment accepted</p>
        </div>
    );
}

export default SuccessPaymentPage;