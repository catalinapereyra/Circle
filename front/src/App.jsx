import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PublicRoute from './components/PublicRoute';
import ProtectedRoute from './components/ProtectedRoute';
import { UserModeProvider } from "./contexts/UserModeContext";

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
import LikesReceived from './pages/LikesReceived.jsx';
import EditProfilePage from "./pages/EditProfilePage/EditProfilePage.jsx";
import ChatPage from "./pages/ChatPage/ChatPage.jsx";
import CompleteProfilePage from './pages/CompleteProfilePage/CompleteProfilePage.jsx';
import Success from './pages/Success.jsx';
import Pending from './pages/Pending.jsx';
import Failure from './pages/Failure.jsx';

function App() {
    return (
        <UserModeProvider>
            <Router>
                <Routes>
                    {/* Rutas públicas */}
                    <Route path="/" element={<Landing />} />
                    <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
                    <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />

                    {/* Rutas privadas */}
                    <Route path="/choose-profile" element={<ProtectedRoute><RegisterProfilePage /></ProtectedRoute>} />
                    <Route path="/couple-profile" element={<ProtectedRoute><CoupleProfilePage /></ProtectedRoute>} />
                    <Route path="/friend-profile" element={<ProtectedRoute><FriendshipProfilePage /></ProtectedRoute>} />
                    <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                    <Route path="/choose-mood" element={<ProtectedRoute><ChooseMood /></ProtectedRoute>} />
                    <Route path="/complete-profile" element={<ProtectedRoute><CompleteProfilePage /></ProtectedRoute>} /> {/* 👉 NUEVA RUTA */}
                    <Route path="/matches" element={<ProtectedRoute><Matches /></ProtectedRoute>} />
                    <Route path="/likes-received" element={<ProtectedRoute><LikesReceived /></ProtectedRoute>} />
                    <Route path="/my-couple-profile" element={<ProtectedRoute><MyProfilePage /></ProtectedRoute>} />
                    <Route path="/my-friendship-profile" element={<ProtectedRoute><MyProfilePage /></ProtectedRoute>} />
                    <Route path="/my-profile" element={<MyProfilePage />} />
                    <Route path="/edit-profile/:mode" element={<EditProfilePage />} />
                    <Route path="/chat/:username" element={<ChatPage />} />
                    <Route path="/success" element={<Success />} />
                    <Route path="/pending" element={<Pending />} />
                    <Route path="/failure" element={<Failure />} />
                </Routes>
            </Router>
        </UserModeProvider>
    );
}

export default App;