import React, { useState, useEffect } from 'react';

function StockSearch({ onSelectStock }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length > 1) {
        fetch(`http://localhost:5000/api/search?q=${query}`)
          .then(res => res.json())
          .then(data => setResults(data));
      } else {
        setResults([]);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="search-container">
      <input
        type="text"
        placeholder="Search stocks (e.g. AAPL)..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="main-search-input"
      />
      {results.length > 0 && (
        <ul className="results-list">
          {results.map((s) => (
            <li key={s.symbol} onClick={() => { onSelectStock(s.symbol); setQuery(''); setResults([]); }}>
              {s.symbol} - {s.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default StockSearch;