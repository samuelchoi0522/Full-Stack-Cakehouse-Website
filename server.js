const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('./db'); // Import the PostgreSQL connection pool
const nodemailer = require('nodemailer');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const SECRET_KEY = 'your_secret_key'; // You should store this in environment variables

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'icedcables@gmail.com',
    pass: 'yfkt eelk oypa lcus',
  },
});

// Ensure uploads directory exists
const uploadDir = 'uploads/';
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
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).send({ error: 'Access denied, token missing!' });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).send({ error: 'Token is not valid' });
    req.user = user;
    next();
  });
};

// Middleware to check admin role
const authenticateAdmin = (req, res, next) => {
  if (!req.user || !req.user.is_admin) {
    return res.status(403).send({ error: 'Access denied, admin only' });
  }
  next();
};

// Function to generate a random order number
const generateOrderNumber = async () => {
  let orderNumber;
  let isUnique = false;

  while (!isUnique) {
    orderNumber = Math.floor(Math.random() * 9000) + 1000; // Generates a number between 1000 and 9999
    const result = await pool.query('SELECT * FROM orders WHERE order_number = $1', [orderNumber]);
    if (result.rows.length === 0) {
      isUnique = true;
    }
  }
  return orderNumber;
};

// Order endpoint
app.post('/order', authenticateToken, upload.single('photo'), async (req, res) => {
  const { orderDetails, orderType, sizeOrQuantity } = req.body;
  const photoPath = req.file ? req.file.path : null;
  const totalCost = req.body.totalCost || null;

  if (!orderDetails || !orderType || !sizeOrQuantity || !photoPath) {
    return res.status(400).send({ error: 'Order details, order type, size/quantity, and photo are required' });
  }

  try {
    const orderNumber = await generateOrderNumber();
    const result = await pool.query(
      'INSERT INTO orders (user_id, order_details, order_type, size_or_quantity, photo_path, status, payment_status, total_cost, fulfillment_status, order_number, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW()) RETURNING *',
      [req.user.id, orderDetails, orderType, sizeOrQuantity, photoPath, 'Pending', 'unpaid', totalCost, 'unfulfilled', orderNumber]
    );

    res.status(201).send({ message: 'Order created', order: result.rows[0] });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).send({ error: 'Internal server error' });
  }
});

// Fetch user information endpoint
app.get('/user', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT first_name, last_name, email FROM users WHERE id = $1', [req.user.id]);
    const user = result.rows[0];
    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }
    res.send(user);
  } catch (error) {
    console.error('Error fetching user information:', error);
    res.status(500).send({ error: 'Internal server error' });
  }
});

app.get('/orders', authenticateToken, async (req, res) => {
    try {
      const ordersResult = await pool.query(
        'SELECT * FROM orders WHERE user_id = $1 AND fulfillment_status = $2 ORDER BY created_at DESC',
        [req.user.id, 'Accepted']
      );
      res.send(ordersResult.rows);
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).send({ error: 'Internal server error' });
    }
  });
  
  
  

// Fetch user orders endpoint (only accepted orders)
app.get('/user/orders', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, order_details, order_type, size_or_quantity, photo_path FROM orders WHERE user_id = $1 AND status = $2', [req.user.id, 'Accepted']);
    res.send(result.rows);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).send({ error: 'Internal server error' });
  }
});

// Admin login endpoint
app.post('/admin/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1 AND is_admin = TRUE', [email]);
    const user = result.rows[0];
    if (!user) {
      return res.status(400).send({ error: 'Invalid email or password' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).send({ error: 'Invalid email or password' });
    }
    const token = jwt.sign({ id: user.id, email: user.email, is_admin: true }, SECRET_KEY);
    res.send({ token });
  } catch (error) {
    console.error('Error logging in admin:', error);
    res.status(500).send({ error: 'Internal server error' });
  }
});

// Normal user login endpoint
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user) {
      return res.status(400).send({ error: 'Invalid email or password' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).send({ error: 'Invalid email or password' });
    }
    const token = jwt.sign({ id: user.id, email: user.email, is_admin: user.is_admin }, SECRET_KEY);
    res.send({ token });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).send({ error: 'Internal server error' });
  }
});

