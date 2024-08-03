import React, { useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import '../styles/ResetPassword.css'; // Import the new CSS file

const ResetPassword = () => {
  const { token } = useParams(); // Make sure the token is in the URL like /reset-password/:token
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleResetPassword = async () => {
    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    try {
      const response = await axios.post('http://sweetpluscake-dev.eba-md5dtzmg.us-west-2.elasticbeanstalk.com:8080/api/reset-password', { token, password });
      setMessage(response.data.message);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Error resetting password');
    }
  };

  return (
    <div className="reset-password-container">
      <div className="reset-password-content">
        <h1>Reset Password</h1>
        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-field"
        />
        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="input-field"
        />
        <button onClick={handleResetPassword} className="reset-password-btn">Reset Password</button>
        <p className="message">{message}</p>
      </div>
    </div>
  );
};

export default ResetPassword;
