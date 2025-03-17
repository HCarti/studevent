const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({ // Fix here: Use mongoose.Schema directly
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: [5, 'Password must be at least 5 characters long'],
  },
  role: {
    type: String,
    enum: ['Admin', 'Authority', 'Organization'],
    required: true,
  },
  firstName: {
    type: String,
    required: function () {
      return this.role === 'Admin' || this.role === 'Authority';
    },
  },
  lastName: {
    type: String,
    required: function () {
      return this.role === 'Admin' || this.role === 'Authority';
    },
  },
  organizationType: {
    type: String,
    required: function () {
      return this.role === 'Organization';
    },
  },
  organizationName: {
    type: String,
    required: function () {
      return this.role === 'Organization';
    },
  },
  faculty: {
    type: String,
    required: function () {
      return this.role === 'Authority';
    },
  },
  studentOrganization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization', // Reference to the Organization model
  },
  logo: String, 
  status: {
    type: String,
    default: 'Active',
  },
});

const User = mongoose.model('User', userSchema);
module.exports = User;
