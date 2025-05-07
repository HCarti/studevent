// models/Liquidation.js
const mongoose = require('mongoose');

// models/Liquidation.js
const liquidationSchema = new mongoose.Schema({
  organization: { type: String, required: true },
  fileName: { type: String, required: true },
  fileUrl: { type: String, required: true },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Declined'], 
    default: 'Pending' 
  },
  remarks: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Liquidation', liquidationSchema);