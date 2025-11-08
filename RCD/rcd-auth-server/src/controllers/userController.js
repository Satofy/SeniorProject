const User = require('../models/user');
const AuditLog = require('../models/auditLog');

exports.listUsers = async (req, res) => {
  const users = await User.find().select('email username role teamId createdAt');
  res.json(users.map(u => ({ id: u._id, email: u.email, username: u.username, role: u.role, teamId: u.teamId || null })));
};

exports.changeRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  if (!['player', 'team_manager', 'admin'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }
  const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select('email username role teamId');
  if (!user) return res.status(404).json({ message: 'User not found' });
  await AuditLog.create({ user: req.user?.email || String(req.user?._id || ''), action: 'change_role', details: `Changed role of ${user.email} to ${role}`});
  res.json({ id: user._id, email: user.email, username: user.username, role: user.role, teamId: user.teamId || null });
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  const user = await User.findByIdAndDelete(id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  await AuditLog.create({ user: req.user?.email || String(req.user?._id || ''), action: 'delete_user', details: `Deleted user ${user.email}`});
  res.json({ message: 'User deleted' });
};
