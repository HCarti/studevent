const mongoose = require('mongoose');

const calendarEventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: 'No additional details available'
  },
  location: {
    type: String,
    default: 'TBA'
  },
  eventStartDate: {
    type: Date,
    required: true
  },
  eventEndDate: {
    type: Date,
    required: true
  },
  formId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Form'
  },
  formType: {
    type: String,
    enum: ['Activity', 'Project'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'declined'],
    default: 'pending'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
calendarEventSchema.index({ eventStartDate: 1, eventEndDate: 1 });
calendarEventSchema.index({ formId: 1 });

module.exports = mongoose.model('CalendarEvent', calendarEventSchema);