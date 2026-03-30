import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar'; 
import AddAssetForm from './AddAssetForm';
import Footer from './Footer';
import '../App.css'; 
import './Dashboard.css'; 

function Dashboard({ user, handleLogout }) {
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  if (!user) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  const fetchPortfolio = useCallback(() => {
    setLoading(true);
    fetch(`https://final-year-project-iaod.onrender.com/api/portfolio/${user.id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch portfolio');
        return res.json();
      })
      .then((data) => {
        setPortfolio(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [user.id]);

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  const handleDelete = async (assetId) => {
    if (window.confirm("Are you sure you want to delete this?")) {
      try {
        const response = await fetch(`https://final-year-project-iaod.onrender.com/api/assets/${assetId}`, {
          method: 'DELETE',
        });
        if (response.ok) fetchPortfolio(); 
      } catch (err) {
        console.error("Delete failed:", err);
      }
    }
  };

  const totalValue = portfolio.reduce((sum, item) => sum + parseFloat(item.total_value || 0), 0);

  return (
    <div className="dashboard-page fade-in">
      <Navbar user={user} handleLogout={handleLogout} />
      
      <main className="dashboard-content">
        <header className="dashboard-header">
          <h1>My Portfolio</h1>
          <p>Welcome back, <span>{user.first_name}</span></p>
        </header>

        <div className="total-value-card">
          <p className="label">Total Portfolio Value</p>
          <h2 className="amount">
            ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h2>
        </div>

        <div className="action-bar">
          <button 
            onClick={() => setShowForm(!showForm)} 
            className={`add-btn ${showForm ? 'cancel' : ''}`}
          >
            {showForm ? "Close Form" : "+ Add Asset"}
          </button>
        </div>

        {showForm && (
          <div className="form-card-wrapper">
            <AddAssetForm 
              user={user} 
              onComplete={() => {
                setShowForm(false);
                fetchPortfolio(); 
              }} 
            />
          </div>
        )}

        {loading ? (
          <div className="status-msg">Syncing with markets...</div>
        ) : error ? (
          <div className="status-msg error">{error}</div>
        ) : (
          <div className="table-container">
            <table className="portfolio-table">
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Quantity</th>
                  <th>Buy Price</th>
                  <th>Current</th>
                  <th>Total</th>
                  <th>Gain/Loss</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {portfolio.map((item) => (
                  <tr key={item.id}>
                    {/* Wrapped the Link inside a td to fix the HTML nesting error */}
                    <td className="sym">
                      <Link to={`/stock/${item.symbol}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                        <strong>{item.symbol}</strong>
                      </Link>
                    </td>
                    <td>{parseFloat(item.quantity).toFixed(2)}</td>
                    <td>${parseFloat(item.purchase_price).toFixed(2)}</td>
                    <td className="live-price">${parseFloat(item.current_price).toFixed(2)}</td>
                    <td>${parseFloat(item.total_value).toFixed(2)}</td>
                    <td className={item.gain_loss >= 0 ? 'profit' : 'loss'}>
                      {item.gain_loss >= 0 ? '+' : ''}{item.gain_loss}
                    </td>
                    <td>
                      <button className="remove-btn" onClick={() => handleDelete(item.id)}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default Dashboard;