import axios from 'axios';
// src/pages/Home.jsx


import { useUserMode } from "../contexts/UserModeContext";

function Home() {
    const { mode } = useUserMode();

    return <div>Estás en modo: {mode}</div>; // ⬅️ debería decir "couple" o "friendship"
}
export default Home;
