require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const pool = require("./db"); // Import the PostgreSQL connection pool
const nodemailer = require("nodemailer");

const app = express();
app.use(bodyParser.json());
app.use(cors());

const SECRET_KEY = "your_secret_key"; // You should store this in environment variables

const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "sweetpluscake@gmail.com",
    pass: "pfxs neqn lpzy hmon",
  },
});

// Ensure uploads directory exists
const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token)
    return res.status(401).send({ error: "Access denied, token missing!" });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).send({ error: "Token is not valid" });
    req.user = user;
    next();
  });
};

// Middleware to check admin role
const authenticateAdmin = (req, res, next) => {
  if (!req.user || !req.user.is_admin) {
    return res.status(403).send({ error: "Access denied, admin only" });
  }
  next();
};

// Function to generate a random order number
const generateOrderNumber = async () => {
  let orderNumber;
  let isUnique = false;

  let i = 0;

  while (!isUnique) {
    orderNumber = 1000 + i; // Generates a number between 1000 and 9999
    const result = await pool.query(
      "SELECT * FROM orders WHERE order_number = $1",
      [orderNumber]
    );
    if (result.rows.length === 0) {
      isUnique = true;
    } else {
      i++;
    }
  }
  return orderNumber;
};

app.post("/order", upload.single("photo"), async (req, res) => {
  const {
    orderType,
    cupcakeCount,
    cupcakeFlavor,
    frostingFlavor,
    fruitToppings,
    flowerDecoration,
    cupcakeDesign,
    cakeSize,
    cakeFlavor,
    cakeFilling,
    cakeDecoration,
    cakeDesign,
    pickupDate,
    pickupOption,
    dietaryRestrictions,
    delivery_address,
    guestFirstName,
    guestLastName,
    guestEmail,
  } = req.body;

  const photoPath = req.file ? req.file.path : null;

  let userId = null;
  let isGuest = false;

  // Check if the request has an Authorization header
  const authHeader = req.headers["authorization"];
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    if (token) {
      try {
        const user = jwt.verify(token, SECRET_KEY);
        userId = user.id;
      } catch (err) {
        return res.status(403).send({ error: "Token is not valid" });
      }
    }
  }

  // If no user ID is set, this is a guest order
  if (!userId) {
    isGuest = true;
    if (!guestFirstName || !guestLastName || !guestEmail) {
      return res.status(400).send({ error: "Guest information is required" });
    }
  }

  const orderDetails = `
      Order Type: ${orderType}
      ${
        orderType === "Cake"
          ? `
      Cake Size: ${cakeSize}
      Cake Flavor: ${cakeFlavor}
      Cake Filling: ${cakeFilling}
      Cake Decoration: ${cakeDecoration}
      Cake Design: ${cakeDesign}
      `
          : `
      Cupcake Count: ${cupcakeCount}
      Cupcake Flavor: ${cupcakeFlavor}
      Frosting Flavor: ${frostingFlavor}
      Fruit Toppings: ${fruitToppings}
      Flower Decoration: ${flowerDecoration}
      Cupcake Design: ${cupcakeDesign}
      `
      }
      Pickup Date: ${pickupDate}
      Pickup Option: ${pickupOption}
      Dietary Restrictions: ${dietaryRestrictions}
      Delivery Address: ${delivery_address}
    `;

  try {
    const orderNumber = await generateOrderNumber();

    const result = await pool.query(
      "INSERT INTO orders (user_id, order_details, order_type, cupcake_count, cupcake_flavor, frosting_flavor, fruit_toppings, flower_decoration, cupcake_design, cake_size, cake_flavor, cake_filling, cake_decoration, cake_design, pickup_date, pickup_option, dietary_restrictions, delivery_address, photo_path, order_number, guest_first_name, guest_last_name, guest_email) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23) RETURNING *",
      [
        userId,
        orderDetails,
        orderType,
        cupcakeCount,
        cupcakeFlavor,
        frostingFlavor,
        fruitToppings,
        flowerDecoration,
        cupcakeDesign,
        cakeSize,
        cakeFlavor,
        cakeFilling,
        cakeDecoration,
        cakeDesign,
        new Date(pickupDate),
        pickupOption,
        dietaryRestrictions,
        delivery_address,
        photoPath,
        orderNumber,
        isGuest ? guestFirstName : null,
        isGuest ? guestLastName : null,
        isGuest ? guestEmail : null,
      ]
    );

    console.log("Incoming order data:", {
      user_id: userId,
      orderType,
      cupcakeCount,
      cupcakeFlavor,
      frostingFlavor,
      fruitToppings,
      flowerDecoration,
      cupcakeDesign,
      cakeSize,
      cakeFlavor,
      cakeFilling,
      cakeDecoration,
      cakeDesign,
      pickupDate,
      pickupOption,
      dietaryRestrictions,
      delivery_address,
      photoPath,
      orderDetails, // Add orderDetails to the log
    });

    res.status(201).send({ message: "Order created", order: result.rows[0] });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).send({ error: "Internal server error" });
  }
});

