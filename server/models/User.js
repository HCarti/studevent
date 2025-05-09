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
    minlength: [5, 'Password must be at least 5 characters long'],
  },
  role: {
    type: String,
    enum: ['SuperAdmin', 'Admin', 'Authority', 'Organization'], // Added SuperAdmin
    required: true,
  },
  firstName: {
    type: String,
    required: function() {
      return this.role === 'SuperAdmin' || this.role === 'Admin' || this.role === 'Authority';
    }
  },
  lastName: {
    type: String,
    required: function() {
      return this.role === 'SuperAdmin' || this.role === 'Admin' || this.role === 'Authority';
    }
  },
  organizationType: {
    type: String,
    required: function() {
      return this.role === 'Organization';
    }
  },
  organizationName: {
    type: String,
    required: function() {
      return this.role === 'Organization';
    }
  },
  presidentSignature: {
    type: String,
    required: function() {
      return this.role === 'Organization';
    }
  },
  presidentName: {
    type: String,
    required: function() {
      return this.role === 'Organization';
    }
  },
  faculty: {
    type: String,
    required: function() {
      return this.role === 'Authority';
    }
  },
  organization: {
    type: String,
    required: function() {
      return this.role === 'Authority' && this.faculty === 'Adviser';
    }
  },

  deanForOrganization: {
    type: String,
    required: function() {
      return this.role === 'Authority' && this.faculty === 'Dean';
    }
  },
  logo: String,
  signature: {
    type: String,
    required: function() {
      return this.role === 'Admin' || this.role === 'Authority'; // Not required for SuperAdmin
    }
  },
  status: {
    type: String,
    default: 'Active'
  },
  // In your User model schema, add:
  deletedAt: {
    type: Date,
    default: null
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
