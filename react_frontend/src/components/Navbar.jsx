import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';
import logoImage from '../assets/logo-black.png';

function Navbar({ user, handleLogout }) {
  const navigate = useNavigate();

  const onLogout = () => {
    handleLogout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-left" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        <img src={logoImage} alt="Logo" className="logo-image" />
        <h1 className="logo-text">Invest & Track</h1>
      </div>
      <div className="navbar-right">
        {user ? (
          <>
            <button className="nav-button" onClick={() => navigate('/dashboard')}>
              Dashboard
            </button>
            <span style={{ color: '#ccc', margin: '0 1rem' }}>Welcome, {user.first_name}</span>
            <button className="nav-button" onClick={onLogout}>
              Logout
            </button>
          </>
        ) : (
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