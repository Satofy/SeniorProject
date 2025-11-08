const Tournament = require('../models/tournament');
const AuditLog = require('../models/auditLog');

exports.listTournaments = async (req, res) => {
  const tournaments = await Tournament.find().sort({ date: 1 }).limit(100);
  res.json(tournaments);
};

exports.createTournament = async (req, res) => {
  const { title, date, type, maxParticipants } = req.body;
  const t = new Tournament({ title, date, type, maxParticipants });
  await t.save();
  await AuditLog.create({ user: req.user?.email || String(req.user?._id || ''), action: 'create_tournament', details: `Created ${title}` });
  res.status(201).json(t);
};

exports.register = async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  const tournament = await Tournament.findById(id);
  if (!tournament) return res.status(404).json({ message: 'Tournament not found' });
  if (!tournament.registrationOpen) return res.status(400).json({ message: 'Registration closed' });
  // prevent duplicate
  const exists = tournament.participants.some(p => p.userId && p.userId.toString() === user._id.toString());
  if (exists) return res.status(400).json({ message: 'Already registered' });
  tournament.participants.push({ userId: user._id });
  await tournament.save();
  res.json({ message: 'Registered' });
};

exports.updateTournament = async (req, res) => {
  const { id } = req.params;
  const { title, date, type, maxParticipants, status, prizePool, game } = req.body;
  const update = {};
  if (title !== undefined) update.title = title;
  if (date !== undefined) update.date = date;
  if (type !== undefined) update.type = type;
  if (maxParticipants !== undefined) update.maxParticipants = maxParticipants;
  if (status !== undefined) update.status = status;
  if (prizePool !== undefined) update.prizePool = prizePool;
  if (game !== undefined) update.game = game;
  const t = await Tournament.findByIdAndUpdate(id, update, { new: true });
  if (!t) return res.status(404).json({ message: 'Tournament not found' });
  await AuditLog.create({ user: req.user?.email || String(req.user?._id || ''), action: 'update_tournament', details: `Updated ${t.title}` });
  res.json(t);
};

exports.deleteTournament = async (req, res) => {
  const { id } = req.params;
  const t = await Tournament.findByIdAndDelete(id);
  if (!t) return res.status(404).json({ message: 'Tournament not found' });
  await AuditLog.create({ user: req.user?.email || String(req.user?._id || ''), action: 'delete_tournament', details: `Deleted ${t.title}` });
  res.json({ message: 'Tournament deleted' });
};
