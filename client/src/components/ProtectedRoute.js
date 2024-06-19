import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const token = localStorage.getItem('token');

  return isAuthenticated || token ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
