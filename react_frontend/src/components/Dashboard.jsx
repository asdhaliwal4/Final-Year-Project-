import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './Navbar'; 
import AddAssetForm from './AddAssetForm';
import './Dashboard.css'; // This links the two files together

function Dashboard({ user, handleLogout }) {
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Safety check to prevent the "white screen" error
  if (!user) {
    return (
      <div className="dashboard-loader">
        <h2>Loading your profile...</h2>
      </div>
    );
  }

  const fetchPortfolio = useCallback(() => {
    setLoading(true);
    fetch(`http://localhost:5000/api/portfolio/${user.id}`)
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
    if (window.confirm("Are you sure you want to remove this asset?")) {
      try {
        const response = await fetch(`http://localhost:5000/api/assets/${assetId}`, {
          method: 'DELETE',
        });
        if (response.ok) fetchPortfolio(); // Refresh table immediately
      } catch (err) {
        console.error("Delete error:", err);
      }
    }
  };

  const totalValue = portfolio.reduce((sum, item) => sum + parseFloat(item.total_value || 0), 0);

  return (
    <div className="dashboard-wrapper">
      <Navbar user={user} handleLogout={handleLogout} />
      
      <div className="dashboard-container">
        <h1>Dashboard</h1>
        <p>Welcome, <strong>{user.first_name}</strong>!</p>

        <div className="value-card">
          <h3>Total Portfolio Value</h3>
          <h2 className="value-amount">
            ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h2>
        </div>

        <button 
          onClick={() => setShowForm(!showForm)} 
          className={`btn-action ${showForm ? 'btn-cancel' : 'btn-add'}`}
        >
          {showForm ? "Cancel" : "+ Add New Asset"}
        </button>

        {showForm && (
          <div className="form-overlay">
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
          <p>Syncing market data...</p>
        ) : error ? (
          <p className="error-text">Error: {error}</p>
        ) : (
          <div className="table-overflow">
            <table className="asset-data-table">
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Qty</th>
                  <th>Buy Price</th>
                  <th>Current Price</th>
                  <th>Total Value</th>
                  <th>Gain/Loss</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {portfolio.map((item) => (
                  <tr key={item.id}>
                    <td><strong>{item.symbol}</strong></td>
                    <td>{parseFloat(item.quantity).toFixed(2)}</td>
                    <td>${parseFloat(item.purchase_price).toFixed(2)}</td>
                    <td className="price-highlight">${parseFloat(item.current_price).toFixed(2)}</td>
                    <td>${parseFloat(item.total_value).toFixed(2)}</td>
                    <td className={item.gain_loss >= 0 ? 'gain-plus' : 'loss-minus'}>
                      {item.gain_loss >= 0 ? '+' : ''}{item.gain_loss}
                    </td>
                    <td>
                      <button className="delete-btn" onClick={() => handleDelete(item.id)}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;