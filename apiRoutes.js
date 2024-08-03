const express = require("express");
const router = express.Router();

module.exports = router;

api.get("/user", authenticateToken, async (req, res) => {
    try {
      const result = await pool.query(
        "SELECT first_name, last_name, email FROM users WHERE id = $1",
        [req.user.id]
      );
      const user = result.rows[0];
      if (!user) {
        return res.status(404).send({ error: "User not found" });
      }
      res.send(user);
    } catch (error) {
      console.error("Error fetching user information:", error);
      res.status(500).send({ error: "Internal server error" });
    }
  });
  
  api.get("/orders", authenticateToken, async (req, res) => {
    try {
      const ordersResult = await pool.query(
        "SELECT * FROM orders WHERE user_id = $1 AND fulfillment_status = $2 ORDER BY created_at DESC",
        [req.user.id, "Accepted"]
      );
      res.send(ordersResult.rows);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).send({ error: "Internal server error" });
    }
  });
  
  // Fetch user orders endpoint (only accepted orders)
  api.get("/user/orders", authenticateToken, async (req, res) => {
    try {
      const result = await pool.query(
        "SELECT id, order_details, order_type, size_or_quantity, photo_path FROM orders WHERE user_id = $1 AND status = $2",
        [req.user.id, "Accepted"]
      );
      res.send(result.rows);
    } catch (error) {
      console.error("Error fetching user orders:", error);
      res.status(500).send({ error: "Internal server error" });
    }
  });

  // Fetch all orders (admin only)
api.get(
    "/admin/orders",
    authenticateToken,
    authenticateAdmin,
    async (req, res) => {
      try {
        const result = await pool.query(`
            SELECT orders.*, 
            COALESCE(users.first_name, orders.guest_first_name) AS first_name, 
            COALESCE(users.last_name, orders.guest_last_name) AS last_name, 
            COALESCE(users.email, orders.guest_email) AS email
            FROM orders 
            LEFT JOIN users ON orders.user_id = users.id
            ORDER BY created_at DESC
          `);
  
        res.send(result.rows);
      } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).send({ error: "Internal server error" });
      }
    }
  );

  api.get("/confirm-email", async (req, res) => {
    const token = req.query.token;
  
    if (!token) {
      return res.status(400).send({ error: "Invalid token" });
    }
  
    try {
      const decoded = jwt.verify(token, SECRET_KEY);
      const userId = decoded.userId;
  
      const result = await pool.query(
        "UPDATE users SET email_confirmed = $1 WHERE id = $2 RETURNING *",
        [true, userId]
      );
  
      if (result.rowCount === 0) {
        return res.status(400).send({ error: "User not found" });
      }
  
      res.send({ message: "Email confirmed, you may now log in" });
    } catch (error) {
      console.error("Error confirming email:", error);
      res.status(500).send({ error: "Internal server error" });
    }
  });

  // Get blocked dates
api.get("/blocked-dates", async (req, res) => {
    try {
      const result = await pool.query("SELECT blocked_date FROM blocked_dates");
      const blockedDates = result.rows.map((row) => row.blocked_date);
      res.send(blockedDates);
    } catch (error) {
      console.error("Error fetching blocked dates:", error);
      res.status(500).send({ error: "Internal server error" });
    }
  });

  // Get blocked dates
api.get(
    "/admin/blocked-dates",
    authenticateToken,
    authenticateAdmin,
    async (req, res) => {
      try {
        const result = await pool.query("SELECT blocked_date FROM blocked_dates");
        const blockedDates = result.rows.map((row) => row.blocked_date);
        res.send(blockedDates);
      } catch (error) {
        console.error("Error fetching blocked dates:", error);
        res.status(500).send({ error: "Internal server error" });
      }
    }
  );