import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css'; // I need this for my global theme
import './Navbar.css';
import logoImage from '../assets/logo-black.png';

function Navbar({ user, handleLogout }) {
  const navigate = useNavigate();

  // I'm handling the logout and sending them back to the start
  const onLogout = () => {
    handleLogout();
    navigate('/');
  };

  return (
    <nav className="navbar fade-in">
      {/* My logo area on the left */}
      <div className="navbar-left" onClick={() => navigate('/')}>
        <img src={logoImage} alt="Logo" className="nav-logo" />
        <span className="brand-name">Invest & Track</span>
      </div>

      <div className="navbar-right">
        {user ? (
          <div className="nav-user-controls">
            <button className="nav-link-btn" onClick={() => navigate('/dashboard')}>
              Dashboard
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