import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Order from './pages/Order';
import Gallery from './pages/Gallery';
import Account from './pages/Account';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import OrderTracking from './pages/OrderTracking.js';
import './styles/App.css'; // Import global styles

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <div className="stitching-border"></div>
        <div className="content-background">
          <Routes>
            <Route path="/" exact element={<Home />} />
            <Route path="/order" element={<Order />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/account" element={<Account />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/order-tracking" element={<OrderTracking />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
