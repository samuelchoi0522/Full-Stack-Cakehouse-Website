const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  type: { type: String, required: true },
  size: { type: String, required: true },
  flavor: { type: String, required: true },
  email: { type: String, required: true },
  filePath: { type: String, required: true },
  status: { type: String, required: true, default: 'We’ve received your order' },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
