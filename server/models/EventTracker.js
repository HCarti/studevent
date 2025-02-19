const mongoose = require('mongoose');

const eventTrackerSchema = new mongoose.Schema({
  formId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Form',
    required: true
  },
  steps: [
    {
      label: String,
      status: {
        type: String,
        enum: ['pending', 'approved', 'declined'],
        default: 'pending'
      },
      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    }
  ],
  currentStep: {
    type: Number,
    default: 0
  }
});

const EventTracker = mongoose.model('EventTracker', eventTrackerSchema);
module.exports = EventTracker;
