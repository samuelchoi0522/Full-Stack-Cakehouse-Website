import React, { useState } from 'react';
import axios from 'axios';
import '../styles/Account.css';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSignUp = async () => {
    try {
      const response = await axios.post('http://localhost:3001/register', { email, password });
      setMessage('Signup successful');
    } catch (error) {
      setMessage('User already exists');
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
        <button className="sign-in-btn" onClick={handleSignUp}>Sign up</button>
        <p className="sign-up">Already have an account? <a href="/account">Sign in</a></p>
        <p className="message">{message}</p>
      </div>
    </div>
  );
};

export default Signup;
