// src/App.jsx
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Homepage from './components/Homepage';
import SignIn from './components/SignIn';
import CreateAccount from './components/CreateAccount';
import Navbar from './components/Navbar'; // Import Navbar here to pass props
import Dashboard from './components/Dashboard';

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