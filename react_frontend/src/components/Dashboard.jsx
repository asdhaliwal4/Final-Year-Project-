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
    // I create a unique key for this specific user so their data stays in the right "vault"
    const CACHE_KEY = `portfolio_cache_${user.id}`;
    // I've decided to keep the data fresh for 5 minutes before I ask the server again
    const CACHE_DURATION = 5 * 60 * 1000; 

    // I start by checking if I already have a recent version of the portfolio in the browser
    const savedCache = localStorage.getItem(CACHE_KEY);
    if (savedCache) {
      const { data, timestamp } = JSON.parse(savedCache);
      const isFresh = Date.now() - timestamp < CACHE_DURATION;

      // If the saved data is still fresh, I'll just use it and stop here to save API calls
      if (isFresh) {
        setPortfolio(data);
        setLoading(false);
        return; 
      }
    }

    // If I don't have a fresh copy, I'll put the app in a loading state and fetch from the server
    setLoading(true);
    const token = localStorage.getItem('token');

    fetch(`https://final-year-project-iaod.onrender.com/api/portfolio/${user.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then((res) => {
        // I check for security issues—if the user isn't authorised, I log them out immediately
        if (res.status === 401 || res.status === 403) {
          handleLogout(); 
          return;
        }
        if (!res.ok) throw new Error('Failed to fetch portfolio');
        return res.json();
      })
      .then((data) => {
        setPortfolio(data);
        // I save a fresh copy of the data and the current time into the browser vault
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
    // I only fetch the data if a valid user is actually logged in
    if (user) fetchPortfolio();
  }, [user, fetchPortfolio]);

  const handleDelete = async (symbol) => {
    // I make sure to double-check with the user before I remove all holdings of a stock
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
          // I clear the cache now so that the deleted stock doesn't "ghost" back on the next refresh
          localStorage.removeItem(`portfolio_cache_${user.id}`);
          
          // I add a tiny delay here too just to ensure the deletion is fully processed
          setTimeout(() => {
            fetchPortfolio(); 
          }, 500);
        }
      } catch (err) {
        console.error("Delete failed:", err);
      }
    }
  };

  // I use this section to combine multiple purchases of the same stock into one single row
  const mergedPortfolio = portfolio.reduce((acc, item) => {
    const symbol = item.symbol;
    const q = parseFloat(item.quantity);
    const p = parseFloat(item.purchase_price);
    const cp = parseFloat(item.current_price || 0);
    
    if (!acc[symbol]) {
      // If I haven't seen this stock yet, I create a new entry for it and calculate initial totals
      acc[symbol] = {
        ...item,
        quantity: q,
        total_cost: q * p,
        total_value: q * cp,
        date_added: item.created_at || new Date().toISOString()
      };
    } else {
      // If I've already seen this stock, I add the new quantity and cost to the running total
      acc[symbol].quantity += q;
      acc[symbol].total_cost += q * p;
      acc[symbol].total_value = acc[symbol].quantity * cp;
    }
    
    // I calculate the total gain or loss for the combined position
    acc[symbol].gain_loss = (acc[symbol].total_value - acc[symbol].total_cost).toFixed(2);
    
    return acc;
  }, {});

  // I map over the combined stocks to calculate the weighted average price for each one
  const displayPortfolio = Object.values(mergedPortfolio).map(stock => {
    return {
      ...stock,
      weighted_avg_price: (stock.total_cost / stock.quantity).toFixed(2)
    };
  });

  // I calculate the total value of the entire portfolio here
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
                // I wipe the cache so the dashboard is forced to get fresh data from the server
                localStorage.removeItem(`portfolio_cache_${user.id}`);
                setShowForm(false);
                
                // I wait 500ms to give the Aiven database enough time to finish the update
                // before I ask for the new list. This fixes the "no immediate update" issue.
                setTimeout(() => {
                  fetchPortfolio(); 
                }, 500);
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