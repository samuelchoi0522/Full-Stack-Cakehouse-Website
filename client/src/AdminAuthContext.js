import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const AdminAuthContext = createContext();

export const useAdminAuth = () => useContext(AdminAuthContext);

const AdminAuthProvider = ({ children }) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded && decoded.is_admin) {
          setIsAdminAuthenticated(true);
        } else {
          localStorage.removeItem('adminToken');
          setIsAdminAuthenticated(false);
        }
      } catch (error) {
        console.error('Invalid token:', error);
        localStorage.removeItem('adminToken');
        setIsAdminAuthenticated(false);
      }
    }
  }, []);

  const loginAdmin = (token) => {
    localStorage.setItem('adminToken', token);
    setIsAdminAuthenticated(true);
    navigate('/admin/dashboard');
  };

  const logoutAdmin = () => {
    localStorage.removeItem('adminToken');
    setIsAdminAuthenticated(false);
    navigate('/admin/login');
  };

  return (
    <AdminAuthContext.Provider value={{ isAdminAuthenticated, loginAdmin, logoutAdmin }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export default AdminAuthProvider;
