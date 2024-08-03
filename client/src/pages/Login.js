import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import '../styles/Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://sweetpluscake-dev.eba-md5dtzmg.us-west-2.elasticbeanstalk.com:8080/api/login', { email, password });
      login(response.data.token);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Error logging in');
    }
  };

  return (
    <div className="login-page">
      <h2 className="login-header">Sign in</h2>
      <div className="login-container">
        <div className="login-form">
          <form onSubmit={handleLogin}>
            <label>Email Address:</label>
            <input
              type="email"
              placeholder="Email address"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label>Password:</label>
            <input
              type="password"
              placeholder="Password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit" className="sign-in-btn">Sign in</button>
            {message && <p className="error-message">Incorrect Email or Password</p>}
            <a href="/forgot-password" className="forgot-password">Forgot your password?</a>
          </form>
        </div>
        <div className="new-customer">
          <h3>New Here?</h3>
          <a href="/signup" className="create-account-btn">Create Account</a>
        </div>
      </div>
    </div>
  );
};

export default Login;
