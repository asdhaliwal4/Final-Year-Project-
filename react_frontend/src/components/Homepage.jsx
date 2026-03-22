import React, { useState } from 'react';
import Navbar from './Navbar';
import StockSearch from './StockSearch';
import AddAssetForm from './AddAssetForm';
import { useNavigate } from 'react-router-dom';
import './Homepage.css';

function Homepage({ user, handleLogout }) {
  const [selectedStock, setSelectedStock] = useState(null);
  const [stockPrice, setStockPrice] = useState(null);
  const navigate = useNavigate();

  const handleSelectStock = (symbol) => {
    setSelectedStock(symbol);
    fetch(`https://final-year-project-iaod.onrender.com/api/quote/${symbol}`)
      .then(res => res.json())
      .then(data => setStockPrice(data.c))
      .catch(err => console.error(err));
  };

  return (
    <div className="homepage">
      <Navbar user={user} handleLogout={handleLogout} />

      <header className="hero">
        <h1>Invest & Track</h1>
        <p>Real-time portfolio management for stocks and crypto.</p>
        
        <div className="search-box">
          <StockSearch onSelectStock={handleSelectStock} />
        </div>

        {selectedStock && (
          <div className="selection-modal">
            <h3>{selectedStock}</h3>
            <p className="price-highlight">Live Price: ${stockPrice || '...'}</p>
            {user ? (
              <AddAssetForm 
                user={user} 
                prefillSymbol={selectedStock} 
                onComplete={() => setSelectedStock(null)} 
              />
            ) : (
              <button className="login-btn" onClick={() => navigate('/signin')}>
                Sign in to add to portfolio
              </button>
            )}
          </div>
        )}
      </header>
    </div>
  );
}

export default Homepage;
