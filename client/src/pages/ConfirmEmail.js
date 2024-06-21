import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
      <h1>{message}</h1>
      {message === 'Email confirmed, you may now log in' && (
        <button onClick={() => navigate('/login')}>Go to Login</button>
      )}
    </div>
  );
};

export default ConfirmEmail;
