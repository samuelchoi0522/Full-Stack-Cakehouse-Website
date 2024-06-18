const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const orderRoute = require('./routes/order');
const userRoute = require('./routes/user');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect('mongodb+srv://cluster38109.a3afcan.mongodb.net', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Routes
app.use('/api/order', orderRoute);
app.use('/api/user', userRoute);

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static('uploads'));

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
