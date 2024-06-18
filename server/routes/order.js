const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const Order = require('../models/Order');

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

router.post('/', upload.single('file'), async (req, res) => {
  const { type, size, flavor, email } = req.body;
  const file = req.file;

  // Save order to database
  const newOrder = new Order({
    type,
    size,
    flavor,
    email,
    filePath: file.path,
    status: 'We’ve received your order'
  });

  try {
    await newOrder.save();

    // Send email to jaedolc@gmail.com
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'your-email@gmail.com',
        pass: 'your-email-password'
      }
    });

    const mailOptions = {
      from: 'your-email@gmail.com',
      to: 'jaedolc@gmail.com',
      subject: 'New Cake Order',
      text: `Type: ${type}\nSize: ${size}\nFlavor: ${flavor}\nEmail: ${email}`,
      attachments: [
        {
          path: file.path
        }
      ]
    };

    await transporter.sendMail(mailOptions);
    res.status(200).send('Order submitted successfully');
  } catch (error) {
    res.status(500).send('Error submitting order');
  }
});

module.exports = router;
