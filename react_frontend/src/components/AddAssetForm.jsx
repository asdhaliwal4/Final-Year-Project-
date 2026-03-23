import React, { useState } from 'react';
import '../App.css'; // Global glass styles
import './AddAssetForm.css';

function AddAssetForm({ user, prefillSymbol, onComplete }) {
  const [formData, setFormData] = useState({
    symbol: prefillSymbol || '',
    quantity: '',
    purchase_price: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('https://final-year-project-iaod.onrender.com/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, user_id: user.id }),
      });

      if (response.ok) {
        onComplete(); // I'm closing the form and refreshing the list
      }
    } catch (err) {
      console.error("Failed to add asset:", err);
    }
  };

  return (
    <div className="add-asset-card fade-in">
      <h3>Add {formData.symbol} to Portfolio</h3>
      <form onSubmit={handleSubmit} className="asset-form">
        <div className="form-row">
          <div className="input-group">
            <label>Ticker Symbol</label>
            <input 
              type="text" 
              value={formData.symbol} 
              readOnly 
              className="readonly-input"
            />
          </div>
          <div className="input-group">
            <label>Quantity</label>
            <input 
              type="number" 
              step="any"
              placeholder="0.00"
              onChange={(e) => setFormData({...formData, quantity: e.target.value})} 
              required 
            />
          </div>
        </div>

        <div className="input-group">
          <label>Purchase Price (per share)</label>
          <input 
            type="number" 
            step="0.01"
            placeholder="$ 0.00"
            onChange={(e) => setFormData({...formData, purchase_price: e.target.value})} 
            required 
          />
        </div>

        <button type="submit" className="add-submit-btn">
          Confirm Addition
        </button>
      </form>
    </div>
  );
}

export default AddAssetForm;