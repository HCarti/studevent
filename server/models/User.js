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
  studentOrganization: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Organization' // Reference to the Organization model
  },
  logo: String, // Optional for all roles
  status: {
    type: String,
    default: 'Active'
  },
});

const User = mongoose.model('User', userSchema);
module.exports = User;
