// src/App.jsx
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Homepage from './components/Homepage';
import SignIn from './components/SignIn';
import CreateAccount from './components/CreateAccount';
import Navbar from './components/Navbar'; // Import Navbar here to pass props

// Placeholder for the page users see after logging in
function Dashboard({ user, handleLogout }) {
  return (
    <div>
      <Navbar user={user} handleLogout={handleLogout} />
      <div style={{ padding: '80px 20px' }}>
        <h1>Dashboard</h1>
        <p>Welcome, {user.first_name}!</p>
        <p>This page is only visible when you are logged in.</p>
      </div>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null); // State to hold logged-in user info

  // Function to be called from SignIn component on successful login
  const handleLogin = (userData) => {
    setUser(userData);
  };
  
  const handleLogout = () => {
    setUser(null);
  };

  return (
    <BrowserRouter>
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;