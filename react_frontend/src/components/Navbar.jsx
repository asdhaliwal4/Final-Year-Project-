import React from 'react';
import { useNavigate, Link } from 'react-router-dom'; // I added 'Link' here to fix the crash
import '../App.css'; 
import './Navbar.css';
import logoImage from '../assets/logo-black.png';

function Navbar({ user, handleLogout }) {
  const navigate = useNavigate();

  const onLogout = () => {
    handleLogout();
    navigate('/');
  };

  return (
    <nav className="navbar fade-in">
      {/* My logo area on the left */}
      <div className="navbar-left" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        <img src={logoImage} alt="Logo" className="nav-logo" />
        <span className="brand-name">Invest & Track</span>
      </div>

      <div className="navbar-right">
        {user ? (
          <div className="nav-user-controls">
            {/* Dashboard Link */}
            <button className="nav-link-btn" onClick={() => navigate('/dashboard')}>
              Dashboard
            </button>
            
            {/* I've added my new Settings link here so it only shows when I'm logged in */}
            <button className="nav-link-btn" onClick={() => navigate('/settings')}>
              Settings
            </button>

            <span className="welcome-text">Hi, {user.first_name}</span>
            
            <button className="logout-action-btn" onClick={onLogout}>
              Logout
            </button>
          </div>
        ) : (
          <div className="nav-auth-links">
            <button className="nav-link-btn" onClick={() => navigate('/signin')}>
              Sign In
            </button>
            <button className="signup-highlight-btn" onClick={() => navigate('/create-account')}>
              Create Account
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;