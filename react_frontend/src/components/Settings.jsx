import React, { useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import './Settings.css';

function Settings({ user, setUser, handleLogout }) {
  const [profileData, setProfileData] = useState({
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    email: user.email || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // 1. Handle Profile Update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    try {
      const token = localStorage.getItem('token'); // Get the keycard

      const response = await fetch('https://final-year-project-iaod.onrender.com/api/user/update-profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Show the keycard
        },
        body: JSON.stringify({
          id: user.id,
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          email: profileData.email
        }),
      });

      if (response.status === 401 || response.status === 403) return handleLogout();

      if (response.ok) {
        setUser({ ...user, ...profileData });
        setMessage({ text: 'Profile updated successfully!', type: 'success' });
        setIsEditing(false);
      } else {
        setMessage({ text: 'Failed to update profile.', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Server error. Try again later.', type: 'error' });
    }
  };

  // 2. Handle Password Change
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return setMessage({ text: 'New passwords do not match!', type: 'error' });
    }

    try {
      const token = localStorage.getItem('token'); // Get the keycard

      const response = await fetch('https://final-year-project-iaod.onrender.com/api/user/change-password', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Show the keycard
        },
        body: JSON.stringify({
          id: user.id,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        }),
      });

      if (response.status === 401 || response.status === 403) return handleLogout();

      const data = await response.json();
      if (response.ok) {
        setMessage({ text: 'Password updated successfully.', type: 'success' });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setMessage({ text: data.message || 'Error updating password.', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Server error.', type: 'error' });
    }
  };

  // 3. Handle Delete Account
  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "WARNING: This will permanently delete your account and all portfolio data. This action cannot be undone. Are you sure?"
    );

    if (confirmed) {
      try {
        const token = localStorage.getItem('token'); // Get the keycard

        const response = await fetch(`https://final-year-project-iaod.onrender.com/api/user/${user.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}` // Show the keycard
          }
        });

        if (response.status === 401 || response.status === 403) return handleLogout();

        if (response.ok) {
          alert("Account successfully deleted.");
          handleLogout(); 
        } else {
          setMessage({ text: 'Could not delete account. Try again later.', type: 'error' });
        }
      } catch (err) {
        setMessage({ text: 'Server error.', type: 'error' });
      }
    }
  };

  return (
    <div className="settings-page fade-in">
      <Navbar user={user} handleLogout={handleLogout} />
      
      <main className="settings-container">
        <header className="settings-header">
          <h1>Account Settings</h1>
          <p>Manage my profile and security preferences.</p>
        </header>

        {message.text && (
          <div className={`message-banner ${message.type}`}>{message.text}</div>
        )}

        <div className="settings-grid">
          <section className="settings-card glass-card">
            <h3>General Profile</h3>
            <form onSubmit={handleProfileUpdate}>
              <div className="name-row">
                <div className="input-group">
                  <label>First Name</label>
                  <input 
                    type="text" 
                    disabled={!isEditing} 
                    value={profileData.first_name} 
                    onChange={(e) => setProfileData({...profileData, first_name: e.target.value})} 
                  />
                </div>
                <div className="input-group">
                  <label>Last Name</label>
                  <input 
                    type="text" 
                    disabled={!isEditing} 
                    value={profileData.last_name} 
                    onChange={(e) => setProfileData({...profileData, last_name: e.target.value})} 
                  />
                </div>
              </div>
              <div className="input-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  disabled={!isEditing} 
                  value={profileData.email} 
                  onChange={(e) => setProfileData({...profileData, email: e.target.value})} 
                />
              </div>
              <button type="submit" className={`save-btn ${isEditing ? 'confirm' : ''}`}>
                {isEditing ? 'Save Changes' : 'Edit Profile'}
              </button>
            </form>
          </section>

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
                  placeholder="••••••••"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  required
                />
              </div>
              <button type="submit" className="save-btn secondary">Change Password</button>
            </form>
          </section>

          <section className="settings-card glass-card danger-zone">
            <h3>Danger Zone</h3>
            <p>Once you delete your account, there is no going back. All your data will be permanently removed.</p>
            <button className="delete-btn" onClick={handleDeleteAccount}>
              Delete My Account
            </button>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Settings;