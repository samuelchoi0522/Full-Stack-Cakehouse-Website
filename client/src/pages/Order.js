import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/Order.css';

const Order = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState('');
  const [orderType, setOrderType] = useState('Cake');
  const [sizeOrQuantity, setSizeOrQuantity] = useState('');
  const [photo, setPhoto] = useState(null);
  const [message, setMessage] = useState('');

  const handleOrder = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('You must be logged in to place an order');
        navigate('/login');
        return;
      }

      const formData = new FormData();
      formData.append('orderDetails', orderDetails);
      formData.append('orderType', orderType);
      formData.append('sizeOrQuantity', sizeOrQuantity);
      if (photo) {
        formData.append('photo', photo);
      }

      console.log('Placing order with token:', token);

      const response = await axios.post('http://localhost:3001/order', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Order response:', response.data);

      setMessage('Order placed successfully');
    } catch (error) {
      console.error('Error placing order:', error.response);
      setMessage(error.response?.data?.error || 'Error placing order');
    }
  };

  if (!isAuthenticated) {
    return <p>You must be logged in to place an order. <a href="/login">Login</a></p>;
  }

  return (
    <div className="order-container">
      <h1>Place Your Order</h1>
      <textarea
        placeholder="Enter order details"
        value={orderDetails}
        onChange={(e) => setOrderDetails(e.target.value)}
      ></textarea>
      <div>
        <label>Order Type:</label>
        <select value={orderType} onChange={(e) => setOrderType(e.target.value)}>
          <option value="Cake">Cake</option>
          <option value="Cupcake">Cupcake</option>
        </select>
      </div>
      <div>
        {orderType === 'Cake' ? (
          <>
            <label>Cake Size:</label>
            <input
              type="text"
              placeholder="Enter cake size"
              value={sizeOrQuantity}
              onChange={(e) => setSizeOrQuantity(e.target.value)}
            />
          </>
        ) : (
          <>
            <label>Cupcake Quantity:</label>
            <input
              type="number"
              placeholder="Enter cupcake quantity"
              value={sizeOrQuantity}
              onChange={(e) => setSizeOrQuantity(e.target.value)}
            />
          </>
        )}
      </div>
      <div>
        <label>Upload Photo:</label>
        <input type="file" onChange={(e) => setPhoto(e.target.files[0])} />
      </div>
      <button onClick={handleOrder}>Place Order</button>
      <p>{message}</p>
    </div>
  );
};

export default Order;
