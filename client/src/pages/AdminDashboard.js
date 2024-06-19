import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAdminAuth } from '../AdminAuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingOrderId, setEditingOrderId] = useState(null); // To track which order is being edited
  const [newTotalCost, setNewTotalCost] = useState({});

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
          setError('Admin not logged in');
          setLoading(false);
          return;
        }

        const response = await axios.get('http://localhost:3001/admin/orders', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setOrders(response.data);
        setLoading(false);
      } catch (err) {
        setError('Error fetching orders');
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleAcceptOrder = async (orderId) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.put(`http://localhost:3001/admin/orders/${orderId}`, { fulfillmentStatus: 'Accepted' }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setOrders(orders.map(order => order.id === orderId ? { ...order, fulfillment_status: 'Accepted' } : order));
    } catch (err) {
      console.error('Error accepting order:', err);
    }
  };

  const handleUpdateOrder = async (orderId, updatedFields) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.put(`http://localhost:3001/admin/orders/${orderId}`, updatedFields, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setOrders(orders.map(order => order.id === orderId ? { ...order, ...response.data.order } : order));
    } catch (err) {
      console.error('Error updating order:', err);
    }
  };

  const handleTotalCostChange = (orderId, value) => {
    setNewTotalCost({ ...newTotalCost, [orderId]: value });
  };

  const handleSubmitPrice = async (orderId) => {
    const totalCost = newTotalCost[orderId];
    if (!totalCost) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.put(`http://localhost:3001/admin/orders/${orderId}/update-cost`, { totalCost }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setOrders(orders.map(order => order.id === orderId ? { ...order, total_cost: totalCost } : order));
      setNewTotalCost({ ...newTotalCost, [orderId]: '' });
      setEditingOrderId(null); // Stop editing the order after submitting the price
    } catch (err) {
      console.error('Error updating total cost:', err);
    }
  };

  const handleChangePrice = (orderId) => {
    setEditingOrderId(orderId);
  };


  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <table>
        <thead>
          <tr>
            <th>Order Number</th>
            <th>Date</th>
            <th>Customer</th>
            <th>Email</th>
            <th>Payment</th>
            <th>Total</th>
            <th>Order Type</th>
            <th>Size/Quantity</th>
            <th>Photo</th>
            <th>Fulfillment</th>
            <th>Accept Order</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id}>
              <td>{order.order_number}</td>
              <td>{new Date(order.created_at).toLocaleString()}</td>
              <td>{`${order.first_name || ''} ${order.last_name || ''}`}</td>
              <td>{order.email || ''}</td>
              <td>
                {order.fulfillment_status === 'Accepted' ? (
                  <select value={order.payment_status || 'unpaid'} onChange={(e) => handleUpdateOrder(order.id, { paymentStatus: e.target.value })}>
                    <option value="unpaid">Unpaid</option>
                    <option value="downpayment">Downpayment</option>
                    <option value="paid">Paid</option>
                  </select>
                ) : (
                  order.payment_status || 'unpaid'
                )}
              </td>
              <td>
                {order.total_cost !== null && order.total_cost !== undefined ? (
                  <>
                    {order.total_cost}
                    {editingOrderId === order.id ? (
                      <>
                        <input
                          type="number"
                          value={newTotalCost[order.id] ?? ''}
                          onChange={(e) => handleTotalCostChange(order.id, e.target.value)}
                        />
                        <button onClick={() => handleSubmitPrice(order.id)}>Submit Price</button>
                      </>
                    ) : (
                      <button onClick={() => handleChangePrice(order.id)}>Change Price</button>
                    )}
                  </>
                ) : (
                  <>
                    <input
                      type="number"
                      value={newTotalCost[order.id] ?? ''}
                      onChange={(e) => handleTotalCostChange(order.id, e.target.value)}
                    />
                    <button onClick={() => handleSubmitPrice(order.id)}>Submit Price</button>
                  </>
                )}
              </td>
              <td>{order.order_type || ''}</td>
              <td>{order.size_or_quantity || ''}</td>
              <td>
                <img src={`http://localhost:3001/${order.photo_path}`} alt="Order" style={{ width: '100px' }} />
              </td>
              <td>
                {order.fulfillment_status === 'Accepted' ? (
                  <select value={order.fulfillment_status || 'unfulfilled'} onChange={(e) => handleUpdateOrder(order.id, { fulfillmentStatus: e.target.value })}>
                    <option value="unfulfilled">Unfulfilled</option>
                    <option value="fulfilled">Fulfilled</option>
                  </select>
                ) : (
                  order.fulfillment_status || 'unfulfilled'
                )}
              </td>
              <td>
                {order.fulfillment_status === 'Accepted' ? (
                  'Order Accepted'
                ) : (
                  <button onClick={() => handleAcceptOrder(order.id)}>Accept Order</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;
