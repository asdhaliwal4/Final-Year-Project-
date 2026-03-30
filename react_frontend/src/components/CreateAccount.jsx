// src/components/CreateAccount.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import '../App.css'; // I need this to see my global glass styles
import './CreateAccount.css'; 
import Footer from './Footer';


function CreateAccount() {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    email: '',
    password: '',
  });
  
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); 

    // I'm checking if the email looks legit first
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Invalid email format. Please enter a valid email.');
      return; 
    }

    // Making sure they are at least 18 before letting them in
    const today = new Date();
    const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    const birthDate = new Date(formData.date_of_birth);

    if (birthDate > eighteenYearsAgo) {
      setError('You must be at least 18 years old to create an account.');
      return; 
    }

    try {
      const response = await fetch('https://final-year-project-iaod.onrender.com/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Network response was not ok');
      }

      console.log('Account created!', result);
      alert('Account created successfully!');
      
      // I'm sending them to the sign-in page now that they are registered
      navigate('/signin');
    } catch (error) {
      console.error('Error creating account:', error);
      setError(error.message || 'Failed to create account. Please try again.');
    }
  };

  return (
    <div className="auth-page fade-in">
      <Navbar />

      <main className="auth-container">
        {/* My glassmorphism registration card */}
        <div className="auth-card">
          <h1>Join Invest & Track</h1>
          <p className="auth-subtitle">Start managing your portfolio today</p>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && <div className="error-box">{error}</div>}

            <div className="input-row">
              <div className="input-group">
                <label htmlFor="first_name">First Name</label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="last_name">Last Name</label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="date_of_birth">Date of Birth</label>
              <input
                type="date"
                id="date_of_birth"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="email">Email</label>
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
              Create My Account
            </button>
          </form>

          <p className="auth-footer">
            Already have an account? <span onClick={() => navigate('/signin')}>Sign in</span>
          </p>
        </div>
      </main>
    </div>
  );
}

export default CreateAccount;