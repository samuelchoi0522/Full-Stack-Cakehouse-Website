import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/OrderSuccess.css";
import greenCheckmark from "../photos/GreenCheckmarkOrderSubmitted.png";

const OrderSuccess = () => {
  const navigate = useNavigate(); // Initialize useNavigate

  const handleViewOrders = () => {
    navigate("/account");
  };

  return (
    <div className="order-success-container">
      <div className="order-success-content">
        <img src={greenCheckmark} alt="Order Submitted" className="checkmark" />
        <h2>Thank you for your order!</h2>
        <p>
          Your order has been successfully submitted and is processing. Please do
          not resubmit another order and contact me directly for any concerns.
          Once your order processes, you will receive a confirmation email and
          your account dashboard will update showing the order under ‘Your Orders’
          within 24 hours.
        </p>
        <button className="view-order-button" onClick={handleViewOrders}>
          View Orders
        </button>
      </div>
    </div>
  );
};

export default OrderSuccess;
