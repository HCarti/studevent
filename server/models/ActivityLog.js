// models/ActivityLog.js
const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  userEmail: {
    type: String,
    required: true
  },
  userRole: {
    type: String,
    required: true
  },
  action: { 
    type: String, 
    required: true,
    enum: ['USER_CREATED', 'USER_UPDATED', 'USER_DELETED', 'USER_STATUS_CHANGED'] 
  },
  targetUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  targetUserEmail: {
    type: String
  },
  targetUserRole: {
    type: String
  },
  description: { 
    type: String, 
    required: true 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);