import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import '../styles/Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const { login } = useAuth();

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:3001/login', { email, password });
      login(response.data.token);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Error logging in');
    }
  };

  return (
    <div className="account-container">
      <div className="account-form">
        <h1 className="brand">Sweetplus Cakehouse</h1>
        <p className="slogan">&nbsp;</p>
        <input
          type="email"
          placeholder="E-mail address or phone number"
          className="input-field"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="input-field"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="sign-in-btn" onClick={handleLogin}>Sign in</button>
        <a href="/forgot-password" className="forgot-password">Forgot password?</a>
        <p className="sign-up">Not a member yet? <a href="/signup">Sign up</a></p>
        <p className="message">{message}</p>
      </div>
    </div>
  );
};

export default Login;
