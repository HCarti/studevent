const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  type: { 
    type: String, 
    enum: [
      'submission_confirmation',
      'organization_notice', 
      'review_request',
      'approval_confirmation',
      'decline_notice',
      'final_approval'
    ],
    required: true
  },
  formId: { type: mongoose.Schema.Types.ObjectId, ref: 'Form' },
  trackerId: { type: mongoose.Schema.Types.ObjectId, ref: 'EventTracker' },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Index for faster queries
NotificationSchema.index({ userEmail: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", NotificationSchema);