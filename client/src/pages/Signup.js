import React, { useState } from "react";
import axios from "axios";
import "../styles/Account.css";

const Signup = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    try {
      const response = await axios.post("http://localhost:3001/register", {
        firstName,
        lastName,
        email,
        password,
      });
      setMessage("Signup successful");
    } catch (error) {
      setMessage("User already exists or another error occurred");
    }
  };

  return (
    <div className="account-container">
      <div className="account-form">
        <h1 className="brand">Sweetplus Cakehouse</h1>
        <p className="slogan">&nbsp;</p>
        <input
          type="text"
          placeholder="First Name"
          className="input-field"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Last Name"
          className="input-field"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
        <input
          type="email"
          placeholder="E-mail address"
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
        <input
          type="password"
          placeholder="Confirm Password"
          className="input-field"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <button className="sign-in-btn" onClick={handleSignUp}>
          Sign up
        </button>
        <p className="sign-up">
          Already have an account? <a href="/login">Sign in</a>
        </p>
        <p className="message">{message}</p>
      </div>
    </div>
  );
};

export default Signup;
