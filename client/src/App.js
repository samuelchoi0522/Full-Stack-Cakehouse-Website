import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Order from './pages/Order';
import Gallery from './pages/Gallery';
import Account from './pages/Account';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import OrderTracking from './pages/OrderTracking';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import { AuthProvider } from './AuthContext';
import './styles/App.css'; // Import global styles
import AdminAuthProvider from './AdminAuthContext';
import ConfirmEmail from './pages/ConfirmEmail';
import ResetPassword from './pages/ResetPassword';
import OrderSuccess from './pages/OrderSuccess';
import VerifyEmail from './pages/VerifyEmail';

function App() {
  return (
    <Router>
    <AdminAuthProvider>
      <AuthProvider>
        <div className="app-container">
            <Navbar />
            <div className="stitching-border"></div>
            <div className="content-background">
            <Routes>
                <Route path="/" exact element={<Home />} />
                <Route path="/order" element={<Order />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/order-tracking" element={<OrderTracking />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/confirm-email" element={<ConfirmEmail />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/order-success" element={<OrderSuccess />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
            </Routes>
            </div>
        </div>
      </AuthProvider>
      </AdminAuthProvider>
    </Router>
  );
}

export default App;
