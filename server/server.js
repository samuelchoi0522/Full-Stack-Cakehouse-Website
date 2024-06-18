const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const User = mongoose.model('User', new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
}));

mongoose.connect('mongodb://localhost:27017/auth-demo', { useNewUrlParser: true, useUnifiedTopology: true });

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-email-password',
  },
});

app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const user = await User.create({ email, password: hashedPassword });
    res.status(201).send({ message: 'User created', user });
  } catch (error) {
    res.status(400).send({ error: 'User already exists' });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).send({ error: 'Invalid email or password' });
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).send({ error: 'Invalid email or password' });
  }
  const token = jwt.sign({ userId: user._id }, 'SECRET_KEY');
  res.send({ token });
});

app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).send({ error: 'User not found' });
  }
  const token = jwt.sign({ userId: user._id }, 'SECRET_KEY', { expiresIn: '1h' });
  const resetLink = `http://localhost:3000/reset-password?token=${token}`;
  await transporter.sendMail({
    to: email,
    subject: 'Password Reset',
    html: `<p>Click <a href="${resetLink}">here</a> to reset your password</p>`,
  });
  res.send({ message: 'Password reset email sent' });
});

app.listen(3001, () => {
  console.log('Server is running on port 3001');
});
