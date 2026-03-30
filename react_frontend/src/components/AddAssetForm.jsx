import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // I'm adding this to enable navigation
import StockSearch from './StockSearch';
import '../App.css'; 
import './AddAssetForm.css';

function AddAssetForm({ user, prefillSymbol, onComplete }) {
  const [formData, setFormData] = useState({
    symbol: prefillSymbol || '',
    quantity: '',
    purchase_price: '',
  });

  return (
    <div className="asset-ticket fade-in">
      {!prefillSymbol && formData.symbol && (
        <button 
          className="close-ticket-btn" 
          onClick={() => setFormData({...formData, symbol: ''})}
          title="Change stock"
        >
          ✕
        </button>
      )}

      <div className="ticket-header">
        <span className="ticker-label">SYMBOL</span>
        <div className="ticker-value-centered">
          {/* If I have a symbol, I'll turn it into a link to my details page */}
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
        <form 
          className="ticket-body" 
          onSubmit={async (e) => {
            e.preventDefault();
            const response = await fetch('https://final-year-project-iaod.onrender.com/api/assets/add', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...formData, user_id: user.id }),
            });
            if (response.ok) onComplete();
          }}
        >
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

          <button type="submit" className="confirm-btn">
            Add to Portfolio
          </button>
        </form>
      )}
    </div>
  );
}

export default AddAssetForm;