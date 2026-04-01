import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { Link } from 'react-router-dom';
import './Dashboard.css'; // I'll reuse my dashboard styles to keep it consistent

function History({ user, handleLogout }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // I'm fetching my removed assets from a new history endpoint
    fetch(`https://final-year-project-iaod.onrender.com/api/portfolio/history/${user.id}`)
      .then(res => res.json())
      .then(data => {
        setHistory(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("My history fetch failed:", err);
        setLoading(false);
      });
  }, [user.id]);

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
                    {/* I'm showing the date I deleted the asset here */}
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