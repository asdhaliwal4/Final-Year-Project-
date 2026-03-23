import React, { useState } from 'react';
import StockSearch from './StockSearch';
import '../App.css'; 
import './AddAssetForm.css';

function AddAssetForm({ user, prefillSymbol, onComplete }) {
  const [formData, setFormData] = useState({
    symbol: prefillSymbol || '',
    quantity: '',
    purchase_price: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.symbol) return alert("Please select a stock symbol first.");

    try {
      const response = await fetch('https://final-year-project-iaod.onrender.com/api/assets/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, user_id: user.id }),
      });

      if (response.ok) {
        alert("Portfolio updated!");
        onComplete();
      }
    } catch (err) {
      console.error("Add failed:", err);
    }
  };

  return (
    <div className="add-asset-card fade-in">
      <h3>{prefillSymbol ? `Add ${prefillSymbol}` : "Add New Asset"}</h3>
      <form onSubmit={handleSubmit} className="asset-form">
        
        <div className="input-group search-container">
          <label>Ticker Symbol</label>
          {/* If I already picked one on the home page, just show it. Otherwise, show search. */}
          {prefillSymbol ? (
            <input type="text" value={formData.symbol} readOnly className="readonly-input" />
          ) : (
            <StockSearch onSelectStock={(sym) => setFormData({...formData, symbol: sym})} />
          )}
        </div>

        <div className="form-row">
          <div className="input-group">
            <label>Quantity</label>
            <input 
              type="number" 
              step="any"
              placeholder="0.00"
              value={formData.quantity}
              onChange={(e) => setFormData({...formData, quantity: e.target.value})} 
              required 
            />
          </div>
          <div className="input-group">
            <label>Purchase Price</label>
            <input 
              type="number" 
              step="0.01"
              placeholder="$ 0.00"
              value={formData.purchase_price}
              onChange={(e) => setFormData({...formData, purchase_price: e.target.value})} 
              required 
            />
          </div>
        </div>

        <button type="submit" className="add-submit-btn">
          Confirm Addition
        </button>
      </form>
    </div>
  );
}

export default AddAssetForm;