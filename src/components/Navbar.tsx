import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useWallet } from "../context/WalletContext";
import "./Navbar.css";

const Navbar: React.FC = () => {
  const { isConnected } = useWallet();
  const location = useLocation();

  // Mock game stats - replace with actual data from your game context
  const playerStats = {
    level: 12,
    xp: 1850,
    maxXp: 2500,
    coins: 1250,
    streak: 7,
  };

  if (!isConnected) {
    return null;
  }

  const xpProgress = (playerStats.xp / playerStats.maxXp) * 100;

  const navItems = [
    { to: "/lobby", label: "Arena", icon: "⚔️" },
    { to: "/history", label: "History", icon: "📜" },
    { to: "/profile", label: "Profile", icon: "👤" },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo Section */}
        <Link to="/lobby" className="logo">
          <div className="logo-icon">⚡</div>
          <div className="logo-text">
            <h1>TypeRace Monad</h1>
            <span>Elite Arena</span>
          </div>
        </Link>

        {/* Player Stats */}
        <div className="player-stats">
          <div className="stat-item coins">
            <span className="stat-icon">🪙</span>
            <span className="stat-value">
              {playerStats.coins.toLocaleString()}
            </span>
          </div>

          <div className="stat-item streak">
            <span className="stat-icon">🔥</span>
            <span className="stat-value">{playerStats.streak}</span>
          </div>

          <div className="level-badge">
            <div className="level-content">
              <span className="level-icon">⭐</span>
              <span className="level-text">Lv {playerStats.level}</span>
            </div>
            <div className="xp-bar">
              <div
                className="xp-progress"
                style={{ width: `${xpProgress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="nav-links">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`nav-link ${
                location.pathname === item.to ? "active" : ""
              }`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
