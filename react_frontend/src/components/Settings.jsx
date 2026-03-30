import React, { useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import './Settings.css';

function Settings({ user, setUser }) {
  const [profileData, setProfileData] = useState({
    name: user.name,
    email: user.email
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [message, setMessage] = useState({ text: '', type: '' });

  // I'm handling the name and email update here
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    // Fetch call to my backend /api/user/update
    setMessage({ text: 'Profile updated successfully!', type: 'success' });
  };

  // I'm handling the password change with the security check
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return setMessage({ text: 'New passwords do not match!', type: 'error' });
    }
    // Fetch call to my backend /api/user/change-password
    // I'll send currentPassword to my backend to verify it before changing
    setMessage({ text: 'Password changed securely.', type: 'success' });
  };

  return (
    <div className="settings-page fade-in">
      <Navbar user={user} />
      
      <main className="settings-container">
        <header className="settings-header">
          <h1>Account Settings</h1>
          <p>Manage my profile and security preferences.</p>
        </header>

        {message.text && (
          <div className={`message-banner ${message.type}`}>{message.text}</div>
        )}

        <div className="settings-grid">
          {/* Section 1: General Profile */}
          <section className="settings-card glass-card">
            <h3>General Profile</h3>
            <form onSubmit={handleProfileUpdate}>
              <div className="input-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  value={profileData.name} 
                  onChange={(e) => setProfileData({...profileData, name: e.target.value})} 
                />
              </div>
              <div className="input-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  value={profileData.email} 
                  onChange={(e) => setProfileData({...profileData, email: e.target.value})} 
                />
              </div>
              <button type="submit" className="save-btn">Update Profile</button>
            </form>
          </section>

          {/* Section 2: Security & Password */}
          <section className="settings-card glass-card">
            <h3>Security</h3>
            <form onSubmit={handlePasswordUpdate}>
              <div className="input-group">
                <label>Current Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  required
                />
              </div>
              <div className="input-group">
                <label>New Password</label>
                <input 
                  type="password" 
                  placeholder="Min. 8 characters"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  required
                />
              </div>
              <div className="input-group">
                <label>Confirm New Password</label>
                <input 
                  type="password" 
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  required
                />
              </div>
              <button type="submit" className="save-btn secondary">Change Password</button>
            </form>
          </section>

          {/* Section 3: The Danger Zone */}
          <section className="settings-card glass-card danger-zone">
            <h3>Danger Zone</h3>
            <p>Once I delete my account, there is no going back. All my portfolio data will be wiped.</p>
            <button className="delete-btn">Delete My Account</button>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Settings;