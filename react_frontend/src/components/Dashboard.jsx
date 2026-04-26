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

  const fetchPortfolio = useCallback(() => {
    // Unique key for this user's data in the browser vault
    const CACHE_KEY = `portfolio_cache_${user.id}`;
    // Set cache life to 5 minutes
    const CACHE_DURATION = 5 * 60 * 1000; 

    // Check if we have a saved version of the portfolio in the browser
    const savedCache = localStorage.getItem(CACHE_KEY);
    if (savedCache) {
      const { data, timestamp } = JSON.parse(savedCache);
      const isFresh = Date.now() - timestamp < CACHE_DURATION;

      // If the saved data is still fresh, use it and stop the function
      if (isFresh) {
        setPortfolio(data);
        setLoading(false);
        return; 
      }
    }

    // If no fresh cache exists, fetch from the live server
    setLoading(true);
    const token = localStorage.getItem('token');

    fetch(`https://final-year-project-iaod.onrender.com/api/portfolio/${user.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then((res) => {
        if (res.status === 401 || res.status === 403) {
          handleLogout(); 
          return;
        }
        if (!res.ok) throw new Error('Failed to fetch portfolio');
        return res.json();
      })
      .then((data) => {
        setPortfolio(data);
        // Save the fresh data and current time to the browser vault
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          data: data,
          timestamp: Date.now()
        }));
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [user.id, handleLogout]);

  useEffect(() => {
    if (user) fetchPortfolio();
  }, [user, fetchPortfolio]);

  const handleDelete = async (symbol) => {
    if (window.confirm(`Are you sure you want to remove all ${symbol} shares?`)) {
      try {
        const token = localStorage.getItem('token');

        const response = await fetch(`https://final-year-project-iaod.onrender.com/api/portfolio/remove-all/${symbol}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.status === 401 || response.status === 403) {
          handleLogout();
          return;
        }

        if (response.ok) {
          // Clear the cache so the deleted stock stays gone on refresh
          localStorage.removeItem(`portfolio_cache_${user.id}`);
          fetchPortfolio(); 
        }
      } catch (err) {
        console.error("Delete failed:", err);
      }
    }
  };

  const mergedPortfolio = portfolio.reduce((acc, item) => {
    const symbol = item.symbol;
    
    if (!acc[symbol]) {
      acc[symbol] = {
        ...item,
        quantity: parseFloat(item.quantity),
        total_cost: parseFloat(item.quantity) * parseFloat(item.purchase_price),
        date_added: item.created_at || new Date().toISOString()
      };
    } else {
      acc[symbol].quantity += parseFloat(item.quantity);
      acc[symbol].total_cost += parseFloat(item.quantity) * parseFloat(item.purchase_price);
      acc[symbol].total_value = acc[symbol].quantity * parseFloat(item.current_price);
      acc[symbol].gain_loss = (acc[symbol].total_value - acc[symbol].total_cost).toFixed(2);
    }
    return acc;
  }, {});

  const displayPortfolio = Object.values(mergedPortfolio).map(stock => {
    return {
      ...stock,
      weighted_avg_price: (stock.total_cost / stock.quantity).toFixed(2)
    };
  });

  const totalValue = portfolio.reduce((sum, item) => sum + parseFloat(item.total_value || 0), 0);

  if (!user) return <div className="loading-screen"><div className="spinner"></div></div>;

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
          
          <div className="secondary-actions">
            <Link to="/history" className="action-link">View History →</Link>
            <Link to="/watchlist" className="action-link">My Watchlist →</Link>
          </div>
        </div>

        {showForm && (
          <div className="form-card-wrapper">
            <AddAssetForm 
              user={user} 
              onComplete={() => {
                // Wipe the cache so the new asset appears immediately
                localStorage.removeItem(`portfolio_cache_${user.id}`);
                setShowForm(false);
                fetchPortfolio(); 
              }} 
            />
          </div>
        )}

        {loading && portfolio.length === 0 ? (
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
                  <th>Avg. Price</th>
                  <th>Current</th>
                  <th>Total</th>
                  <th>Gain/Loss</th>
                  <th>Added On</th>
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
                    <td>${item.weighted_avg_price}</td>
                    <td className="live-price">${parseFloat(item.current_price).toFixed(2)}</td>
                    <td>${(item.quantity * parseFloat(item.current_price)).toFixed(2)}</td>
                    <td className={parseFloat(item.gain_loss) >= 0 ? 'profit' : 'loss'}>
                      {parseFloat(item.gain_loss) >= 0 ? '+' : ''}{item.gain_loss}
                    </td>
                    <td className="date-cell">
                      {new Date(item.date_added).toLocaleDateString('en-GB')}
                    </td>
                    <td>
                      <button className="remove-btn" onClick={() => handleDelete(item.symbol)}>
                        Remove
                      </button>   
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