const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  user: { type: String }, // email or id string
  action: { type: String, required: true },
  details: { type: String },
}, { timestamps: false });

module.exports = mongoose.model('AuditLog', auditLogSchema);
