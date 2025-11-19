const Notification = require('../models/notification');

const subscribers = new Map(); // userId(string) -> Set<res>

function serializeNotification(doc) {
  return {
    id: doc._id.toString(),
    type: doc.type,
    message: doc.message,
    metadata: doc.metadata || {},
    read: doc.read,
    createdAt: doc.createdAt,
  };
}

function emitToUser(userId, payload) {
  const key = userId.toString();
  const subs = subscribers.get(key);
  if (!subs || subs.size === 0) return;
  const data = `event: notification\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const res of subs) {
    try {
      res.write(data);
    } catch (err) {
      // Drop dead connections silently
      subs.delete(res);
    }
  }
  if (subs.size === 0) subscribers.delete(key);
}

function registerStream(userId, res) {
  const key = userId.toString();
  if (!subscribers.has(key)) subscribers.set(key, new Set());
  const bucket = subscribers.get(key);
  bucket.add(res);

  const heartbeat = setInterval(() => {
    try {
      res.write(': ping\n\n');
    } catch {
      clearInterval(heartbeat);
    }
  }, 25000);

  res.on('close', () => {
    clearInterval(heartbeat);
    bucket.delete(res);
    if (bucket.size === 0) subscribers.delete(key);
  });
}

async function createNotification({ userId, type = 'info', message, metadata }) {
  if (!userId || !message) throw new Error('userId and message are required');
  const notification = await Notification.create({ userId, type, message, metadata });
  emitToUser(userId, serializeNotification(notification));
  return notification;
}

async function markAllRead(userId) {
  await Notification.updateMany({ userId }, { $set: { read: true } });
}

async function markOneRead(userId, id) {
  return Notification.findOneAndUpdate({ _id: id, userId }, { $set: { read: true } }, { new: true });
}

async function clearAll(userId) {
  await Notification.deleteMany({ userId });
}

async function deleteOne(userId, id) {
  await Notification.findOneAndDelete({ _id: id, userId });
}

module.exports = {
  createNotification,
  registerStream,
  emitToUser,
  markAllRead,
  markOneRead,
  clearAll,
  deleteOne,
  serializeNotification,
};
