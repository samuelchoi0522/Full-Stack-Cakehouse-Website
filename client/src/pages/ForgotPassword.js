import React, { useState } from "react";
import axios from "axios";
import "../styles/ForgotPassword.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleForgotPassword = async () => {
    if (!email) {
      setMessage("Please enter your email");
      return;
    }
    try {
      const response = await axios.post(
        "http://sweetpluscake-dev.eba-md5dtzmg.us-west-2.elasticbeanstalk.com:8080/api/forgot-password",
        { email }
      );
      setMessage("Password reset email sent");
    } catch (error) {
      setMessage(
        error.response?.data?.error || "Error sending password reset email"
      );
    }
  };

  return (
    <div className="forgot-password-page">
      <div className="content">
        <div className="forgot-password-container">
          <h1 className="forgot-password-header">Forgot Your Password?</h1>
          <p className="forgot-password-description">
            Fill in your email below to request a new password. An email will be
            sent to the address below containing a link to verify your email
            address.
          </p>
          <div className="forgot-password-form">
            <label>Email Address:</label>
            <input
              type="email"
              placeholder="Email Address"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              className="reset-password-btn"
              onClick={handleForgotPassword}
            >
              Reset Password
            </button>
            <p className="message">{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
