const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  tournamentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament', required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId }],
  startAt: { type: Date },
  endAt: { type: Date },
  result: { type: Object },
  replayUrl: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Match', matchSchema);
