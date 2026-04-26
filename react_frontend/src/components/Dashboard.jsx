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

  // I've simplified this function to always fetch fresh data from my Render backend
  const fetchPortfolio = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`https://final-year-project-iaod.onrender.com/api/portfolio/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401 || response.status === 403) {
        handleLogout(); 
        return;
      }

      if (!response.ok) throw new Error('Failed to fetch portfolio');
      
      const data = await response.json();
      
      // I'm logging this to the console so I can verify the new stocks are arriving
      console.log("Real-time portfolio data received:", data);
      
      setPortfolio(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, [user.id, handleLogout]);

  // I trigger the fetch the moment the component loads
  useEffect(() => {
    if (user) fetchPortfolio();
  }, [user, fetchPortfolio]);

  const handleDelete = async (symbol) => {
    if (window.confirm(`Are you sure you want to remove all ${symbol} shares?`)) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`https://final-year-project-iaod.onrender.com/api/portfolio/remove-all/${symbol}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          // I fetch the latest data immediately after a successful deletion
          fetchPortfolio(); 
        }
      } catch (err) {
        console.error("Delete failed:", err);
      }
    }
  };

  // I merge individual transactions into a single row per stock symbol
  const mergedPortfolio = portfolio.reduce((acc, item) => {
    const symbol = item.symbol;
    const q = parseFloat(item.quantity) || 0;
    const p = parseFloat(item.purchase_price) || 0;
    const cp = parseFloat(item.current_price) || p;
    
    if (!acc[symbol]) {
      acc[symbol] = {
        ...item,
        quantity: q,
        total_cost: q * p,
        total_value: q * cp,
        date_added: item.created_at || new Date().toISOString()
      };
    } else {
      acc[symbol].quantity += q;
      acc[symbol].total_cost += q * p;
      acc[symbol].total_value = acc[symbol].quantity * cp;
    }
    
    // I calculate the total gain or loss based on the combined position
    acc[symbol].gain_loss = (acc[symbol].total_value - acc[symbol].total_cost).toFixed(2);
    return acc;
  }, {});

  // I transform the merged data into an array and calculate the weighted averages
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
                setShowForm(false);
                // I wait 800ms to ensure the database has fully committed the change
                // before I request the fresh portfolio list.
                setTimeout(() => {
                  fetchPortfolio(); 
                }, 800);
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