import React, { useState } from 'react';
import Navbar from './Navbar';
import StockSearch from './StockSearch';
import AddAssetForm from './AddAssetForm';
import '../App.css'; 

function Homepage({ user, handleLogout }) {
  const [selectedStock, setSelectedStock] = useState(null);

  return (
    <div className="homepage fade-in">
      <Navbar user={user} handleLogout={handleLogout} />
      
      <main className="hero">
        <h1>Invest & Track</h1>
        <p>The smartest way to manage your global portfolio in real-time.</p>

        <div className="search-box">
          <StockSearch onSelectStock={(symbol) => setSelectedStock(symbol)} />
        </div>

        {/* This card only shows up when I pick a stock */}
        {selectedStock && (
          <div className="selection-container fade-in">
            <div className="selection-card-wrapper">
              {/* My new Close/Cancel button */}
              <button 
                className="close-selection-btn" 
                onClick={() => setSelectedStock(null)}
                title="Cancel search"
              >
                ✕
              </button>

              <AddAssetForm 
                user={user} 
                prefillSymbol={selectedStock} 
                onComplete={() => setSelectedStock(null)} 
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Homepage;