import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Success() {
    const navigate = useNavigate();

    useEffect(() => {
        const timeout = setTimeout(() => {
            navigate('/choose-mood');
        }, 3000);
        return () => clearTimeout(timeout);
    }, []);

    return (
        <div style={{
            minHeight: '100vh',
            width: '100%',
            background: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Space Grotesk, monospace',
            padding: '2rem',
            animation: 'fadeIn 0.8s ease-out'
        }}>
            <div style={{
                background: '#ffffff',
                border: '4px solid #000000',
                padding: '3rem 2rem',
                maxWidth: '500px',
                width: '100%',
                textAlign: 'center',
                boxShadow: '8px 8px 0px #000000',
                position: 'relative',
                animation: 'slideUp 0.6s ease-out'
            }}>
                <h1 style={{
                    fontSize: 'clamp(2rem, 6vw, 3rem)',
                    fontWeight: '700',
                    color: '#000000',
                    margin: '0 0 1.5rem 0',
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    lineHeight: '1'
                }}>
                    Payment Successful
                </h1>

                <p style={{
                    fontSize: '1.2rem',
                    fontWeight: '600',
                    color: '#000000',
                    margin: '1rem 0',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                }}>
                    Thank you for joining Circle Premium
                </p>

                <p style={{
                    fontSize: '1rem',
                    fontWeight: '500',
                    color: '#000000',
                    margin: '1.5rem 0 0 0',
                    opacity: '0.8'
                }}>
                    Redirecting to your profile...
                </p>

                {/* Loading dots */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    marginTop: '2rem'
                }}>
                    {[0, 1, 2].map(i => (
                        <div
                            key={i}
                            style={{
                                width: '12px',
                                height: '12px',
                                background: '#000000',
                                animation: `bounce 1.4s infinite ${i * 0.2}s`
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* CSS Animations as style tag */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
                
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes slideUp {
                    from { 
                        opacity: 0; 
                        transform: translateY(30px); 
                    }
                    to { 
                        opacity: 1; 
                        transform: translateY(0); 
                    }
                }
                
                @keyframes bounce {
                    0%, 20%, 50%, 80%, 100% { 
                        transform: translateY(0); 
                    }
                    40% { 
                        transform: translateY(-10px); 
                    }
                    60% { 
                        transform: translateY(-5px); 
                    }
                }
                
                @media (max-width: 768px) {
                    .payment-status {
                        padding: 1.5rem !important;
                    }
                    .payment-status > div {
                        padding: 2rem 1.5rem !important;
                        border-width: 3px !important;
                        box-shadow: 6px 6px 0px #000000 !important;
                    }
                }
                
                @media (max-width: 480px) {
                    .payment-status > div {
                        padding: 1.5rem 1rem !important;
                        border-width: 2px !important;
                        box-shadow: 4px 4px 0px #000000 !important;
                    }
                }
            `}</style>
        </div>
    );
}

export default Success;