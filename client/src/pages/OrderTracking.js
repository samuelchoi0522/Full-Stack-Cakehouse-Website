import React, { useEffect, useState } from 'react';
import axios from 'axios';

const OrderTracking = () => {
  const [status, setStatus] = useState('We’ve received your order');

  useEffect(() => {
    // Fetch the order status from the backend
    const fetchStatus = async () => {
      const response = await axios.get('/api/order/status');
      setStatus(response.data.status);
    };

    fetchStatus();
  }, []);

  const getStatusProgress = () => {
    switch (status) {
      case 'We’ve received your order':
        return 33;
      case 'In the oven':
        return 66;
      case 'Ready for pickup':
        return 100;
      default:
        return 0;
    }
  };

  return (
    <div>
      <h1>Order Tracking</h1>
      <div>
        <p>{status}</p>
        <progress value={getStatusProgress()} max="100"></progress>
      </div>
    </div>
  );
};

export default OrderTracking;
