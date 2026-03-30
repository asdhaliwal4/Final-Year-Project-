import React, { useState } from 'react';
import Navbar from './Navbar';
import StockSearch from './StockSearch';
import AddAssetForm from './AddAssetForm';
import '../App.css'; 
import Footer from './Footer';

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

        {/* This part only pops up once I've actually picked a stock */}
        {selectedStock && (
          <div className="selection-container fade-in">
            <div className="selection-card-wrapper">
              {/* My close button to cancel the search */}
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
      <Footer />
    </div>
  );
}

export default Homepage;