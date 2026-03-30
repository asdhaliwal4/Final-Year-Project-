import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import StockChart from './StockChart';
import './StockDetails.css';

function StockDetails({ user }) {
  const { symbol } = useParams(); // This grabs the 'AAPL' or 'TSLA' from the URL
  const [stockData, setStockData] = useState(null);
  const [range, setRange] = useState('1M'); // Default to 1 Month view

  useEffect(() => {
    // This is where I call my API
    // fetch(`https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/...`)
    console.log(`Fetching data for ${symbol} with range ${range}`);
  }, [symbol, range]);

  return (
    <div className="stock-details-page fade-in">
      <Navbar user={user} />
      
      <main className="details-content">
        <div className="details-header">
          <div className="symbol-info">
            <h1>{symbol}</h1>
            <p className="price-big">$362.47 <span className="gain">+2.4%</span></p>
          </div>
          
          {/* Time Range Selector */}
          <div className="range-picker">
            {['1D', '1W', '1M', '1Y', 'ALL'].map((r) => (
              <button 
                key={r} 
                className={range === r ? 'active' : ''} 
                onClick={() => setRange(r)}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="chart-container-glass">
          <StockChart symbol={symbol} range={range} />
        </div>

        <div className="stats-grid">
          <div className="stat-card"><span>Market Cap</span> <strong>2.8T</strong></div>
          <div className="stat-card"><span>P/E Ratio</span> <strong>32.4</strong></div>
          <div className="stat-card"><span>52W High</span> <strong>$199.11</strong></div>
          <div className="stat-card"><span>52W Low</span> <strong>$124.17</strong></div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default StockDetails;