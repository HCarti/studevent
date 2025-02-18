const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Notification', NotificationSchema);
