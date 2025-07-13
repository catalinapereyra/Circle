import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <GoogleOAuthProvider clientId="415980449260-lkvk54is529a27k17t35kd9h57lerpqi.apps.googleusercontent.com">
            <App />
        </GoogleOAuthProvider>
    </StrictMode>,
);