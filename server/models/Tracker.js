// models/Tracker.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const stepSchema = new Schema({
  label: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'declined'], default: 'pending' },
  timestamp: { type: Date, default: Date.now },  // Timestamp when the step is updated
  remarks: { type: String, default: '' },        // Remarks by the authority
  color: { type: String, default: 'yellow' },    // yellow = in review, green = approved, red = declined
});

const trackerSchema = new Schema({
  eventId: { type: String, required: true },  // Event that this tracker belongs to
  steps: [stepSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Tracker = mongoose.model('Tracker', trackerSchema);

module.exports = Tracker;
