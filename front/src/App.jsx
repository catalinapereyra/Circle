import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing/Landing.jsx';
import Register from './pages/Register';
import Login from './pages/LogIn';
import RegisterProfileType from './components/RegisterProfileType.jsx';
import CoupleProfilePage from './pages/CoupleProfilePage';
import FriendshipProfilePage from './pages/FriendshipProfilePage';
import Home from './pages/Home/Home.jsx';
import RegisterProfilePage from './pages/RegisterProfilePage';
import ChooseMood from './components/ChooseMood';
import { UserModeProvider } from "./contexts/UserModeContext";
import Matches from "./pages/Matches";
import LikesReceived from './pages/LikesReceived';


function App() {
    return (
        <UserModeProvider> {/*para usar lo de almacenar el user mode*/}
            <Router>
                <Routes>
                    <Route path="/" element={<Landing />} /> {/* 👈 cambió esto */}
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/choose-profile" element={<RegisterProfilePage />} />
                    <Route path="/couple-profile" element={<CoupleProfilePage />} />
                    <Route path="/friend-profile" element={<FriendshipProfilePage />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/choose-mood" element={<ChooseMood />} />
                    <Route path="/matches" element={<Matches />} />
                    <Route path="/likes-received" element={<LikesReceived />} />
                </Routes>
            </Router>
        </UserModeProvider>
    );
}

export default App;