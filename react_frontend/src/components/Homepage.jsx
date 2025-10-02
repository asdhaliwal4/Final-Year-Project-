// src/components/Homepage.jsx
import React, { useState, useEffect } from 'react';
import './Homepage.css';
import Navbar from './Navbar'; // Import the new Navbar component

function Homepage() {
  const [backendMessage, setBackendMessage] = useState('Loading...');

  // Fetch from backend safely
  useEffect(() => {
    fetch('http://localhost:5000')
      .then((res) => res.text())
      .then((data) => setBackendMessage(data))
      .catch((err) => setBackendMessage('Error: ' + err));
  }, []);

  return (
    <div className="homepage">
      <Navbar /> {/* Use the new Navbar component */}

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
  );
}

export default Homepage;