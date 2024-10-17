// backend/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  role: { 
    type: String, 
    required: true, 
    enum: ['Authority', 'Organization', 'SuperAdmin', 'Admin']
  },
  firstName: { 
    type: String, 
    required: function() { 
      return this.role !== 'Organization';  // Only required if role is not 'Organization'
    }
  },
  lastName: { 
    type: String, 
    required: function() { 
      return this.role !== 'Organization';  // Only required if role is not 'Organization'
    }
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  faculty: { 
    type: String, 
    required: function() { 
      return this.role === 'Authority';  // Only required for 'Authority' role
    }
  },
  organizationType: { 
    type: String, 
    required: function() { 
      return this.role === 'Organization';  // Only required for 'Organization' role
    }
  },
  logo: { 
    type: String  // Optional, no unique constraint
  },
  status: { 
    type: String, 
    default: 'Active'  // Default status
  }
});

module.exports = mongoose.model('User', userSchema);
