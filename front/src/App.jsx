import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Register from './pages/Register';
import Login from './pages/LogIn';
import RegisterProfileType from './components/RegisterProfileType.jsx';
import CoupleProfilePage from './pages/CoupleProfilePage';
import FriendshipProfilePage from './pages/FriendshipProfilePage';
import Home from './components/Home';
import RegisterProfilePage from './pages/RegisterProfilePage';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Landing />} /> {/* 👈 cambió esto */}
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/choose-profile" element={<RegisterProfilePage />} />
                <Route path="/couple-profile" element={<CoupleProfilePage />} />
                <Route path="/friend-profile" element={<FriendshipProfilePage />} />
                <Route path="/home" element={<Home />} />
            </Routes>
        </Router>
    );
}

export default App;