// Fetch all orders (admin only)
app.get('/admin/orders', authenticateToken, authenticateAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT o.id, o.order_number, o.order_details, o.order_type, o.size_or_quantity, o.photo_path, o.payment_status, o.total_cost, o.fulfillment_status, o.created_at, u.first_name, u.last_name, u.email
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `);
    res.send(result.rows);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).send({ error: 'Internal server error' });
  }
});

// Update order status, payment status, and total cost (admin only)
app.put('/admin/orders/:id', authenticateToken, authenticateAdmin, async (req, res) => {
    const { paymentStatus, fulfillmentStatus, totalCost } = req.body;
    try {
      const orderResult = await pool.query('SELECT * FROM orders WHERE id = $1', [req.params.id]);
      const order = orderResult.rows[0];
      if (!order) {
        return res.status(404).send({ error: 'Order not found' });
      }
  
      const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [order.user_id]);
      const user = userResult.rows[0];
      if (!user) {
        return res.status(404).send({ error: 'User not found' });
      }
  
      const updatedOrder = await pool.query(
        'UPDATE orders SET fulfillment_status = $1, payment_status = $2, total_cost = $3 WHERE id = $4 RETURNING *',
        [
          fulfillmentStatus || order.fulfillment_status,
          paymentStatus || order.payment_status,
          totalCost || order.total_cost,
          req.params.id
        ]
      );

      const emailMessage = `
        <p>Order Type: ${order.order_type}</p>
        <p>Size/Quantity: ${order.size_or_quantity}</p>
        ${totalCost ? `<p>Total Cost: $${totalCost}</p>` : ''}
        <p>Payment Status: ${paymentStatus}</p>
        <p>Fulfillment Status: ${fulfillmentStatus}</p>
      `;
  
      if (totalCost) {
        await transporter.sendMail({
          to: user.email,
          subject: 'Order Update',
          html: emailMessage,
        });
      }
  
      if (fulfillmentStatus === 'fulfilled') {
        await transporter.sendMail({
          to: user.email,
          subject: 'Order Fulfilled',
          html: `<p>Your order has been fulfilled. ${emailMessage}</p>`,
        });
      }
  
      if (fulfillmentStatus === 'Accepted') {
        await transporter.sendMail({
          to: user.email,
          subject: 'Order Accepted',
          html: `<p>Your order has been accepted. ${emailMessage}</p>`,
        });
      }
  
      res.send({ message: 'Order updated', order: updatedOrder.rows[0] });
    } catch (error) {
      console.error('Error updating order:', error); // Add this line for detailed logging
      res.status(500).send({ error: 'Internal server error' });
    }
  });
 
  app.put('/admin/orders/:id/update-cost', authenticateToken, authenticateAdmin, async (req, res) => {
    const { totalCost } = req.body;
    try {
      const orderResult = await pool.query('SELECT * FROM orders WHERE id = $1', [req.params.id]);
      const order = orderResult.rows[0];
      if (!order) {
        return res.status(404).send({ error: 'Order not found' });
      }
  
      const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [order.user_id]);
      const user = userResult.rows[0];
      if (!user) {
        return res.status(404).send({ error: 'User not found' });
      }
  
      const updatedOrder = await pool.query(
        'UPDATE orders SET total_cost = $1 WHERE id = $2 RETURNING *',
        [totalCost, req.params.id]
      );
  
      const emailMessage = `
        <p>Order Type: ${order.order_type}</p>
        <p>Size/Quantity: ${order.size_or_quantity}</p>
        <p>Total Cost: $${totalCost}</p>
      `;
  
      await transporter.sendMail({
        to: user.email,
        subject: 'Order Total Cost Update',
        html: emailMessage,
      });
  
      res.send({ message: 'Total cost updated and email sent', order: updatedOrder.rows[0] });
    } catch (error) {
      console.error('Error updating total cost:', error);
      res.status(500).send({ error: 'Internal server error' });
    }
  });
  

// Forgot password endpoint
app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  console.log('Received email:', email); // Debugging statement
  if (!email) {
    return res.status(400).send({ error: 'Email is required' });
  }
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user) {
      return res.status(400).send({ error: 'User not found' });
    }
    const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '1h' });
    const resetLink = `http://localhost:3000/reset-password?token=${token}`;
    await transporter.sendMail({
      to: email,
      subject: 'Password Reset',
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password</p>`,
    });
    res.send({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Error handling forgot password:', error); // Debugging statement
    res.status(500).send({ error: 'Internal server error' });
  }
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
