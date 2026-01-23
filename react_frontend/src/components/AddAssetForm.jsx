import React, { useState, useEffect } from 'react';

function AddAssetForm({ user, prefillSymbol = "", onComplete }) {
  const [formData, setFormData] = useState({
    symbol: prefillSymbol,
    quantity: '',
    purchase_price: ''
  });

  // This ensures the form updates if you click a different stock on the Homepage
  useEffect(() => {
    setFormData((prev) => ({ ...prev, symbol: prefillSymbol }));
  }, [prefillSymbol]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/assets/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, user_id: user.id }),
      });

      if (response.ok) {
        alert("Asset added successfully!");
        onComplete(); // Refresh data and close form
      } else {
        const result = await response.json();
        alert(result.message || "Failed to add asset.");
      }
    } catch (err) {
      console.error("Submission error:", err);
      alert("Error connecting to server.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-asset-form">
      <h3>Add {formData.symbol || 'Asset'}</h3>
      
      <div className="form-group">
        <label>Stock Symbol</label>
        <input 
          type="text" 
          placeholder="e.g. AAPL" 
          value={formData.symbol} 
          onChange={(e) => setFormData({...formData, symbol: e.target.value.toUpperCase()})}
          required 
        />
      </div>

      <div className="form-group">
        <label>Quantity</label>
        <input 
          type="number" 
          step="any" 
          placeholder="Amount bought" 
          value={formData.quantity} 
          onChange={(e) => setFormData({...formData, quantity: e.target.value})}
          required 
        />
      </div>

      <div className="form-group">
        <label>Purchase Price</label>
        <input 
          type="number" 
          step="0.01" 
          placeholder="Price per share" 
          value={formData.purchase_price} 
          onChange={(e) => setFormData({...formData, purchase_price: e.target.value})}
          required 
        />
      </div>

      <button type="submit" className="submit-button">Add to Portfolio</button>
    </form>
  );
}

export default AddAssetForm;