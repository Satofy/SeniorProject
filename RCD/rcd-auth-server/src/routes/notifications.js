const express = require('express');
const auth = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const {
  listNotifications,
  clearNotifications,
  deleteNotification,
  markAllRead,
  markNotificationRead,
  streamNotifications,
  sendNotification,
} = require('../controllers/notificationController');

const router = express.Router();

router.get('/', auth, listNotifications);
router.delete('/', auth, clearNotifications);
router.delete('/:id', auth, deleteNotification);
router.post('/read', auth, markAllRead);
router.post('/:id/read', auth, markNotificationRead);
router.get('/stream', auth, streamNotifications);
router.post('/', auth, requireRole('admin'), sendNotification);

module.exports = router;
