// src/components/Navbar.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';
import logoImage from '../assets/logo-black.png';

function Navbar({ user, handleLogout }) { // Accept user and handleLogout as props
  const navigate = useNavigate();

  const onLogout = () => {
    handleLogout(); // Clears the user state in App.jsx
    navigate('/'); // Redirects to the homepage
  };

  return (
    <nav className="navbar">
      <div className="navbar-left" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        <img src={logoImage} alt="Logo" className="logo-image" />
        <h1 className="logo-text">Invest & Track</h1>
      </div>
      <div className="navbar-right">
        {user ? (
          // If a user is logged in, it'll show a welcome message and Logout button
          <>
            <span style={{ color: '#ccc', marginRight: '1rem' }}>Welcome, {user.first_name}</span>
            <button className="nav-button" onClick={onLogout}>
              Logout
            </button>
          </>
        ) : (
          // If no user is logged in, show the Sign In and Create Account buttons
          <>
            <button className="nav-button" onClick={() => navigate('/signin')}>
              Sign In
            </button>
            <button className="nav-button" onClick={() => navigate('/create-account')}>
              Create Account
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;