import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/ConfirmEmail.css';

const ConfirmEmail = () => {
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const token = searchParams.get('token');

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/confirm-email?token=${token}`);
        setMessage(response.data.message);
      } catch (error) {
        setMessage(error.response?.data?.error || 'Error confirming email');
      }
    };

    confirmEmail();
  }, [token]);

  return (
    <div className="confirm-email-container">
      <div className="confirm-email-content">
        <h1>{message}</h1>
        {message === 'Email confirmed, you may now log in' && (
          <button onClick={() => navigate('/login')} className="login-btn">Go to Login</button>
        )}
      </div>
    </div>
  );
};

export default ConfirmEmail;
