import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>Invest & Track</h4>
          <p>Simplifying portfolio management for the modern investor.</p>
        </div>
        
        <div className="footer-links">
          <div className="link-group">
            <h5>Platform</h5>
            <a href="#">About Us</a>
            <a href="#">Security</a>
          </div>
          <div className="link-group">
            <h5>Legal</h5>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
          <div className="link-group">
            <h5>Contact</h5>
            <a href="mailto:support@investtrack.com">Support</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2026 Invest & Track Inc. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;