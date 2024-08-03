import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../styles/VerifyEmail.css';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { email } = location.state || {};

  const handleResendEmail = async () => {
    try {
      await axios.post('http://sweetpluscake-dev.eba-md5dtzmg.us-west-2.elasticbeanstalk.com:8080/api/resend-verification', { email });
      alert('Verification email resent successfully');
    } catch (error) {
      alert('Error resending verification email');
    }
  };

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  return (
    <div className="verify-email-container">
      <div className="verify-email-content">
        <img src={require('../photos/GreenCheckmarkOrderSubmitted.png')} alt="Email Sent" className="checkmark" />
        <h2 className="verifyheader">We've sent a verification email to:</h2>
        <p>{email}</p>
        <p>
          Click the link in your email to verify your account. If you can’t find the email, check your spam folder or{' '}
          <span className="resend-link" onClick={handleResendEmail}>click here to resend</span>.
        </p>
        <p>
          After verifying your email <span className="login-link" onClick={handleLoginRedirect}>Log in</span>
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;
