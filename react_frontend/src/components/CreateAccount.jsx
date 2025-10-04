// src/components/CreateAccount.jsx
import React, { useState } from 'react';
import './CreateAccount.css';
import Navbar from './Navbar'; // Import the Navbar component

function CreateAccount() {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    email: '',
    password: '',
  });
  // New state to hold validation error messages
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors on a new submission

    // Client-Side Validation 

    // Email Format Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Invalid email format. Please enter a valid email.');
      return; // Stop the form submission
    }

    //Age Validation - must be 18 or older
    const today = new Date();
    const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    const birthDate = new Date(formData.date_of_birth);

    if (birthDate > eighteenYearsAgo) {
      setError('You must be at least 18 years old to create an account.');
      return; // Stop the form submission
    }

    //  End Validation 

    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        // Use the error message from the backend if available
        throw new Error(result.message || 'Network response was not ok');
      }

      console.log('Account created successfully:', result);
      alert('Account created successfully!');
      // redirect the user after successful registration
      // navigate('/signin');
    } catch (error) {
      console.error('Error creating account:', error);
      // Display the error message from the backend or a generic one
      setError(error.message || 'Failed to create account. Please try again.');
    }
  };

  return (
    <div className="create-account-page">
      <Navbar />

      <div className="form-container">
        <h1>Create Account</h1>
        <form onSubmit={handleSubmit}>
          {/* Element to display validation errors */}
          {error && <p className="error-message">{error}</p>}

          <label htmlFor="first_name">First Name</label>
          <input
            type="text"
            id="first_name"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            required
          />

          <label htmlFor="last_name">Last Name</label>
          <input
            type="text"
            id="last_name"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            required
          />

          <label htmlFor="date_of_birth">Date of Birth</label>
          <input
            type="date"
            id="date_of_birth"
            name="date_of_birth"
            value={formData.date_of_birth}
            onChange={handleChange}
            required
          />

          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <button type="submit" className="submit-button">
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateAccount;