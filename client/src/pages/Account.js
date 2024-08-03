import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";
import "../styles/Account.css";

const Account = () => {
  const { isAuthenticated } = useAuth();
  const [user, setUser] = useState({ firstName: "", lastName: "", email: "" });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("User not logged in");
          setLoading(false);
          return;
        }

        const userResponse = await axios.get("http://sweetpluscake-dev.eba-md5dtzmg.us-west-2.elasticbeanstalk.com:8080/api/user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const ordersResponse = await axios.get("http://sweetpluscake-dev.eba-md5dtzmg.us-west-2.elasticbeanstalk.com:8080/api/orders", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser({
          firstName: userResponse.data.first_name,
          lastName: userResponse.data.last_name,
          email: userResponse.data.email,
        });
        setOrders(ordersResponse.data);
        setLoading(false);
      } catch (err) {
        setError("Error fetching user data");
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
      <h1>Hey, {user.firstName}!</h1>

      <h2>Your Orders</h2>
      {orders.length === 0 ? (
        <p>No orders found</p>
      ) : (
        <ul>
          {orders.map((order) => (
            <li key={order.id} className="order-item">
              <div className="order-header">
                <div>
                  <p><strong>Order Placed:</strong> {new Date(order.created_at).toLocaleDateString()}</p>
                  <p><strong>Total:</strong> {order.total_cost ? `$${order.total_cost}` : 'Pending'}</p>
                  <p><strong>Pickup Date:</strong> {new Date(order.pickup_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p><strong>Order Number:</strong> {order.order_number}</p>
                  <p><strong>Pickup Option:</strong> {order.pickup_option}</p>
                  {order.pickup_option === "Delivery" && (
                    <p><strong>Delivery Address:</strong> {order.delivery_address}</p>
                  )}
                </div>
              </div>
              <div className="order-details">
                <p><strong>Order Type:</strong> {order.order_type}</p>
                {order.order_type === "Cupcake" ? (
                  <>
                    <p><strong>Cupcake Count:</strong> {order.cupcake_count}</p>
                    <p><strong>Cupcake Flavor:</strong> {order.cupcake_flavor}</p>
                    <p><strong>Frosting Flavor:</strong> {order.frosting_flavor}</p>
                    <p><strong>Fruit Toppings:</strong> {order.fruit_toppings}</p>
                    <p><strong>Flower Decoration:</strong> {order.flower_decoration}</p>
                  </>
                ) : (
                  <>
                    <p><strong>Cake Size:</strong> {order.cake_size}</p>
                    <p><strong>Cake Flavor:</strong> {order.cake_flavor}</p>
                    <p><strong>Cake Filling:</strong> {order.cake_filling}</p>
                    <p><strong>Cake Decoration:</strong> {order.cake_decoration}</p>
                  </>
                )}
                <p><strong>Dietary Restrictions:</strong> {order.dietary_restrictions}</p>
                <p><strong>Fulfillment Status:</strong> {order.fulfillment_status}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Account;
