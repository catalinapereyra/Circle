import { createContext, useContext, useState } from 'react';

// Creamos el contexto
const UserModeContext = createContext();

// Hook personalizado para usarlo fácilmente
export const useUserMode = () => useContext(UserModeContext);

// Proveedor del contexto
export const UserModeProvider = ({ children }) => {
    const [mode, setMode] = useState(null); // 'couple' o 'friendship'

    return (
        <UserModeContext.Provider value={{ mode, setMode }}>
            {children}
        </UserModeContext.Provider>
    );
};