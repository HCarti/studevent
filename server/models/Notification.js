const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  type: { type: String, enum: ['tracker', 'event', 'organization', 'approval', 'liquidation'] },
  trackerId: { type: mongoose.Schema.Types.ObjectId, ref: 'EventTracker' },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Notification', NotificationSchema);
