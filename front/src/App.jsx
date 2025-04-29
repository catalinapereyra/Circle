// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MyProfilePage from './pages/MyProfilePage';
import Landing from './pages/Landing/Landing.jsx';
import Register from './pages/Register';
import Login from './pages/LogIn';
import RegisterProfileType from './components/RegisterProfileType.jsx';
import CoupleProfilePage from './pages/CoupleProfilePage';
import FriendshipProfilePage from './pages/FriendshipProfilePage';
import Home from './pages/Home/Home.jsx';
import RegisterProfilePage from './pages/RegisterProfilePage';
import ChooseMood from './components/ChooseMood';
import Matches from "./pages/Matches";
import LikesReceived from './pages/LikesReceived';
import ProtectedRoute from './components/ProtectedRoute';
import { UserModeProvider } from "./contexts/UserModeContext"; // este va más abajo pero igual está bien

function App() {
    return (
        <UserModeProvider> {/* para manejar el modo couple/friendship en toda la app */}
            <Router>
                <Routes>
                    {/* Rutas públicas */}
                    <Route path="/" element={<Landing />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />

                    {/* Rutas privadas (solo si hay token) */}
                    <Route path="/choose-profile" element={<ProtectedRoute><RegisterProfilePage /></ProtectedRoute>} />
                    <Route path="/couple-profile" element={<ProtectedRoute><CoupleProfilePage /></ProtectedRoute>} />
                    <Route path="/friend-profile" element={<ProtectedRoute><FriendshipProfilePage /></ProtectedRoute>} />
                    <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                    <Route path="/choose-mood" element={<ProtectedRoute><ChooseMood /></ProtectedRoute>} />
                    <Route path="/matches" element={<ProtectedRoute><Matches /></ProtectedRoute>} />
                    <Route path="/likes-received" element={<ProtectedRoute><LikesReceived /></ProtectedRoute>} />
                    <Route path="/my-couple-profile" element={<ProtectedRoute><MyProfilePage /></ProtectedRoute>} />
                    <Route path="/my-friendship-profile" element={<ProtectedRoute><MyProfilePage /></ProtectedRoute>} />
                </Routes>
            </Router>
        </UserModeProvider>
    );
}

export default App;
