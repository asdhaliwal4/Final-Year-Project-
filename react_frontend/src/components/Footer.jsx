import React from 'react';
import './Footer.css';
import { Link } from 'react-router-dom';

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
            {/* I've swapped these to use 'Link' so they connect to your new routes */}
            <Link to="/about">About Us</Link>
            <Link to="/privacy">Security</Link>
          </div>
          <div className="link-group">
            <h5>Legal</h5>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
          </div>
          <div className="link-group">
            <h5>Contact</h5>
            {/* I'm keeping this as an 'a' tag so it opens your email app */}
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