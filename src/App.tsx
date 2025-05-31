import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import GameLobby from './pages/GameLobby';
import GameCreation from './pages/GameCreation';
import GameHistory from './pages/GameHistory';
import ProfilePage from './pages/ProfilePage';
import GameRoom from './pages/GameRoom';
import Navbar from './components/Navbar';
// import './App.css'; // Assuming you might have some global app styles here

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/lobby" element={<GameLobby />} />
        <Route path="/create" element={<GameCreation />} />
        <Route path="/history" element={<GameHistory />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/game/:gameId" element={<GameRoom />} />
        {/* Other routes will be added here later */}
      </Routes>
    </Router>
  );
}

export default App; 