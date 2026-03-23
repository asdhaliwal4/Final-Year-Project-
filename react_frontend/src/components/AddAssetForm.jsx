import React, { useState } from 'react';
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
    
    // Safety check: Make sure we actually have a user ID
    if (!user || !user.id) {
      alert("Error: No user logged in. Please sign in again.");
      return;
    }

    try {
      console.log("Sending asset data:", { ...formData, user_id: user.id });
      
      const response = await fetch('https://final-year-project-iaod.onrender.com/api/assets/add', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    user_id: user.id,
    symbol: formData.symbol,
    quantity: formData.quantity,
    purchase_price: formData.purchase_price
  }),
});

      const result = await response.json();

      if (response.ok) {
        alert("Success! Asset added to your portfolio.");
        onComplete(); // Closes the form and refreshes the list
      } else {
        // This will tell us if the backend rejected the data
        alert("Backend Error: " + (result.message || "Failed to add asset"));
      }
    } catch (err) {
      // This will catch network or URL errors
      console.error("Network error:", err);
      alert("Network Error: Could not connect to the server.");
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
              value={formData.quantity}
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
            value={formData.purchase_price}
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