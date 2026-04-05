// src/App.jsx
import React, { useState, useEffect } from 'react'; // Added useEffect
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Homepage from './components/Homepage';
import SignIn from './components/SignIn'; 
import CreateAccount from './components/CreateAccount';
import Dashboard from './components/Dashboard';
import InfoPage from './components/InfoPage';
import ScrollToTop from './components/ScrollToTop';
import StockDetails from './components/StockDetails';
import Settings from './components/Settings';
import History from './components/History';
import Watchlist from './components/Watchlist'; 

function App() {
  // 1. I'm initializing my user state by checking localStorage first
  // This is what stops the auto-logout on refresh!
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("invest_track_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // 2. I'm updating handleLogin to save the user to the browser storage
  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem("invest_track_user", JSON.stringify(userData));
  };
  
  // 3. I'm updating handleLogout to clear the browser storage
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("invest_track_user");
  };

  // 4. This useEffect ensures that if you change your name in Settings, 
  // the localStorage is also updated so it stays changed on refresh.
  useEffect(() => {
    if (user) {
      localStorage.setItem("invest_track_user", JSON.stringify(user));
    }
  }, [user]);

  return (
    <BrowserRouter>
      <ScrollToTop /> 

      <Routes>
        <Route path="/" element={<Homepage user={user} handleLogout={handleLogout} />} />
        
        <Route 
          path="/signin" 
          element={user ? <Navigate to="/dashboard" /> : <SignIn handleLogin={handleLogin} />} 
        />
        <Route path="/create-account" element={<CreateAccount />} />
        
        <Route 
          path="/dashboard" 
          element={user ? <Dashboard user={user} handleLogout={handleLogout} /> : <Navigate to="/signin" />} 
        />

        {/* I'm protecting StockDetails too so it doesn't crash if user is null */}
        <Route 
          path="/stock/:symbol" 
          element={user ? <StockDetails user={user} /> : <Navigate to="/signin" />} 
        />

        <Route 
          path="/settings" 
          element={user ? <Settings user={user} setUser={setUser} handleLogout={handleLogout} /> : <Navigate to="/signin" />} 
        />

        <Route path="/about" element={
          <InfoPage title="About Invest & Track">
            <p>Founded in 2026, Invest & Track was built to simplify the complex world of global finance.</p>
            <h2>Our Mission</h2>
            <p>We believe that everyone should have access to real-time insights into their wealth.</p>
          </InfoPage>
        } />

        <Route path="/privacy" element={
          <InfoPage title="Privacy Policy">
            <p>Your privacy is our priority.</p>
          </InfoPage>
        } />

        <Route path="/terms" element={
          <InfoPage title="Terms of Service">
            <p>By using Invest & Track, you agree to our terms.</p>
          </InfoPage>
        } />
        
        <Route 
          path="/history" 
          element={user ? <History user={user} handleLogout={handleLogout} /> : <Navigate to="/signin" />} 
        />

        <Route 
          path="/watchlist" 
          element={user ? <Watchlist user={user} /> : <Navigate to="/signin" />} 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;