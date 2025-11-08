const Team = require('../models/team');
const User = require('../models/user');
const AuditLog = require('../models/auditLog');

exports.listTeams = async (req, res) => {
  const teams = await Team.find().limit(100);
  // sanitize output: no user documents, only ids and safe derived fields
  const payload = teams.map(t => ({
    id: t._id,
    name: t.name,
    tag: t.tag,
    managerId: t.managerId,
    members: t.members, // array of ObjectIds
    games: t.games,
    social: t.social,
    balance: t.balance,
    createdAt: t.createdAt,
  }));
  res.json(payload);
};

exports.createTeam = async (req, res) => {
  try {
    const { name, tag, games, social } = req.body;
    const user = req.user;
    if (!name || !name.trim()) return res.status(400).json({ message: 'Name is required' });
    const team = new Team({
      name: name.trim(),
      tag: tag?.trim() || undefined,
      managerId: user._id,
      members: [user._id],
      games: Array.isArray(games) ? games.slice(0, 10) : [],
      social: social ? {
        discord: social.discord?.trim() || undefined,
        twitter: social.twitter?.trim() || undefined,
        twitch: social.twitch?.trim() || undefined,
      } : undefined
    });
    await team.save();
    await AuditLog.create({ user: req.user?.email || String(req.user?._id || ''), action: 'create_team', details: `Created team ${team.name}` });
    res.status(201).json({
      id: team._id,
      name: team.name,
      tag: team.tag,
      managerId: team.managerId,
      members: team.members,
      games: team.games,
      social: team.social,
      createdAt: team.createdAt,
    });
  } catch (err) {
    console.error('Create team error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Single team fetch with manager username (no sensitive fields)
exports.getTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const team = await Team.findById(id);
    if (!team) return res.status(404).json({ message: 'Team not found' });
    const manager = await User.findById(team.managerId).select('username email role');
    res.json({
      id: team._id,
      name: team.name,
      tag: team.tag,
      manager: manager ? { id: manager._id, username: manager.username, email: manager.email, role: manager.role } : { id: team.managerId },
      managerId: team.managerId,
      members: team.members,
      games: team.games,
      social: team.social,
      balance: team.balance,
      createdAt: team.createdAt,
    });
  } catch (err) {
    console.error('Get team error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.requestJoin = async (req, res) => {
  const { id } = req.params; // team id
  const user = req.user;
  const team = await Team.findById(id);
  if (!team) return res.status(404).json({ message: 'Team not found' });
  // check if already member
  if (team.members.some(m => m.toString() === user._id.toString())) return res.status(400).json({ message: 'Already a member' });
  team.pendingRequests.push({ userId: user._id, message: req.body.message });
  await team.save();
  res.json({ message: 'Request submitted' });
};

exports.approveRequest = async (req, res) => {
  const { id, reqId } = req.params; // team id, request id
  const user = req.user;
  const team = await Team.findById(id);
  if (!team) return res.status(404).json({ message: 'Team not found' });
  if (team.managerId.toString() !== user._id.toString()) return res.status(403).json({ message: 'Forbidden' });
  const request = team.pendingRequests.id(reqId);
  if (!request) return res.status(404).json({ message: 'Request not found' });
  team.members.push(request.userId);
  request.remove();
  await team.save();
  await AuditLog.create({ user: req.user?.email || String(req.user?._id || ''), action: 'approve_join', details: `Approved request ${reqId} for team ${team.name}` });
  res.json({ message: 'Request approved' });
};

// List pending join requests for a team (manager only)
exports.listRequests = async (req, res) => {
  const { id } = req.params; // team id
  const user = req.user;
  const team = await Team.findById(id).populate('pendingRequests.userId', 'username email');
  if (!team) return res.status(404).json({ message: 'Team not found' });
  if (team.managerId.toString() !== user._id.toString()) return res.status(403).json({ message: 'Forbidden' });
  res.json({ requests: team.pendingRequests });
};

// Decline a pending join request (manager only)
exports.declineRequest = async (req, res) => {
  const { id, reqId } = req.params;
  const user = req.user;
  const team = await Team.findById(id);
  if (!team) return res.status(404).json({ message: 'Team not found' });
  if (team.managerId.toString() !== user._id.toString()) return res.status(403).json({ message: 'Forbidden' });
  const request = team.pendingRequests.id(reqId);
  if (!request) return res.status(404).json({ message: 'Request not found' });
  request.remove();
  await team.save();
  await AuditLog.create({ user: req.user?.email || String(req.user?._id || ''), action: 'decline_join', details: `Declined request ${reqId} for team ${team.name}` });
  res.json({ message: 'Request declined' });
};

exports.deleteTeam = async (req, res) => {
  const { id } = req.params;
  const team = await Team.findByIdAndDelete(id);
  if (!team) return res.status(404).json({ message: 'Team not found' });
  await AuditLog.create({ user: req.user?.email || String(req.user?._id || ''), action: 'delete_team', details: `Deleted team ${team.name}` });
  res.json({ message: 'Team deleted' });
};
