// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PublicRoute from './components/PublicRoute';
import ProtectedRoute from './components/ProtectedRoute';
import { UserModeProvider } from "./contexts/UserModeContext"; // este va más abajo pero igual está bien

import MyProfilePage from './pages/MyProfilePage/MyProfilePage.jsx';
import Landing from './pages/Landing/Landing.jsx';
import Register from './pages/Register';
import Login from './pages/LogIn';
import RegisterProfileType from './components/RegisterProfileType.jsx';
import CoupleProfilePage from './pages/CoupleProfilePage';
import FriendshipProfilePage from './pages/FriendshipProfilePage';
import Home from './pages/Home/Home.jsx';
import RegisterProfilePage from './pages/RegisterProfilePage';
import ChooseMood from './components/ChooseMood/ChooseMood.jsx';
import Matches from "./pages/Matches/Matches.jsx";
import LikesReceived from './pages/LikesReceived';
import EditProfilePage from "./pages/EditProfilePage/EditProfilePage.jsx";
import ChatPage from "./pages/ChatPage.jsx";




function App() {
    return (
        <UserModeProvider> {/* para manejar el modo couple/friendship en toda la app */}
            <Router>
                <Routes>
                    {/* Rutas públicas */}
                    <Route path="/" element={<Landing />} />
                    <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
                    <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />

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
                    <Route path="/my-profile" element={<MyProfilePage />} />
                    <Route path="/edit-profile/:mode" element={<EditProfilePage />} />
                    <Route path="/matches" element={<Matches />} />
                    <Route path="/chat/:username" element={<ChatPage />} />
                </Routes>
            </Router>
        </UserModeProvider>
    );
}

export default App;