// Fetch user information endpoint
app.get("/user", authenticateToken, async (req, res) => {
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

app.get("/orders", authenticateToken, async (req, res) => {
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
app.get("/user/orders", authenticateToken, async (req, res) => {
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

app.post(
  "/admin/logout",
  authenticateToken,
  authenticateAdmin,
  async (req, res) => {
    try {
      await pool.query(
        "INSERT INTO admin_logs (admin_id, action) VALUES ($1, $2)",
        [req.user.id, "logout"]
      );
      res.send({ message: "Logged out successfully" });
    } catch (error) {
      console.error("Error logging out admin:", error);
      res.status(500).send({ error: "Internal server error" });
    }
  }
);

// Admin login endpoint
app.post("/admin/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1 AND is_admin = TRUE",
      [email]
    );
    const user = result.rows[0];
    if (!user) {
      return res.status(400).send({ error: "Invalid email or password" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).send({ error: "Invalid email or password" });
    }
    const token = jwt.sign(
      { id: user.id, email: user.email, is_admin: true },
      SECRET_KEY
    );
    res.send({ token });
  } catch (error) {
    console.error("Error logging in admin:", error);
    res.status(500).send({ error: "Internal server error" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send({ error: "Email and password are required" });
  }

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    const user = result.rows[0];

    if (!user) {
      console.log("No user found with this email.");
      return res.status(400).send({ error: "Invalid email or password" });
    }

    if (!user.email_confirmed) {
      console.log("Email not confirmed for user:", email);
      return res
        .status(400)
        .send({ error: "Please confirm your email before logging in" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.log("Invalid password for user:", email);
      return res.status(400).send({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, is_admin: user.is_admin },
      SECRET_KEY
    );
    res.send({ token });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).send({ error: "Internal server error" });
  }
});

// Fetch all orders (admin only)
app.get(
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

// Update order status, payment status, and total cost (admin only)
app.put(
  "/admin/orders/:id",
  authenticateToken,
  authenticateAdmin,
  async (req, res) => {
    const { paymentStatus, fulfillmentStatus, totalCost } = req.body;
    try {
      const orderResult = await pool.query(
        "SELECT * FROM orders WHERE id = $1",
        [req.params.id]
      );
      const order = orderResult.rows[0];
      if (!order) {
        return res.status(404).send({ error: "Order not found" });
      }

      const userResult = await pool.query("SELECT * FROM users WHERE id = $1", [
        order.user_id,
      ]);
      const user = userResult.rows[0];

      const guestEmail = order.guest_email;
      const email = user ? user.email : guestEmail;
      if (!email) {
        return res.status(404).send({ error: "User or guest email not found" });
      }

      const updatedOrder = await pool.query(
        "UPDATE orders SET fulfillment_status = $1, payment_status = $2, total_cost = $3 WHERE id = $4 RETURNING *",
        [
          fulfillmentStatus || order.fulfillment_status,
          paymentStatus || order.payment_status,
          totalCost || order.total_cost,
          req.params.id,
        ]
      );

      const emailMessage = `
        <html>
          <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
            <div style="background-color: #ffffff; padding: 20px; margin: 20px auto; max-width: 600px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
              <div style="text-align: center; padding: 20px 0;">
                <img src="https://yourdomain.com/logo.png" alt="Logo" style="width: 100px;">
              </div>
              <div style="text-align: left;">
                <h1>Order Update</h1>
                <p>Your order has been updated with the following details:</p>
                <ul>
                  <li>Order Type: ${order.order_type}</li>
                  ${totalCost ? `<li>Total Cost: $${totalCost}</li>` : ""}
                  <li>Payment Status: ${paymentStatus}</li>
                  <li>Fulfillment Status: ${fulfillmentStatus}</li>
                </ul>
              </div>
              <div style="text-align: center; padding: 10px 0; font-size: 12px; color: #888;">
                &copy; 2024 Sweet_Plus Cake House. All rights reserved.
              </div>
            </div>
          </body>
        </html>
      `;

      if (totalCost) {
        await transporter.sendMail({
          to: email,
          subject: "Order Update",
          html: emailMessage,
        });
      }

      if (fulfillmentStatus === "fulfilled") {
        await transporter.sendMail({
          to: email,
          subject: "Order Fulfilled",
          html: `<p>Your order has been fulfilled. ${emailMessage}</p>`,
        });
      }

      if (fulfillmentStatus === "Accepted") {
        await transporter.sendMail({
          to: email,
          subject: "Order Accepted",
          html: `<p>Your order has been accepted. ${emailMessage}</p>`,
        });
      }

      res.send({ message: "Order updated", order: updatedOrder.rows[0] });
    } catch (error) {
      console.error("Error updating order:", error);
      res.status(500).send({ error: "Internal server error" });
    }
  }
);

app.put(
    "/admin/orders/:id/update-cost",
    authenticateToken,
    authenticateAdmin,
    async (req, res) => {
      const { totalCost } = req.body;
      try {
        const orderResult = await pool.query(
          "SELECT * FROM orders WHERE id = $1",
          [req.params.id]
        );
        const order = orderResult.rows[0];
        if (!order) {
          return res.status(404).send({ error: "Order not found" });
        }
  
        const userResult = await pool.query("SELECT * FROM users WHERE id = $1", [
          order.user_id,
        ]);
        const user = userResult.rows[0];
  
        const guestEmail = order.guest_email;
        const email = user ? user.email : guestEmail;
        if (!email) {
          return res.status(404).send({ error: "User or guest email not found" });
        }
  
        const updatedOrder = await pool.query(
          "UPDATE orders SET total_cost = $1 WHERE id = $2 RETURNING *",
          [totalCost, req.params.id]
        );
  
        // Email templates
        const cakeEmailMessage = `
          <html>
            <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
              <div style="background-color: #ffffff; padding: 20px; margin: 20px auto; max-width: 600px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                <div style="text-align: center; padding: 20px 0;">
                  <img src="https://sweetpluscake.com/gallery_gen/a39f21227f710ae5ffd4f53130776506_552x162_fit.jpg?ts=1714925658" alt="Logo" style="width: 100px;">
                </div>
                <div style="text-align: left;">
                  <h1 style="color: #333;">Order Number #${order.order_number} Total Cost Update</h1>
                  <p style="color: #333;">Your order total cost has been updated.</p>
                  <ul style="list-style-type: none; padding: 0; color: black;">
                    <li style="padding: 5px 0;"><strong>Order Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</li>
                    <li style="padding: 5px 0;"><strong>Pickup Date:</strong> ${new Date(order.pickup_date).toLocaleDateString()}</li>
                    <li style="padding: 5px 0;"><strong>Order Type:</strong> ${order.order_type}</li>
                    <li style="padding: 5px 0;"><strong>Cake Size:</strong> ${order.cake_size}</li>
                    <li style="padding: 5px 0;"><strong>Cake Flavor:</strong> ${order.cake_flavor}</li>
                    <li style="padding: 5px 0;"><strong>Cake Filling:</strong> ${order.cake_filling}</li>
                    <li style="padding: 5px 0;"><strong>Cake Decoration:</strong> ${order.cake_decoration}</li>
                    <li style="padding: 5px 0;"><strong>Cake Design:</strong> ${order.cake_design}</li>
                    <li style="padding: 5px 0;"><strong>Total Cost:</strong> $${totalCost}</li>
                  </ul>
                </div>
                <div style="text-align: center; padding: 10px 0; font-size: 12px; color: #888;">
                  &copy; 2024 Sweetplus Cakehouse. All rights reserved.
                </div>
              </div>
            </body>
          </html>
        `;
  
        const cupcakeEmailMessage = `
          <html>
            <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
              <div style="background-color: #ffffff; padding: 20px; margin: 20px auto; max-width: 600px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                <div style="text-align: center; padding: 20px 0;">
                  <img src="https://sweetpluscake.com/gallery_gen/a39f21227f710ae5ffd4f53130776506_552x162_fit.jpg?ts=1714925658" alt="Logo" style="width: 100px;">
                </div>
                <div style="text-align: left;">
                  <h1 style="color: #333;">Order Number #${order.order_number} Total Cost Update</h1>
                  <p style="color: #333;">Your order total cost has been updated.</p>
                  <ul style="list-style-type: none; padding: 0; color: black;">
                    <li style="padding: 5px 0;"><strong>Order Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</li>
                    <li style="padding: 5px 0;"><strong>Pickup Date:</strong> ${new Date(order.pickup_date).toLocaleDateString()}</li>
                    <li style="padding: 5px 0;"><strong>Order Type:</strong> ${order.order_type}</li>
                    <li style="padding: 5px 0;"><strong>Cupcake Count:</strong> ${order.cupcake_count}</li>
                    <li style="padding: 5px 0;"><strong>Frosting Flavor:</strong> ${order.frosting_flavor}</li>
                    <li style="padding: 5px 0;"><strong>Fruit Toppings:</strong> ${order.fruit_toppings}</li>
                    <li style="padding: 5px 0;"><strong>Flower Decoration:</strong> ${order.flower_decoration}</li>
                    <li style="padding: 5px 0;"><strong>Cupcake Design:</strong> ${order.cupcake_design}</li>
                    <li style="padding: 5px 0;"><strong>Total Cost:</strong> $${totalCost}</li>
                  </ul>
                </div>
                <div style="text-align: center; padding: 10px 0; font-size: 12px; color: #888;">
                  &copy; 2024 Sweetplus Cakehouse. All rights reserved.
                </div>
              </div>
            </body>
          </html>
        `;
  
        // Assign the correct template based on order type
        const emailMessage = order.order_type === "Cake" ? cakeEmailMessage : cupcakeEmailMessage;
  
        await transporter.sendMail({
          to: email,
          subject: "Order Total Cost Update",
          html: emailMessage,
        });
  
        res.send({
          message: "Total cost updated and email sent",
          order: updatedOrder.rows[0],
        });
      } catch (error) {
        console.error("Error updating total cost:", error);
        res.status(500).send({ error: "Internal server error" });
      }
    }
  );
  

// Register new user endpoint
app.post("/register", async (req, res) => {
    const { firstName, lastName, email, password } = req.body;
  
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).send({ error: "All fields are required" });
    }
  
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await pool.query(
        "INSERT INTO users (first_name, last_name, email, password, is_email_confirmed) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [firstName, lastName, email, hashedPassword, false]
      );
  
      const user = result.rows[0];
      const token = jwt.sign({ userId: user.id }, SECRET_KEY, {
        expiresIn: "1h",
      });
      const confirmationLink = `http://localhost:3000/confirm-email?token=${token}`;
  
      // Styled email template
      const emailMessage = `
        <html>
          <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
            <div style="background-color: #ffffff; padding: 20px; margin: 20px auto; max-width: 600px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
              <div style="text-align: center; padding: 20px 0;">
                <img src="https://sweetpluscake.com/gallery_gen/a39f21227f710ae5ffd4f53130776506_552x162_fit.jpg?ts=1714925658" alt="Logo" style="width: 100px;">
              </div>
              <div style="text-align: left;">
                <h1 style="color: #333;">Confirm Your Email</h1>
                <p style="color: #333;">Hello ${firstName} ${lastName},</p>
                <p style="color: #333;">Thank you for registering. Please click the link below to confirm your email address:</p>
                <p style="text-align: center;">
                  <a href="${confirmationLink}" style="background-color: #007bff; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Confirm Email</a>
                </p>
                <p style="color: #333;">If you did not create an account, please ignore this email.</p>
              </div>
              <div style="text-align: center; padding: 10px 0; font-size: 12px; color: #888;">
                &copy; 2024 Sweet_Plus Cake House. All rights reserved.
              </div>
            </div>
          </body>
        </html>
      `;
  
      await transporter.sendMail({
        to: email,
        subject: "Email Confirmation",
        html: emailMessage,
      });
  
      res.status(201).send({
        message: "User registered successfully. Please confirm your email.",
      });
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).send({ error: "Internal server error" });
    }
  });
  

app.get("/confirm-email", async (req, res) => {
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

// Forgot password endpoint
app.post("/forgot-password", async (req, res) => {
    const { email } = req.body;
  
    if (!email) {
      return res.status(400).send({ error: "Email is required" });
    }
  
    try {
      const result = await pool.query("SELECT * FROM users WHERE email = $1", [
        email,
      ]);
      const user = result.rows[0];
  
      if (!user) {
        return res.status(400).send({ error: "User not found" });
      }
  
      const token = jwt.sign({ userId: user.id }, SECRET_KEY, {
        expiresIn: "1h",
      });
      const resetLink = `http://localhost:3000/reset-password/${token}`; // Ensure this matches your route
  
      // Styled email template
      const emailMessage = `
        <html>
          <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
            <div style="background-color: #ffffff; padding: 20px; margin: 20px auto; max-width: 600px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
              <div style="text-align: center; padding: 20px 0;">
                <img src="https://sweetpluscake.com/gallery_gen/a39f21227f710ae5ffd4f53130776506_552x162_fit.jpg?ts=1714925658" alt="Logo" style="width: 100px;">
              </div>
              <div style="text-align: left;">
                <h1 style="color: #333;">Password Reset Request</h1>
                <p style="color: #333;">Hello,</p>
                <p style="color: #333;">We received a request to reset your password. Please click the link below to reset your password:</p>
                <p style="text-align: center;">
                  <a href="${resetLink}" style="background-color: #d0021b; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
                </p>
                <p style="color: #333;">If you did not request a password reset, please ignore this email.</p>
              </div>
              <div style="text-align: center; padding: 10px 0; font-size: 12px; color: #888;">
                &copy; 2024 Sweetplus Cakehouse. All rights reserved.
              </div>
            </div>
          </body>
        </html>
      `;
  
      await transporter.sendMail({
        to: email,
        subject: "Password Reset",
        html: emailMessage,
      });
  
      res.send({ message: "Password reset email sent" });
    } catch (error) {
      console.error("Error handling forgot password:", error);
      res.status(500).send({ error: "Internal server error" });
    }
  });
  

app.post("/reset-password", async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).send({ error: "Token and password are required" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query("UPDATE users SET password = $1 WHERE id = $2", [
      hashedPassword,
      decoded.userId,
    ]);

    res.send({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).send({ error: "Internal server error" });
  }
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Get blocked dates
app.get("/blocked-dates", async (req, res) => {
  try {
    const result = await pool.query("SELECT blocked_date FROM blocked_dates");
    const blockedDates = result.rows.map((row) => row.blocked_date);
    res.send(blockedDates);
  } catch (error) {
    console.error("Error fetching blocked dates:", error);
    res.status(500).send({ error: "Internal server error" });
  }
});

// Add a new blocked date
app.post(
  "/blocked-dates",
  authenticateToken,
  authenticateAdmin,
  async (req, res) => {
    const { date } = req.body;
    try {
      await pool.query("INSERT INTO blocked_dates (blocked_date) VALUES ($1)", [
        date,
      ]);
      res.send({ message: "Date blocked successfully" });
    } catch (error) {
      console.error("Error blocking date:", error);
      res.status(500).send({ error: "Internal server error" });
    }
  }
);

// Get blocked dates
app.get(
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

// Add a new blocked date
app.post(
  "/admin/blocked-dates",
  authenticateToken,
  authenticateAdmin,
  async (req, res) => {
    const { date } = req.body;
    try {
      await pool.query("INSERT INTO blocked_dates (blocked_date) VALUES ($1)");
      res.send({ message: "Date blocked successfully" });
    } catch (error) {
      console.error("Error blocking date:", error);
      res.status(500).send({ error: "Internal server error" });
    }
  }
);

// Delete a blocked date
app.delete(
  "/blocked-dates/:date",
  authenticateToken,
  authenticateAdmin,
  async (req, res) => {
    const { date } = req.params;
    console.log("Date to unblock:", date); // Debugging statement
    try {
      const result = await pool.query(
        "DELETE FROM blocked_dates WHERE blocked_date = $1",
        [date]
      );
      if (result.rowCount === 0) {
        return res.status(404).send({ error: "Date not found" });
      }
      res.send({ message: "Date unblocked successfully" });
    } catch (error) {
      console.error("Error unblocking date:", error);
      res.status(500).send({ error: "Internal server error" });
    }
  }
);

const sendVerificationEmail = async (email) => {
  // Logic to send verification email
  console.log(`Verification email sent to ${email}`);
};

app.post("/resend-verification", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).send({ error: "Email is required" });
  }

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    if (user.is_email_confirmed) {
      return res.status(400).send({ error: "Email is already confirmed" });
    }

    const token = jwt.sign({ userId: user.id }, SECRET_KEY, {
      expiresIn: "1h",
    });
    const confirmationLink = `http://localhost:3000/confirm-email?token=${token}`;

    await transporter.sendMail({
      to: email,
      subject: "Email Confirmation",
      html: `<p>Click <a href="${confirmationLink}">here</a> to confirm your email</p>`,
    });

    res.status(200).send({ message: "Verification email resent successfully" });
  } catch (error) {
    console.error("Error resending verification email:", error);
    res.status(500).send({ error: "Internal server error" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
