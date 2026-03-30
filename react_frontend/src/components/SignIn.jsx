// src/components/SignIn.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import '../App.css'; // I need this for the global glass styles
import './CreateAccount.css';
import Footer from './Footer';


function SignIn({ handleLogin }) { 
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // I'm sending my login info to my Render backend here
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('https://final-year-project-iaod.onrender.com/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to sign in.');
      }

      console.log('Login worked:', result);
      handleLogin(result.user);
      navigate('/dashboard'); // Taking me to the dashboard once I'm in
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message);
    }
  };

  return (
    <div className="auth-page fade-in">
      <Navbar />
      
      <main className="auth-container">
        {/* My glassmorphism form card */}
        <div className="auth-card">
          <h1>Welcome Back</h1>
          <p className="auth-subtitle">Sign in to manage your portfolio</p>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && <div className="error-box">{error}</div>}

            <div className="input-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="auth-submit-btn">
              Sign In
            </button>
          </form>

          <p className="auth-footer">
            Don't have an account? <span onClick={() => navigate('/create-account')}>Create one</span>
          </p>
        </div>
      </main>
    </div>
  );
}

export default SignIn;