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
      get: function(date) {
        return moment.utc(date).format('YYYY-MM-DD');
      },
      set: function(date) {
        return moment.utc(date).startOf('day').toDate();
      }
    },
    endDate: {
      type: Date,
      get: function(date) {
        return date ? moment.utc(date).format('YYYY-MM-DD') : null;
      },
      set: function(date) {
        return date ? moment.utc(date).startOf('day').toDate() : undefined;
      },
      validate: {
        validator: function(endDate) {
          if (!endDate) return true;
          // Access raw Date object before getter transforms it
          return endDate >= this.get('startDate', null, { getters: false });
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
  
  // Add pre-save hook to ensure date consistency
  BlockedDateSchema.pre('save', function(next) {
    // Ensure dates are properly normalized
    if (this.isModified('startDate')) {
      this.startDate = moment.utc(this.startDate).startOf('day').toDate();
    }
    if (this.isModified('endDate') && this.endDate) {
      this.endDate = moment.utc(this.endDate).startOf('day').toDate();
    }
    this.updatedAt = new Date();
    next();
  });
  
module.exports = mongoose.model('BlockedDate', BlockedDateSchema);