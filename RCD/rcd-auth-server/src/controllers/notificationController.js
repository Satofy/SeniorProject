const Notification = require('../models/notification');
const {
  registerStream,
  markAllRead,
  createNotification,
  clearAll,
  deleteOne,
  markOneRead,
  serializeNotification,
} = require('../services/notificationService');

exports.listNotifications = async (req, res) => {
  const items = await Notification.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(100);
  res.json(items.map(serializeNotification));
};

exports.clearNotifications = async (req, res) => {
  await clearAll(req.user._id);
  res.json({ ok: true });
};

exports.deleteNotification = async (req, res) => {
  await deleteOne(req.user._id, req.params.id);
  res.json({ ok: true });
};

exports.markAllRead = async (req, res) => {
  await markAllRead(req.user._id);
  res.json({ ok: true });
};

exports.markNotificationRead = async (req, res) => {
  const item = await markOneRead(req.user._id, req.params.id);
  if (!item) return res.status(404).json({ message: 'Notification not found' });
  res.json(serializeNotification(item));
};

exports.streamNotifications = async (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();
  res.write(`event: connected\ndata: ${JSON.stringify({ ok: true })}\n\n`);
  registerStream(req.user._id, res);
};

// Convenience endpoint to allow system/admin-triggered notifications (optional)
exports.sendNotification = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  const { userId, type, message, metadata } = req.body;
  if (!userId || !message) {
    return res.status(400).json({ message: 'userId and message are required' });
  }
  const notification = await createNotification({ userId, type, message, metadata });
  res.status(201).json(serializeNotification(notification));
};
