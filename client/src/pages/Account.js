import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import '../styles/Account.css';

const Account = () => {
  const { isAuthenticated } = useAuth();
  const [user, setUser] = useState({ firstName: '', lastName: '', email: '' });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('User not logged in');
          setLoading(false);
          return;
        }

        const userResponse = await axios.get('http://localhost:3001/user', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser({
          firstName: userResponse.data.first_name,
          lastName: userResponse.data.last_name,
          email: userResponse.data.email,
        });

        const ordersResponse = await axios.get('http://localhost:3001/orders', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setOrders(ordersResponse.data);
        setLoading(false);
      } catch (err) {
        setError('Error fetching data');
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchUserData();
    }
  }, [isAuthenticated]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="accountinfo-container">
      <h1>Account Information</h1>
      <p><strong>First Name:</strong> {user.firstName}</p>
      <p><strong>Last Name:</strong> {user.lastName}</p>
      <p><strong>Email:</strong> {user.email}</p>

      <h2>Orders</h2>
      {orders.length > 0 ? (
        <ul>
          {orders.map(order => (
            <li key={order.id}>
              <p><strong>Order Number:</strong> {order.order_number}</p>
              <p><strong>Order Type:</strong> {order.order_type}</p>
              <p><strong>Size/Quantity:</strong> {order.size_or_quantity}</p>
              <p><strong>Total Cost:</strong> ${order.total_cost}</p>
              <p><strong>Status:</strong> {order.fulfillment_status}</p>
              <p><strong>Payment Status:</strong> {order.payment_status}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No orders found</p>
      )}
    </div>
  );
};

export default Account;
