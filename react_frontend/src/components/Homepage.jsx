// src/components/Homepage.jsx
import React, { useState, useEffect } from 'react'
 import './Homepage.css' // optional for debugging
import logoImage from '../assets/logo-black.png' // optional for debugging
import { useNavigate, useNavigationType } from 'react-router-dom'

function Homepage() {
  const [backendMessage, setBackendMessage] = useState('Loading...')
  
  let navigate
  try {
    navigate = useNavigate()
  } catch (e) {
    navigate = null
  }

  // Fetch from backend safely
  useEffect(() => {
    fetch('http://localhost:5000')
      .then((res) => res.text())
      .then((data) => setBackendMessage(data))
      .catch((err) => setBackendMessage('Error: ' + err))
  }, [])

  // Safe navigation function
  const safeNavigate = (path) => {
    if (navigate) navigate(path)
    else console.log('Navigation attempted to', path, 'but no Router is set up.')
  }

  return (
    <div className="homepage">
      <nav className="navbar">
        <div className="navbar-left">
          { <img src={logoImage} alt="Logo" className="logo-image" /> }
          <h1 className="logo-text">Invest & Track</h1>
        </div>

        <div className="navbar-right">
          <button className="nav-button" onClick={() => safeNavigate('/signin')}>
            Sign In
          </button>
          <button className="nav-button" onClick={() => safeNavigate('/create-account')}>
            Create Account
          </button>
        </div>
      </nav>

      <header>
        <h2>
          Track your investments, monitor stock prices, and manage your portfolio efficiently.
        </h2>
      </header>

      <section className="section portfolio-summary">
        <h2>Portfolio Summary</h2>
        <p>Total Value: $0.00</p>
        <p>Gain/Loss: $0.00</p>
      </section>

      <section className="section recent-transactions">
        <h2>Recent Transactions</h2>
        <ul>
          <li>No transactions yet</li>
        </ul>
      </section>

      <section className="section backend-message">
        <p>{backendMessage}</p>
      </section>
    </div>
  )
}

export default Homepage
