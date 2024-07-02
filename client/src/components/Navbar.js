import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import '../styles/Navbar.css';

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">Sweetplus Cakehouse</Link>
        <div className="navbar-links">
          <Link to="/" className="navbar-link">Home</Link>
          <Link to="/gallery" className="navbar-link">Gallery</Link>
          <Link to="/account" className="navbar-link">Account</Link>
          <Link to="/order" className="navbar-link">Order</Link>
          {isAuthenticated && (
            <Link to="/" onClick={logout} className="navbar-link">Logout</Link>
          )}
        </div>
        <div className="navbar-hamburger" onClick={toggleMenu}>
          &#9776;
        </div>
      </div>
      {menuOpen && (
        <div className="navbar-overlay">
            <button className="close-button" onClick={toggleMenu}>&#x2715;</button>
          <div className="navbar-overlay-content">
            <Link to="/" className="navbar-link" onClick={toggleMenu}>Home</Link>
            <Link to="/gallery" className="navbar-link" onClick={toggleMenu}>Gallery</Link>
            <Link to="/account" className="navbar-link" onClick={toggleMenu}>Account</Link>
            <Link to="/order" className="navbar-link" onClick={toggleMenu}>Order</Link>
            {isAuthenticated && (
              <Link to="/" onClick={() => { logout(); toggleMenu(); }} className="navbar-link">Logout</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
