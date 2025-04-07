// models/Feedback.js
const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  formId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'formType'
  },
  formType: {
    type: String,
    required: true,
    enum: ['LocalOffCampus', 'Activity', 'Budget', 'Project']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'userType'
  },
  userType: {
    type: String,
    required: true,
    enum: ['Organization', 'Authority', 'Admin']
  },
  // Common fields
  email: {
    type: String,
    required: true
  },
  // Organization-specific fields
  organizationName: {
    type: String,
    required: function() { return this.userType === 'Organization'; }
  },
  // Faculty/Admin-specific fields
  firstName: {
    type: String,
    required: function() { return this.userType !== 'Organization'; }
  },
  lastName: {
    type: String,
    required: function() { return this.userType !== 'Organization'; }
  },
  faculty: {
    type: String,
    required: function() { return this.userType === 'Authority'; }
  },
  feedback: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Feedback', feedbackSchema);