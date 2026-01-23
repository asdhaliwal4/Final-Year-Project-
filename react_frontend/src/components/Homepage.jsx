import React, { useState, useEffect } from 'react';
import './Homepage.css';
import Navbar from './Navbar';
import StockSearch from './StockSearch';
import AddAssetForm from './AddAssetForm';
import { useNavigate } from 'react-router-dom';

function Homepage({ user, handleLogout }) {
  const [selectedStock, setSelectedStock] = useState(null);
  const [stockPrice, setStockPrice] = useState(null);
  const navigate = useNavigate();

  const handleSelectStock = (symbol) => {
    setSelectedStock(symbol);
    fetch(`http://localhost:5000/api/quote/${symbol}`)
      .then(res => res.json())
      .then(data => setStockPrice(data.c)) // 'c' is the current price
      .catch(err => console.error(err));
  };

  return (
    <div className="homepage">
      <Navbar user={user} handleLogout={handleLogout} />

      <header>
        <h1>Smart Portfolio Management</h1>
        <p>Track your investments and manage your assets efficiently.</p>
        
        {/* New Search Section */}
        <div className="search-section">
          <StockSearch onSelectStock={handleSelectStock} />
        </div>

        {selectedStock && (
          <div className="stock-details-card">
            <h3>{selectedStock}</h3>
            <p className="live-price">Current Price: ${stockPrice || 'Loading...'}</p>
            {user ? (
              <AddAssetForm 
                user={user} 
                prefillSymbol={selectedStock} 
                onComplete={() => {
                  setSelectedStock(null);
                  alert("Successfully added to your portfolio!");
                }} 
              />
            ) : (
              <button className="signin-prompt-btn" onClick={() => navigate('/signin')}>
                Sign in to Add Asset
              </button>
            )}
          </div>
        )}
      </header>

      {/* Your existing sections below... */}
    </div>
  );
}

export default Homepage;