// este file es para guardar en que mode estoy para que se use en toda la app
import { createContext, useContext, useState } from 'react';

// contexto
const UserModeContext = createContext();

// hook
export const useUserMode = () => useContext(UserModeContext);


export const UserModeProvider = ({ children }) => {
    const [mode, setMode] = useState(null); // Puede ser "couple" o "friendship"

    return (
        <UserModeContext.Provider value={{ mode, setMode }}>
            {children}
        </UserModeContext.Provider>
    );
};