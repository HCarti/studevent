// backend/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  role: { type: String, required: true, enum: ['Authority', 'Organization', 'SuperAdmin' , 'Admin']},
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  faculty: { type: String, required: function() { return this.role === 'Authority'; }},
  organizationType: { type: String, required: function() { return this.role === 'Organization'; }},
  logo: { type: String }, // Optional, no unique constraint
  status: { type: String, default: 'Active' }, // Default but not unique
}); 



module.exports = mongoose.model('User', userSchema);
