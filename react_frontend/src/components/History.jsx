import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { Link } from 'react-router-dom';
import './Dashboard.css'; 

function History({ user, handleLogout }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Grab the token from the vault
    const token = localStorage.getItem('token');

    fetch(`https://final-year-project-iaod.onrender.com/api/portfolio/history/${user.id}`, {
      // Add the Authorization header
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        // Security check: if token is invalid or expired, log out
        if (res.status === 401 || res.status === 403) {
          handleLogout();
          return;
        }
        if (!res.ok) throw new Error('Failed to fetch history');
        return res.json();
      })
      .then(data => {
        setHistory(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("My history fetch failed:", err);
        setLoading(false);
      });
  }, [user.id, handleLogout]); // Added handleLogout to dependencies

  return (
    <div className="dashboard-page fade-in">
      <Navbar user={user} handleLogout={handleLogout} />
      
      <main className="dashboard-content">
        <header className="dashboard-header">
          <Link to="/dashboard" className="back-link">← Back to Portfolio</Link>
          <h1>Trade History</h1>
          <p>A record of all the assets I've removed from my tracker.</p>
        </header>

        {loading ? (
          <div className="status-msg">Loading my records...</div>
        ) : (
          <div className="table-container">
            <table className="portfolio-table">
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Quantity</th>
                  <th>Avg. Buy Price</th>
                  <th>Date Added</th>
                  <th>Date Removed</th>
                </tr>
              </thead>
              <tbody>
                {history.length > 0 ? history.map((item, index) => (
                  <tr key={index}>
                    <td className="sym"><strong>{item.symbol}</strong></td>
                    <td>{parseFloat(item.quantity).toFixed(2)}</td>
                    <td>${parseFloat(item.purchase_price).toFixed(2)}</td>
                    <td>{new Date(item.created_at).toLocaleDateString('en-GB')}</td>
                    <td className="date-removed">
                      {new Date(item.deleted_at || Date.now()).toLocaleDateString('en-GB')}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>
                      I haven't removed any assets yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default History;