// models/eventModel.js

const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
