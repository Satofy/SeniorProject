const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' }
}, { _id: false });

const tournamentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  type: { type: String, enum: ["solo", "team"], default: "team" },
  participants: [participantSchema],
  maxParticipants: { type: Number, default: 16 },
  registrationOpen: { type: Boolean, default: true },
  // Optional fields to align with frontend UI
  status: {
    type: String,
    enum: ["upcoming", "ongoing", "completed"],
    required: false,
  },
  prizePool: { type: String, required: false },
  game: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Tournament', tournamentSchema);
