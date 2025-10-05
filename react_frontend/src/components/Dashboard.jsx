import React from 'react';
import Navbar from './Navbar'; 

function Dashboard({ user, handleLogout }) {
  return (
    <div>
      <Navbar user={user} handleLogout={handleLogout} />
      <div style={{ padding: '80px 20px' }}>
        <h1>Dashboard</h1>
        <p>Welcome, {user.first_name}!</p>
      </div>
    </div>
  );
}

export default Dashboard;