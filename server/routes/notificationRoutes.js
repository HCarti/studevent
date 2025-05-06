const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const Notification = require('../models/Notification'); // Create this model
const {
  markNotificationAsRead,
  markNotificationAsUnread,
  createTrackerNotification,
  createEventNotification,
  createOrganizationNotification,
  createApprovalNotification,
  createLiquidationNotification
} = require('../controllers/notificationController');

// Get notifications by user email
router.get('/notifications', authenticateToken, async (req, res) => {
  console.log('🟢 Authenticated user:', req.user);

  if (!req.user || !req.user.email) {
    return res.status(400).json({ message: 'User email is missing' });
  }

  console.log('🔹 Fetching notifications for:', req.user.email);

  try {
    const notifications = await Notification.find({ userEmail: req.user.email }).sort({
      createdAt: -1
    });

    console.log('✅ Notifications found:', notifications.length);

    res.json(notifications);
  } catch (error) {
    console.error('❌ Error fetching notifications:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Routes for different notification types
router.post('/tracker-notification', authenticateToken, createTrackerNotification);
router.post('/event-notification', authenticateToken, createEventNotification);
router.post('/organization-notification', authenticateToken, createOrganizationNotification);
router.post('/approval-notification', authenticateToken, createApprovalNotification);
router.post('/liquidation-notification', authenticateToken, createLiquidationNotification);
router.delete('/notifications/:notificationId', authenticateToken, deleteNotification);

router.post('/mark-read', authenticateToken, markNotificationAsRead); // Protect route

router.post('/mark-unread', authenticateToken, markNotificationAsUnread); // New route for marking as unread

// In your server code
router.post('/mark-read-batch', authenticateToken, async (req, res) => {
  try {
    const { notificationIds } = req.body;
    await Notification.updateMany(
      { _id: { $in: notificationIds }, user: req.user._id },
      { $set: { read: true } }
    );
    res.status(200).send({ message: 'Notifications marked as read' });
  } catch (error) {
    res.status(500).send({ message: 'Error marking notifications as read' });
  }
});

module.exports = router;
