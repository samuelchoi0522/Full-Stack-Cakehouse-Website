import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAdminAuth } from "../AdminAuthContext";
import DatePicker from "react-datepicker";
import { useNavigate } from "react-router-dom";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/AdminDashboard.css";

const AdminDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAdminAuthenticated, logoutAdmin } = useAdminAuth();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [blockedDates, setBlockedDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [newTotalCost, setNewTotalCost] = useState({});
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [pendingCollapsed, setPendingCollapsed] = useState(false);
  const [acceptedCollapsed, setAcceptedCollapsed] = useState(false);
  const [finishedCollapsed, setFinishedCollapsed] = useState(false);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        setError("Admin not logged in");
        setLoading(false);
        return;
      }

      const response = await axios.get("http://localhost:3001/admin/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setOrders(response.data);
      setLoading(false);
    } catch (err) {
      setError("Error fetching orders");
      setLoading(false);
    }
  };

  const fetchBlockedDates = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.get("http://localhost:3001/blocked-dates", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const dates = response.data.map((date) => new Date(date)); // Convert strings to Date objects
      setBlockedDates(dates);
    } catch (err) {
      console.error("Error fetching blocked dates:", err);
    }
  };

  useEffect(() => {
    if (!isAdminAuthenticated) {
      navigate("/admin/login");
      return;
    }

    fetchOrders();
    fetchBlockedDates();
  }, [isAdminAuthenticated, navigate]);

  const handleBlockDate = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        throw new Error("Admin not logged in");
      }

      const response = await axios.post(
        "http://localhost:3001/blocked-dates",
        { date: selectedDate.toISOString().split("T")[0] }, // Convert to ISO string and remove time part
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(response.data);
      fetchBlockedDates(); // Refresh the blocked dates list
      setSelectedDate(null); // Reset the selected date
    } catch (error) {
      console.error("Error blocking date:", error);
    }
  };

  const handleUnblockDate = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        throw new Error("Admin not logged in");
      }

      const dateToSend = selectedDate.toISOString().split("T")[0];
      console.log("Date to unblock:", dateToSend); // Debugging statement

      const response = await axios.delete(
        `http://localhost:3001/blocked-dates/${dateToSend}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(response.data);
      fetchBlockedDates(); // Refresh the blocked dates list
      setSelectedDate(null); // Reset the selected date
    } catch (error) {
      console.error("Error unblocking date:", error);
    }
  };

  const handleBlockDateSubmit = (event) => {
    event.preventDefault(); // Prevent form submission
    if (selectedDate) {
      handleBlockDate();
    }
  };

  const handleUnblockDateSubmit = (event) => {
    event.preventDefault(); // Prevent form submission
    if (selectedDate) {
      handleUnblockDate();
    }
  };

  const handleAcceptOrder = async (orderId) => {
    try {
      const token = localStorage.getItem("adminToken");
      // eslint-disable-next-line no-unused-vars
      const response = await axios.put(
        `http://localhost:3001/admin/orders/${orderId}`,
        { fulfillmentStatus: "Accepted" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setOrders(
        orders.map((order) =>
          order.id === orderId
            ? { ...order, fulfillment_status: "Accepted" }
            : order
        )
      );
    } catch (err) {
      console.error("Error accepting order:", err);
    }
  };

  const handleUpdateOrder = async (orderId, updatedFields) => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.put(
        `http://localhost:3001/admin/orders/${orderId}`,
        updatedFields,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setOrders(
        orders.map((order) =>
          order.id === orderId ? { ...order, ...response.data.order } : order
        )
      );
    } catch (err) {
      console.error("Error updating order:", err);
    }
  };

  const handleTotalCostChange = (orderId, value) => {
    setNewTotalCost({ ...newTotalCost, [orderId]: value });
  };

  const handleSubmitPrice = async (orderId) => {
    const totalCost = newTotalCost[orderId];
    if (!totalCost) return;

    try {
      const token = localStorage.getItem("adminToken");
      // eslint-disable-next-line no-unused-vars
      const response = await axios.put(
        `http://localhost:3001/admin/orders/${orderId}/update-cost`,
        { totalCost },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setOrders(
        orders.map((order) =>
          order.id === orderId ? { ...order, total_cost: totalCost } : order
        )
      );
      setNewTotalCost({ ...newTotalCost, [orderId]: "" });
      setEditingOrderId(null); // Stop editing the order after submitting the price
    } catch (err) {
      console.error("Error updating total cost:", err);
    }
  };

  const handleChangePrice = (orderId) => {
    setEditingOrderId(orderId);
  };

  const isBlockedDate = (date) => {
    return blockedDates.some(
      (blockedDate) =>
        blockedDate.toISOString().split("T")[0] ===
        date.toISOString().split("T")[0]
    );
  };

  const isAutoBlockedDate = (date) => {
    const today = new Date();
    const twoDaysAfterToday = new Date();
    twoDaysAfterToday.setDate(today.getDate() + 2);

    return date <= twoDaysAfterToday;
  };

  const dayClassName = (date) => {
    if (isAutoBlockedDate(date)) {
      return "unavailable-date";
    }
    return isBlockedDate(date) ? "unavailable-date" : "available-date";
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      await axios.post(
        "http://localhost:3001/admin/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      logoutAdmin();
    } catch (error) {
      setMessage("Error logging out");
    }
  };

  if (!isAdminAuthenticated) {
    return null; // Prevents flickering before redirecting to login
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  const pendingOrders = orders.filter(
    (order) =>
      order.fulfillment_status !== "Accepted" &&
      order.fulfillment_status !== "fulfilled"
  );

  const acceptedOrders = orders.filter(
    (order) => order.fulfillment_status === "Accepted"
  );

  const finishedOrders = orders.filter(
    (order) => order.fulfillment_status === "fulfilled"
  );

  return (
    <div className="admin-dashboard">
      <h1 className="dashboard-header">
        Admin Dashboard
        <button className="logoutbutton" onClick={handleLogout}>
          Logout
        </button>
      </h1>

      {message && <p>{message}</p>}
      <form onSubmit={handleBlockDateSubmit}>
        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          highlightDates={blockedDates}
          dayClassName={dayClassName}
          inline
        />
        <br></br>
        <br></br>
        <button type="submit" className="blockdate">Block Date</button>
      </form>
      <form onSubmit={handleUnblockDateSubmit}>
      <br></br>
        <button type="submit">Unblock Date</button>
      </form>

      <h2 onClick={() => setPendingCollapsed(!pendingCollapsed)}>
        Orders for Review {pendingCollapsed ? "▼" : "▲"}
      </h2>
      {!pendingCollapsed && (
        <OrderList
          orders={pendingOrders}
          handleAcceptOrder={handleAcceptOrder}
          handleUpdateOrder={handleUpdateOrder}
          handleChangePrice={handleChangePrice}
          handleSubmitPrice={handleSubmitPrice}
          editingOrderId={editingOrderId}
          newTotalCost={newTotalCost}
          handleTotalCostChange={handleTotalCostChange}
        />
      )}

      <h2 onClick={() => setAcceptedCollapsed(!acceptedCollapsed)}>
        Processing Orders {acceptedCollapsed ? "▼" : "▲"}
      </h2>
      {!acceptedCollapsed && (
        <OrderList
          orders={acceptedOrders}
          handleAcceptOrder={handleAcceptOrder}
          handleUpdateOrder={handleUpdateOrder}
          handleChangePrice={handleChangePrice}
          handleSubmitPrice={handleSubmitPrice}
          editingOrderId={editingOrderId}
          newTotalCost={newTotalCost}
          handleTotalCostChange={handleTotalCostChange}
        />
      )}

      <h2 onClick={() => setFinishedCollapsed(!finishedCollapsed)}>
        Finished Orders {finishedCollapsed ? "▼" : "▲"}
      </h2>
      {!finishedCollapsed && (
        <OrderList
          orders={finishedOrders}
          handleAcceptOrder={handleAcceptOrder}
          handleUpdateOrder={handleUpdateOrder}
          handleChangePrice={handleChangePrice}
          handleSubmitPrice={handleSubmitPrice}
          editingOrderId={editingOrderId}
          newTotalCost={newTotalCost}
          handleTotalCostChange={handleTotalCostChange}
        />
      )}
    </div>
  );
};

const OrderList = ({
  orders,
  handleAcceptOrder,
  handleUpdateOrder,
  handleChangePrice,
  handleSubmitPrice,
  editingOrderId,
  newTotalCost,
  handleTotalCostChange,
}) => (
  <ul>
    {orders.map((order) => (
      <li key={order.id} className="order-item">
        <div className="order-header">
          <div>
            <p>
              <strong>Customer Name: </strong>
              {`${order.first_name || ""} ${order.last_name || ""}`}
            </p>
            <p>
              <strong>Email: </strong>
              {order.email || ""}
            </p>
            <p>
              <strong>Order Placed:</strong>{" "}
              {new Date(order.created_at).toLocaleDateString()}
            </p>
            <p>
              <strong>Total:</strong>{" "}
              {order.total_cost ? `$${order.total_cost}` : "Pending"}
            </p>
            <p>
              <strong>Pickup Date:</strong>{" "}
              {new Date(order.pickup_date).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p>
              <strong>Order Number:</strong> {order.order_number}
            </p>
            <p>
              <strong>Pickup Option:</strong> {order.pickup_option}
            </p>
            {order.pickup_option === "Delivery" ? (
              <p>
                <strong>Delivery Address:</strong> {order.delivery_address}
              </p>
            ) : null}
            <p>
              <strong>Fulfillment Status:</strong>
              <select
                value={order.fulfillment_status || "unfulfilled"}
                onChange={(e) =>
                  handleUpdateOrder(order.id, {
                    fulfillmentStatus: e.target.value,
                  })
                }
              >
                <option value="unfulfilled">Unfulfilled</option>
                <option value="fulfilled">Fulfilled</option>
              </select>
            </p>
            <p>
              <strong>Payment Status:</strong>
              <select
                value={order.payment_status || "unpaid"}
                onChange={(e) =>
                  handleUpdateOrder(order.id, {
                    paymentStatus: e.target.value,
                  })
                }
              >
                <option value="unpaid">Unpaid</option>
                <option value="downpayment">Downpayment</option>
                <option value="paid">Paid</option>
              </select>
            </p>
          </div>
        </div>
        <div className="order-details">
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
                <strong>Flower Decoration:</strong> {order.flower_decoration}
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
            <strong>Dietary Restrictions:</strong> {order.dietary_restrictions}
          </p>
        </div>
        <div className="order-footer">
          <img
            src={`http://localhost:3001/${order.photo_path}`}
            alt="Order"
            className="order-photo"
          />
          <div className="order-actions">
            {editingOrderId === order.id ? (
              <>
                <input
                  type="number"
                  value={newTotalCost[order.id] ?? ""}
                  onChange={(e) =>
                    handleTotalCostChange(order.id, e.target.value)
                  }
                />
                <button onClick={() => handleSubmitPrice(order.id)}>
                  Submit Price
                </button>
              </>
            ) : (
              <button onClick={() => handleChangePrice(order.id)}>
                Change Price
              </button>
            )}
            {order.fulfillment_status !== "Accepted" && (
              <button onClick={() => handleAcceptOrder(order.id)}>
                Accept Order
              </button>
            )}
          </div>
        </div>
      </li>
    ))}
  </ul>
);

export default AdminDashboard;
