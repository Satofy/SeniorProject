const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['info', 'warning', 'success', 'action'],
      default: 'info'
    },
    message: { type: String, required: true },
    metadata: { type: mongoose.Schema.Types.Mixed },
    read: { type: Boolean, default: false },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
  }
);

module.exports = mongoose.model('Notification', notificationSchema);
