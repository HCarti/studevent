const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['Admin', 'Authority', 'Organization'],
    required: true,
  },
  firstName: {
    type: String,
    required: function() {
      return this.role === 'Admin' || this.role === 'Authority'; // Required for Admin and Authority
    }
  },
  lastName: {
    type: String,
    required: function() {
      return this.role === 'Admin' || this.role === 'Authority'; // Required for Admin and Authority
    }
  },
  organizationType: {
    type: String,
    required: function() {
      return this.role === 'Organization'; // Required for Organization
    }
  },
  organizationName: {
    type: String,
    required: function() {
      return this.role === 'Organization'; // Required for Organization
    }
  },
  faculty: {
    type: String,
    required: function() {
      return this.role === 'Authority'; // Required for Authority
    }
  },
  logo: String, // Optional for all roles
  status: {
    type: String,
    default: 'Active'
  },
  // New fields for login attempt and OTP functionality
  // loginAttempts: {
  //   type: Number,
  //   default: 0, // Track failed login attempts
  // },
  // otp: {
  //   type: String, // Store OTP for email verification
  //   default: null,
  // },
  // otpExpiry: {
  //   type: Date, // Store OTP expiration time (e.g., valid for 10 minutes)
  //   default: null,
  // }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
