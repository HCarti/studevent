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
  endDate: {
    type: Date,
    set: function(endDate) {
      // Convert to start of day in UTC before saving
      return endDate ? moment.utc(endDate).startOf('day').toDate() : undefined;
    },
    validate: {
      validator: function(endDate) {
        if (!endDate) return true;
        // Compare dates as timestamps to avoid timezone issues
        return endDate.getTime() >= this.startDate.getTime();
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

// Add pre-save hook to normalize dates
BlockedDateSchema.pre('save', function(next) {
  // Normalize startDate to start of day in UTC
  if (this.startDate) {
    this.startDate = moment.utc(this.startDate).startOf('day').toDate();
  }
  
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('BlockedDate', BlockedDateSchema);