import React, { useState } from 'react';
import Navbar from './Navbar';
import StockSearch from './StockSearch';
import AddAssetForm from './AddAssetForm';
import '../App.css'; 
import Footer from './Footer';
import { Link } from 'react-router-dom';
import './Homepage.css';

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

        {/* I'm calling my Top Stocks section here so it shows up on my landing page */}
        <TopStocks />

        {/* This part only pops up once I've actually picked a stock */}
        {selectedStock && (
          <div className="selection-container fade-in">
            <div className="selection-card-wrapper">
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

// I'm defining the Mag 7 data locally since these don't change often
const magSeven = [
  { name: "Microsoft", symbol: "MSFT" },
  { name: "Apple", symbol: "AAPL" },
  { name: "Nvidia", symbol: "NVDA" },
  { name: "Alphabet", symbol: "GOOGL" },
  { name: "Amazon", symbol: "AMZN" },
  { name: "Meta", symbol: "META" },
  { name: "Tesla", symbol: "TSLA" },
];

function TopStocks() {
  return (
    <section className="top-stocks-section">
      <h3 className="section-title">Market Leaders</h3>
      <div className="mag7-grid">
        {magSeven.map((stock) => (
          <Link key={stock.symbol} to={`/stock/${stock.symbol}`} className="stock-card-glass">
            <div className="stock-card-info">
              <span className="stock-name">{stock.name}</span>
              <span className="stock-symbol">{stock.symbol}</span>
            </div>
            <div className="card-arrow">→</div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default Homepage;