import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import '../styles/Navbar.css';

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">Sweetplus Cakehouse</Link>
        <div className="navbar-links">
          <Link to="/" className="navbar-link">Home</Link>
          <Link to="/gallery" className="navbar-link">Gallery</Link>
          <Link to="/account" className="navbar-link">Account</Link>
          <Link to="/order" className="navbar-link">Order</Link>
          {isAuthenticated && <button onClick={logout} className="navbar-link">Logout</button>}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
