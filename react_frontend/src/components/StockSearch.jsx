import React, { useState, useEffect, useRef } from 'react';
import '../App.css';
import './StockSearch.css';

function StockSearch({ onSelectStock }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);

  // Close the results if I click anywhere else on the screen
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (val) => {
    setQuery(val);
    if (val.length > 1) {
      try {
        const res = await fetch(`https://final-year-project-iaod.onrender.com/api/search?q=${val}`);
        const data = await res.json();
        setResults(data);
        setShowDropdown(true);
      } catch (err) {
        console.error("Search failed", err);
      }
    } else {
      setResults([]);
    }
  };

  const selectItem = (symbol) => {
    onSelectStock(symbol);
    setQuery(symbol); // Fill the box with the choice
    setShowDropdown(false);
  };

  return (
    <div className="search-wrapper" ref={searchRef}>
      <div className="search-input-group">
        <input 
          type="text" 
          placeholder="Search stocks (e.g. AAPL).." 
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          className="main-search-input"
        />
        {query && (
          <button className="clear-search" onClick={() => {setQuery(''); setResults([]);}}>✕</button>
        )}
      </div>

      {showDropdown && results.length > 0 && (
        <ul className="search-results-dropdown fade-in">
          {results.map((item) => (
            <li key={item.symbol} onClick={() => selectItem(item.symbol)}>
              <span className="res-sym">{item.symbol}</span>
              <span className="res-name">{item.description}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default StockSearch;