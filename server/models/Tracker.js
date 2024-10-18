// models/Tracker.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const stepSchema = new Schema({
  label: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'declined'], default: 'pending' },
  timestamp: { type: Date, default: Date.now },
  remarks: { type: String, default: '' },
  color: { type: String, default: 'yellow' },
  faculty: { type: String, enum: ['Adviser', 'Dean', 'Academic Services', 'Executive Director'], required: true } // Authority step responsibility
});

const trackerSchema = new Schema({
  eventId: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Link to the user
  steps: [stepSchema],
}, { timestamps: true });

const Tracker = mongoose.model('Tracker', trackerSchema);

module.exports = Tracker;
