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

        const userResponse = await axios.get("http://localhost:3001/user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const ordersResponse = await axios.get("http://localhost:3001/orders", {
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
      <h1>Account Information</h1>
      <p>
        <strong>First Name:</strong> {user.firstName}
      </p>
      <p>
        <strong>Last Name:</strong> {user.lastName}
      </p>
      <p>
        <strong>Email:</strong> {user.email}
      </p>

      <h2>Your Orders</h2>
      {orders.length === 0 ? (
        <p>No orders found</p>
      ) : (
        <ul>
          {orders.map((order) => (
            <li key={order.id}>
              <p>
                <strong>Order Number:</strong> {order.order_number}
              </p>
              <p>
                <strong>Order Type:</strong> {order.order_type}
              </p>
              {order.order_type === "Cupcake" ? (
                <>
                  <p>
                    <strong>Cupcake Count:</strong> {order.cupcake_count}
                  </p>
                  <p>
                    <strong>Cupcake Flavor:</strong> {order.cupcake_flavor}
                  </p>
                  <p>
                    <strong>Frosting Flavor:</strong> {order.frosting_flavor}
                  </p>
                  <p>
                    <strong>Fruit Toppings:</strong> {order.fruit_toppings}
                  </p>
                  <p>
                    <strong>Flower Decoration:</strong>{" "}
                    {order.flower_decoration}
                  </p>
                  <p>
                    <strong>Cupcake Design:</strong> {order.cupcake_design}
                  </p>
                </>
              ) : (
                <>
                  <p>
                    <strong>Cake Size:</strong> {order.cake_size}
                  </p>
                  <p>
                    <strong>Cake Flavor:</strong> {order.cake_flavor}
                  </p>
                  <p>
                    <strong>Cake Filling:</strong> {order.cake_filling}
                  </p>
                  <p>
                    <strong>Cake Decoration:</strong> {order.cake_decoration}
                  </p>
                  <p>
                    <strong>Cake Design:</strong> {order.cake_design}
                  </p>
                </>
              )}
              <p>
                <strong>Pickup Date:</strong>{" "}
                {new Date(order.pickup_date).toLocaleDateString()}
              </p>
              <p>
                <strong>Pickup Option:</strong> {order.pickup_option}
              </p>
              <p>
                <strong>Dietary Restrictions:</strong>{" "}
                {order.dietary_restrictions}
              </p>
              <p>
                <strong>Order Status:</strong> {order.status}
              </p>
              <p>
                <strong>Payment Status:</strong> {order.payment_status}
              </p>
              <p>
                <strong>Total Cost:</strong> ${order.total_cost}
              </p>
              <p>
                <strong>Fulfillment Status:</strong> {order.fulfillment_status}
              </p>
              {order.photo_path && (
                <img
                  src={`http://localhost:3001/${order.photo_path}`}
                  alt="Order"
                  style={{ width: "100px" }}
                />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Account;
