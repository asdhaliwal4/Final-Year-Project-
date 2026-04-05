import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import StockChart from './StockChart';
import AddAssetForm from './AddAssetForm'; 
import './StockDetails.css';

function StockDetails({ user }) {
  const { symbol } = useParams();
  const [overview, setOverview] = useState(null); 
  const [liveData, setLiveData] = useState(null); 
  const [metrics, setMetrics] = useState(null); 
  const [loading, setLoading] = useState(true);
  
  // Watchlist State
  const [inWatchlist, setInWatchlist] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [range, setRange] = useState('1M');

  const FINN_KEY = import.meta.env.VITE_FINNHUB_KEY;
  const POLY_KEY = import.meta.env.VITE_POLYGON_KEY;

  useEffect(() => {
    setLoading(true);

    const fetchLive = fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINN_KEY}`).then(res => res.json());
    const fetchMetrics = fetch(`https://finnhub.io/api/v1/stock/metric?symbol=${symbol}&metric=all&token=${FINN_KEY}`).then(res => res.json());
    const fetchProfile = fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${FINN_KEY}`).then(res => res.json());

    // NEW: Check if this stock is already in the user's watchlist
    const checkWatchlist = user 
      ? fetch(`https://final-year-project-iaod.onrender.com/api/watchlist/check/${user.id}/${symbol}`).then(res => res.json())
      : Promise.resolve({ inWatchlist: false });

    Promise.all([fetchLive, fetchMetrics, fetchProfile, checkWatchlist])
      .then(([livePriceData, metricData, profileData, watchlistStatus]) => {
        setLiveData(livePriceData);
        setMetrics(metricData.metric);
        setOverview(profileData);
        setInWatchlist(watchlistStatus.inWatchlist);
        setLoading(false);
      })
      .catch(err => {
        console.error("Data fetch failed:", err);
        setLoading(false);
      });
  }, [symbol, FINN_KEY, user]);

  // NEW: Function to Add or Remove from Watchlist
  const toggleWatchlist = async () => {
    const method = inWatchlist ? 'DELETE' : 'POST';
    const url = inWatchlist 
      ? `https://final-year-project-iaod.onrender.com/api/watchlist/${user.id}/${symbol}`
      : `https://final-year-project-iaod.onrender.com/api/watchlist/add`;

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: inWatchlist ? null : JSON.stringify({ user_id: user.id, symbol: symbol })
      });

      if (response.ok) {
        setInWatchlist(!inWatchlist);
      }
    } catch (err) {
      console.error("Watchlist toggle failed:", err);
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div className="stock-details-page fade-in">
      <Navbar user={user} />
      
      <main className="details-content">
        {showAddForm && (
          <div className="detail-form-overlay fade-in">
            <div className="form-container-glass relative-container">
               <button className="close-form-x-btn" onClick={() => setShowAddForm(false)}>✕</button>
               <AddAssetForm user={user} prefillSymbol={symbol} onComplete={() => setShowAddForm(false)} />
            </div>
          </div>
        )}

        <header className="details-header">
          <div className="symbol-info">
            <h1>{overview?.name || symbol}</h1>
            <p className="sector-tag">
              {overview?.finnhubIndustry || 'Technology'} • {overview?.exchange || 'Market Data'}
            </p>
          </div>
          
          <div className="price-area">
              <div className="price-row">
                <h2 className="price-big">${liveData?.c?.toFixed(2) || '---'}</h2>
                
                {user && (
                  <div className="action-buttons-stack">
                    <button className="add-to-portfolio-btn" onClick={() => setShowAddForm(true)}>
                      + Add Asset
                    </button>
                    
                    {/* NEW: Watchlist Toggle Button */}
                    <button 
                      className={`watchlist-toggle-btn ${inWatchlist ? 'active' : ''}`} 
                      onClick={toggleWatchlist}
                    >
                      {inWatchlist ? 'Watchlist ✓' : '+ Watchlist'}
                    </button>
                  </div>
                )}
              </div>
              <p className={liveData?.d >= 0 ? 'profit' : 'loss'}>
                {liveData?.d >= 0 ? '+' : ''}{liveData?.d?.toFixed(2)} ({liveData?.dp?.toFixed(2)}%)
              </p>
          </div>
        </header>

        <div className="range-selector">
          {['1W', '1M', '1Y'].map((r) => (
            <button key={r} className={range === r ? 'active' : ''} onClick={() => setRange(r)}>{r}</button>
          ))}
        </div>

        <div className="chart-container-glass">
          <StockChart symbol={symbol} apiKey={POLY_KEY} range={range} />
        </div>

        <section className="info-grid">
          <div className="about-card glass-card">
            <h3>Company Profile</h3>
            <p>{overview?.name} is a leading entity in the {overview?.finnhubIndustry} sector.</p>
            {overview?.weburl && (
              <a href={overview.weburl} target="_blank" rel="noreferrer" className="visit-website-btn">
                Official Website <span>→</span>
              </a>
            )}
          </div>

          <div className="stats-sidebar glass-card">
            <h3>Key Statistics</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Market Cap</span>
                <strong className="stat-value">{metrics?.marketCapitalization ? `$${(metrics.marketCapitalization / 1000).toFixed(2)}B` : '---'}</strong>
              </div>
              <div className="stat-item"><span className="stat-label">P/E Ratio</span><strong className="stat-value">{metrics?.peBasicExclExtraTTM?.toFixed(2) || '---'}</strong></div>
              <div className="stat-item"><span className="stat-label">52W High</span><strong className="stat-value highlight-up">${metrics?.['52WeekHigh']?.toFixed(2) || '---'}</strong></div>
              <div className="stat-item"><span className="stat-label">52W Low</span><strong className="stat-value highlight-down">${metrics?.['52WeekLow']?.toFixed(2) || '---'}</strong></div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default StockDetails;