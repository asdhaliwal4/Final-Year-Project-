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

  // I'm merging my stocks here so I don't see the same ticker twice
  const mergedPortfolio = portfolio.reduce((acc, item) => {
    const symbol = item.symbol;
    
    if (!acc[symbol]) {
      // I'm initializing the stock entry if it's the first time I see this symbol
      acc[symbol] = {
        ...item,
        quantity: parseFloat(item.quantity),
        total_cost: parseFloat(item.quantity) * parseFloat(item.purchase_price),
        // I'm saving the original ID so I can still delete if needed
        ids: [item.id],
        // I'm saving the date to show when I first added this
        date_added: item.created_at || new Date().toISOString()
      };
    } else {
      // I'm adding to the existing position if I find the same symbol again
      acc[symbol].quantity += parseFloat(item.quantity);
      acc[symbol].total_cost += parseFloat(item.quantity) * parseFloat(item.purchase_price);
      acc[symbol].ids.push(item.id);
      
      // I'm calculating the new total value and gain based on the combined quantity
      acc[symbol].total_value = acc[symbol].quantity * parseFloat(item.current_price);
      acc[symbol].gain_loss = (acc[symbol].total_value - acc[symbol].total_cost).toFixed(2);
    }
    return acc;
  }, {});

  // I'm converting my merged object back into an array so I can map it to my table
  const displayPortfolio = Object.values(mergedPortfolio).map(stock => {
    return {
      ...stock,
      // I'm calculating my Weighted Average Price: Total Cost / Total Quantity
      weighted_avg_price: (stock.total_cost / stock.quantity).toFixed(2)
    };
  });

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
                  <th>Avg. Price</th> {/* Changed from Buy Price */}
                  <th>Current</th>
                  <th>Total</th>
                  <th>Gain/Loss</th>
                  <th>Added On</th> {/* New Column */}
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {displayPortfolio.map((item) => (
                  <tr key={item.symbol}>
                    <td className="sym">
                      <Link to={`/stock/${item.symbol}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                        <strong>{item.symbol}</strong>
                      </Link>
                    </td>
                    <td>{item.quantity.toFixed(2)}</td>
                    {/* I'm showing the weighted average price here */}
                    <td>${item.weighted_avg_price}</td>
                    <td className="live-price">${parseFloat(item.current_price).toFixed(2)}</td>
                    <td>${parseFloat(item.total_value).toFixed(2)}</td>
                    <td className={item.gain_loss >= 0 ? 'profit' : 'loss'}>
                      {item.gain_loss >= 0 ? '+' : ''}{item.gain_loss}
                    </td>
                    {/* I'm formatting my date so it's easy to read */}
                    <td className="date-cell">
                      {new Date(item.date_added).toLocaleDateString('en-GB')}
                    </td>
                    <td>
                      {/* For the merged row, I'll delete the most recent entry or the whole group */}
                      <button className="remove-btn" onClick={() => handleDelete(item.ids[0])}>Remove</button>
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