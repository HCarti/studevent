// models/Liquidation.js
const mongoose = require('mongoose');

const liquidationSchema = new mongoose.Schema({
  organization: { type: String, required: true },
  fileName: { type: String, required: true },
  fileUrl: { type: String, required: true }, // Changed from filePath to fileUrl
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Liquidation', liquidationSchema);