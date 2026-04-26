import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import './Dashboard.css'; 

function Watchlist({ user, handleLogout }) { // Added handleLogout here
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    //  Grab the token
    const token = localStorage.getItem('token');

    fetch(`https://final-year-project-iaod.onrender.com/api/watchlist/${user.id}`, {
      //  Show the token to the backend
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        // Check for expired session
        if (res.status === 401 || res.status === 403) {
          handleLogout();
          return;
        }
        return res.json();
      })
      .then(data => {
        setStocks(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user.id, handleLogout]);

  const handleRemove = async (symbol) => {
    try {
      const token = localStorage.getItem('token'); // Grab token for delete

      const res = await fetch(`https://final-year-project-iaod.onrender.com/api/watchlist/${user.id}/${symbol}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}` // Show the token here too
        }
      });

      if (res.status === 401 || res.status === 403) {
        handleLogout();
        return;
      }

      if (res.ok) {
        setStocks(stocks.filter(s => s.symbol !== symbol));
      }
    } catch (err) {
      console.error("Failed to remove from watchlist");
    }
  };

  return (
    <div className="dashboard-page fade-in">
      <Navbar user={user} handleLogout={handleLogout} />
      <main className="dashboard-content">
        <header className="dashboard-header">
           <Link to="/dashboard" className="action-link" style={{marginBottom: '10px'}}>← Back to Portfolio</Link>
           <h1>My Watchlist</h1>
           <p>Stocks I'm keeping an eye on.</p>
        </header>

        {loading ? (
          <div className="status-msg">Fetching live data...</div>
        ) : stocks.length === 0 ? (
          <div className="status-msg">Your watchlist is empty. Go to a stock page to add one!</div>
        ) : (
          <div className="table-container">
            <table className="portfolio-table">
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Current Price</th>
                  <th>Day Change</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {stocks.map((stock) => (
                  <tr key={stock.symbol}>
                    <td className="sym">
                      <Link to={`/stock/${stock.symbol}`} style={{color: 'var(--primary)', textDecoration: 'none'}}>
                        <strong>{stock.symbol}</strong>
                      </Link>
                    </td>
                    <td>${parseFloat(stock.current_price).toFixed(2)}</td>
                    <td className={stock.change >= 0 ? 'profit' : 'loss'}>
                      {stock.change >= 0 ? '+' : ''}{stock.percent_change?.toFixed(2)}%
                    </td>
                    <td>
                      <button className="remove-btn" onClick={() => handleRemove(stock.symbol)}>Stop Watching</button>
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

export default Watchlist;