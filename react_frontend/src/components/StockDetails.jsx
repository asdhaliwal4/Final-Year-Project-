import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import StockChart from './StockChart';
import './StockDetails.css';

function StockDetails({ user }) {
  const { symbol } = useParams();
  const [overview, setOverview] = useState(null); 
  const [liveData, setLiveData] = useState(null); 
  const [metrics, setMetrics] = useState(null); 
  const [loading, setLoading] = useState(true);
  
  // I'm using '1M' as the default view for my chart
  const [range, setRange] = useState('1M');

  // Pulling my keys from my frontend env file
  const FINN_KEY = import.meta.env.VITE_FINNHUB_KEY;
  const POLY_KEY = import.meta.env.VITE_POLYGON_KEY;

  useEffect(() => {
    setLoading(true);

    // I'm fetching the live price, company metrics, and profile all at once
    const fetchLive = fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINN_KEY}`)
      .then(res => res.json());

    const fetchMetrics = fetch(`https://finnhub.io/api/v1/stock/metric?symbol=${symbol}&metric=all&token=${FINN_KEY}`)
      .then(res => res.json());

    const fetchProfile = fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${FINN_KEY}`)
      .then(res => res.json());

    Promise.all([fetchLive, fetchMetrics, fetchProfile])
      .then(([livePriceData, metricData, profileData]) => {
        setLiveData(livePriceData);
        setMetrics(metricData.metric);
        setOverview(profileData);
        setLoading(false);
      })
      .catch(err => {
        console.error("My data fetch failed:", err);
        setLoading(false);
      });
  }, [symbol, FINN_KEY]);

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div className="stock-details-page fade-in">
      <Navbar user={user} />
      
      <main className="details-content">
        <header className="details-header">
          <div className="symbol-info">
            <h1>{overview?.name || symbol}</h1>
            <p className="sector-tag">
              {overview?.finnhubIndustry || 'Technology'} • {overview?.exchange || 'Market Data'}
            </p>
          </div>
          
          <div className="price-area">
             <h2 className="price-big">${liveData?.c?.toFixed(2) || '---'}</h2>
             <p className={liveData?.d >= 0 ? 'profit' : 'loss'}>
               {liveData?.d >= 0 ? '+' : ''}{liveData?.d?.toFixed(2)} ({liveData?.dp?.toFixed(2)}%)
             </p>
          </div>
        </header>

        {/* This is my time range selector for the chart */}
        <div className="range-selector">
          {['1W', '1M', '1Y'].map((r) => (
            <button 
              key={r} 
              className={range === r ? 'active' : ''} 
              onClick={() => setRange(r)}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="chart-container-glass">
          {/* I'm passing the selected range down to my chart component */}
          <StockChart symbol={symbol} apiKey={POLY_KEY} range={range} />
        </div>

        <section className="info-grid">
          <div className="about-card">
            <h3>About {overview?.name}</h3>
            <p>
              {overview?.name} is a company in the {overview?.finnhubIndustry} sector, 
              trading on the {overview?.exchange}. I've pulled this data to give context to the stock's performance.
            </p>
            {overview?.weburl && (
              <a href={overview.weburl} target="_blank" rel="noreferrer" className="site-link">
                Visit Official Website →
              </a>
            )}
          </div>

          <div className="stats-sidebar">
            <div className="stat-row">
              <span>Market Cap</span> 
              <strong>
                {metrics?.marketCapitalization 
                  ? `$${(metrics.marketCapitalization / 1000).toFixed(2)}B` 
                  : '---'}
              </strong>
            </div>
            <div className="stat-row">
              <span>P/E Ratio</span> 
              <strong>{metrics?.peBasicExclExtraTTM?.toFixed(2) || '---'}</strong>
            </div>
            <div className="stat-row">
              <span>52W High</span> 
              <strong>${metrics?.['52WeekHigh']?.toFixed(2) || '---'}</strong>
            </div>
            <div className="stat-row">
              <span>52W Low</span> 
              <strong>${metrics?.['52WeekLow']?.toFixed(2) || '---'}</strong>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default StockDetails;