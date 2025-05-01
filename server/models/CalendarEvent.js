const mongoose = require('mongoose');
const moment = require('moment');

const CalendarEventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true,
    get: date => moment.utc(date).format('YYYY-MM-DD') // Always output in UTC
  },
  endDate: {
    type: Date,
    required: true,
    get: date => moment.utc(date).format('YYYY-MM-DD') // Always output in UTC
  },
  location: {
    type: String,
    required: true
  },
  formId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Form',
    required: true
  },
  formType: {
    type: String,
    enum: ['Activity', 'Project'],
    required: true
  },
  createdBy: {
    type: String,
    required: true
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
CalendarEventSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('CalendarEvent', CalendarEventSchema);
