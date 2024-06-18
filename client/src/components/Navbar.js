import React from 'react';
import '../styles/Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
    <div className="navbar-container">
      <div className="navbar-brand">Sweetplus Cakehouse</div>
      <div className="navbar-links">
        <a href="/" className="navbar-link">Home</a>
        <a href="/gallery" className="navbar-link">Gallery</a>
        <a href="/account" className="navbar-link">Account</a>
        <a href="/order" className="navbar-link">Order</a>
      </div>
      </div>
    </nav>
  );
};

export default Navbar;
