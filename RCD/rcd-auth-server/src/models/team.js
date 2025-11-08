const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  message: { type: String },
  createdAt: { type: Date, default: Date.now }
}, { _id: true });

const socialSchema = new mongoose.Schema({
  discord: { type: String },
  twitter: { type: String },
  twitch: { type: String }
}, { _id: false });

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  tag: { type: String, maxlength: 6 },
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  games: [{ type: String }], // simple list of game identifiers / names
  social: socialSchema,
  pendingRequests: [requestSchema],
  balance: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Team', teamSchema);
