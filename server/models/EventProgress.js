const mongoose = require('mongoose');

const eventProgressSchema = new mongoose.Schema({
    formId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Form',
      required: true,
    },
    currentReviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Reviewed', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    reviewHistory: [
      {
        reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        reviewedAt: { type: Date, default: Date.now },
        status: { type: String, enum: ['Approved', 'Rejected'] },
        comment: String, // Reviewer comments
      },
    ],
    createdAt: { type: Date, default: Date.now },
  });
  
  const EventProgress = mongoose.model('EventProgress', eventProgressSchema);
  module.exports = EventProgress;
  