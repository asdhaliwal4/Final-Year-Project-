import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import StockSearch from './StockSearch';
import '../App.css'; 
import './AddAssetForm.css';

function AddAssetForm({ user, prefillSymbol, onComplete }) {
  const [formData, setFormData] = useState({
    symbol: prefillSymbol || '',
    quantity: '',
    purchase_price: '',
  });

  // NEW: States for error handling and animation
  const [error, setError] = useState("");
  const [isShaking, setIsShaking] = useState(false);

const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Reset error

    // Validation: Check for negative or zero values
    if (parseFloat(formData.quantity) <= 0 || parseFloat(formData.purchase_price) <= 0) {
      setError("Please enter values greater than 0");
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }

    try {
      // --- NEW: Grab the token from the vault ---
      const token = localStorage.getItem('token');

      const response = await fetch('https://final-year-project-iaod.onrender.com/api/assets/add', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          // --- NEW: Add the Authorization header ---
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ ...formData, user_id: user.id }),
      });
      
      // If the bouncer rejects the token, we can't add the asset
      if (response.status === 401 || response.status === 403) {
        setError("Session expired. Please log in again.");
        return;
      }

      if (response.ok) onComplete();
    } catch (err) {
      setError("Server error. Try again later.");
    }
  };

  return (
    /* NEW: Dynamic class 'shake' added here */
    <div className={`asset-ticket fade-in ${isShaking ? 'shake' : ''}`}>
      {!prefillSymbol && formData.symbol && (
        <button 
          className="close-ticket-btn" 
          onClick={() => {
            setFormData({...formData, symbol: ''});
            setError("");
          }}
          title="Change stock"
        >
          ✕
        </button>
      )}

      <div className="ticket-header">
        <span className="ticker-label">SYMBOL</span>
        <div className="ticker-value-centered">
          {formData.symbol ? (
            <Link to={`/stock/${formData.symbol}`} className="ticker-symbol-link">
              {formData.symbol}
            </Link>
          ) : (
            "---"
          )}
        </div>
      </div>

      {!formData.symbol ? (
        <div className="search-mode-container">
          <p className="search-hint">Search for a ticker to start</p>
          <StockSearch onSelectStock={(sym) => setFormData({...formData, symbol: sym})} />
        </div>
      ) : (
        <form className="ticket-body" onSubmit={handleSubmit}>
          <div className="ticket-row">
            <div className="ticket-group">
              <label>Shares</label>
              <input 
                type="number" 
                placeholder="0.00"
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: e.target.value})} 
                required 
              />
            </div>
            <div className="ticket-group">
              <label>Avg. Cost</label>
              <div className="price-input-wrapper">
                <span>$</span>
                <input 
                  type="number" 
                  step="0.01"
                  placeholder="0.00"
                  value={formData.purchase_price}
                  onChange={(e) => setFormData({...formData, purchase_price: e.target.value})} 
                  required 
                />
              </div>
            </div>
          </div>

          {/* NEW: Error message display */}
          {error && <p className="form-error-msg">{error}</p>}

          <button type="submit" className="confirm-btn">
            Add to Portfolio
          </button>
        </form>
      )}
    </div>
  );
}

export default AddAssetForm;