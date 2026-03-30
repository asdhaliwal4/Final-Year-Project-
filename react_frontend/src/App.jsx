// src/App.jsx
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Homepage from './components/Homepage';
import SignIn from './components/SignIn'; // Imported as SignIn
import CreateAccount from './components/CreateAccount';
import Dashboard from './components/Dashboard';
import InfoPage from './components/InfoPage';
import ScrollToTop from './components/ScrollToTop';
import StockDetails from './components/StockDetails';
import Settings from './components/Settings';

function App() {
  // Storing the user info here so I can check if they're logged in across the whole site
  const [user, setUser] = useState(null); 

  const handleLogin = (userData) => {
    setUser(userData);
  };
  
  const handleLogout = () => {
    setUser(null);
  };

  return (
    <BrowserRouter>
      {/* Adding this so the page snaps back to the top when I click a footer link */}
      <ScrollToTop /> 

      <Routes>
        {/* 1. Homepage */}
        <Route path="/" element={<Homepage user={user} handleLogout={handleLogout} />} />
        
        {/* 2. Authentication */}
        <Route 
          path="/signin" 
          element={user ? <Navigate to="/dashboard" /> : <SignIn handleLogin={handleLogin} />} 
        />
        <Route path="/create-account" element={<CreateAccount />} />
        
        {/* 3. Protected Dashboard */}
        <Route 
          path="/dashboard" 
          element={user ? <Dashboard user={user} handleLogout={handleLogout} /> : <Navigate to="/signin" />} 
        />

        {/* 4. Stock Details */}
        <Route path="/stock/:symbol" element={<StockDetails user={user} />} />

        {/* 5. Protected Settings */}
        <Route 
          path="/settings" 
          element={user ? <Settings user={user} setUser={setUser} /> : <Navigate to="/signin" />} 
        />

        {/* 6. Static Info Pages */}
        <Route path="/about" element={
          <InfoPage title="About Invest & Track">
            <p>Founded in 2026, Invest & Track was built to simplify the complex world of global finance.</p>
            <h2>Our Mission</h2>
            <p>We believe that everyone should have access to real-time insights into their wealth. Our platform combines live market data with intuitive design to help you make smarter financial decisions.</p>
          </InfoPage>
        } />

        <Route path="/privacy" element={
          <InfoPage title="Privacy Policy">
            <p>Your privacy is our priority. This policy outlines how we handle your data.</p>
            <h2>Data Collection</h2>
            <p>We only collect the essential information required to provide our portfolio tracking services. We never sell your personal data to third parties.</p>
          </InfoPage>
        } />

        <Route path="/terms" element={
          <InfoPage title="Terms of Service">
            <p>By using Invest & Track, you agree to our terms.</p>
            <h2>Platform Usage</h2>
            <p>Our tools are for informational purposes only. We are not financial advisors, and all investment decisions are made at your own risk.</p>
          </InfoPage>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;