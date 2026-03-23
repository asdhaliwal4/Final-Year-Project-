import React, { useState } from 'react';
import Navbar from './Navbar';
import StockSearch from './StockSearch';
import AddAssetForm from './AddAssetForm';
import { useNavigate } from 'react-router-dom';
import './Homepage.css';
import '../App.css'; 

function Homepage({ user, handleLogout }) {
  const [selectedStock, setSelectedStock] = useState(null);
  const [stockPrice, setStockPrice] = useState(null);
  const navigate = useNavigate();

  // I use this to grab the live price from my Render backend
  const handleSelectStock = (symbol) => {
    setSelectedStock(symbol);
    setStockPrice(null); // Reset price while I fetch the new one
    fetch(`https://final-year-project-iaod.onrender.com/api/quote/${symbol}`)
      .then(res => res.json())
      .then(data => setStockPrice(data.c))
      .catch(err => console.error("Price fetch failed:", err));
  };

  return (
    <div className="homepage fade-in">
      <Navbar user={user} handleLogout={handleLogout} />

      <main className="hero">
        {/* My main header section */}
        <section className="hero-content">
          <h1>Invest & Track</h1>
          <p>The smartest way to manage your global portfolio in real-time.</p>
          
          <div className="search-box">
            <StockSearch onSelectStock={handleSelectStock} />
          </div>
        </section>

        {/* This shows up once I pick a stock */}
        {selectedStock && (
          <div className="selection-card">
            <div className="card-header">
              <h3>{selectedStock}</h3>
              <p className="price-tag">
                {stockPrice ? `$${stockPrice}` : 'Fetching price...'}
              </p>
            </div>
            
            <div className="card-body">
              {user ? (
                <AddAssetForm 
                  user={user} 
                  prefillSymbol={selectedStock} 
                  onComplete={() => setSelectedStock(null)} 
                />
              ) : (
                <div className="auth-prompt">
                  <p>Want to track this? 👇</p>
                  <button className="primary-btn" onClick={() => navigate('/signin')}>
                    Sign in to add to portfolio
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Homepage;