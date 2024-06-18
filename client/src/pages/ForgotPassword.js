import React, { useState } from 'react';
import axios from 'axios';
import '../styles/Account.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleForgotPassword = async () => {
    try {
      const response = await axios.post('http://localhost:3001/forgot-password', { email });
      setMessage('Password reset email sent');
    } catch (error) {
      setMessage('Error sending password reset email');
    }
  };

  return (
    <div className="account-container">
      <div className="account-form">
        <h1 className="brand">Sweetplus Cakehouse</h1>
        <p className="slogan">Reset your password</p>
        <input
          type="email"
          placeholder="E-mail address"
          className="input-field"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button className="sign-in-btn" onClick={handleForgotPassword}>Send reset link</button>
        <p className="sign-up">Remember your password? <a href="/account">Sign in</a></p>
        <p className="message">{message}</p>
      </div>
    </div>
  );
};

export default ForgotPassword;
