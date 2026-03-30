import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import '../App.css';
import './InfoPage.css';

function InfoPage({ title, children }) {
  return (
    <div className="info-page-container fade-in">
      <Navbar />
      <main className="info-content">
        <div className="info-card">
          <h1>{title}</h1>
          <div className="info-text">
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default InfoPage;