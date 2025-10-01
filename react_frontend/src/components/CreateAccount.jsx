// src/components/CreateAccount.jsx
import React, { useState } from 'react'
import './CreateAccount.css'
import logoImage from '../assets/logo-black.png'
import { useNavigate } from 'react-router-dom'

function CreateAccount() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Account created:', formData)
  }

  return (
    <div className="create-account-page">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-left">
          <img src={logoImage} alt="Logo" className="logo-image" />
          <h1 className="logo-text">Invest & Track</h1>
        </div>
        <div className="navbar-right">
          <button className="nav-button" onClick={() => navigate('/')}>Home</button>
          <button className="nav-button" onClick={() => navigate('/create-account')}>Create Account</button>
        </div>
      </nav>

      {/* Centered form */}
      <div className="form-container">
        <h1>Create Account</h1>
        <form onSubmit={handleSubmit}>
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
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
  )
}

export default CreateAccount
