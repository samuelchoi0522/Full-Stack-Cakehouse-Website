import React, { useState } from "react";
import axios from "axios";
import "../styles/Signup.css";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const validatePassword = (password) => {
    const minLength = /.{8,}/;
    const uppercase = /[A-Z]/;
    const lowercase = /[a-z]/;
    const specialChar = /[!@#$%^&*(),.?":{}|<>]/;

    if (!minLength.test(password)) {
      return "Password must be at least 8 characters long.";
    }
    if (!uppercase.test(password)) {
      return "Password must contain at least one uppercase letter.";
    }
    if (!lowercase.test(password)) {
      return "Password must contain at least one lowercase letter.";
    }
    if (!specialChar.test(password)) {
      return "Password must contain at least one special character.";
    }
    return null;
  };

  const handleSignUp = async () => {
    const passwordError = validatePassword(password);
    if (passwordError) {
      setMessage(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    try {
      // eslint-disable-next-line no-unused-vars
      const response = await axios.post("http://localhost:3001/register", {
        firstName,
        lastName,
        email,
        password,
      });
      setMessage("Signup successful");
      navigate('/verify-email', { state: { email } }); // Redirect to verify email page
    } catch (error) {
      setMessage("User already exists or another error occurred");
    }
  };

  return (
    <div className="signup-page">
      <div className="content">
        <div className="signup-container">
          <h1 className="signup-header">Sign Up</h1>
          <div className="signup-form">
            <label>First Name:</label>
            <input
              type="text"
              placeholder="First Name"
              className="input-field"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <label>Last Name:</label>
            <input
              type="text"
              placeholder="Last Name"
              className="input-field"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
            <label>Email Address:</label>
            <input
              type="email"
              placeholder="E-mail address"
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
            <label>Confirm Password:</label>
            <input
              type="password"
              placeholder="Confirm Password"
              className="input-field"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button className="signup-btn" onClick={handleSignUp}>
              Sign up
            </button>
            <br></br>
            <p className="sign-in">
              Already have an account? <a href="/login">Sign in</a>
            </p>
            <p className="message">{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
