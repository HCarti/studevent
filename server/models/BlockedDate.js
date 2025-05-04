const mongoose = require('mongoose');
const moment = require('moment');

const BlockedDateSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  startDate: {
    type: Date,
    required: true,
    get: date => moment.utc(date).format('YYYY-MM-DD')
  },
// In models/BlockedDate.js
endDate: {
    type: Date,
    validate: {
      validator: function(endDate) {
        // Allow undefined/null (single day)
        if (!endDate) return true;
        return endDate >= this.startDate;
      },
      message: 'End date must be after or equal to start date'
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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

// Update timestamp before saving
BlockedDateSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('BlockedDate', BlockedDateSchema);