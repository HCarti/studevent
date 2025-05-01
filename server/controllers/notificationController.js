const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userEmail: req.user.email }).sort({
      createdAt: -1
    });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching notifications' });
  }
};

exports.createTrackerNotification = async (req, res) => {
  try {
    const { userEmail, message, trackerId } = req.body;

    if (!userEmail || !message) {
      return res.status(400).json({ error: 'User email and message are required' });
    }

    await exports.createNotification(userEmail, message, 'tracker', { trackerId });
    res.status(201).json({ message: 'Notification created successfully' });
  } catch (error) {
    console.error('Error creating tracker notification:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.createEventNotification = async (req, res) => {
  try {
    const { userEmail, message, eventId } = req.body;

    if (!userEmail || !message) {
      return res.status(400).json({ error: 'User email and message are required' });
    }

    await exports.createNotification(userEmail, message, 'event', { eventId });
    res.status(201).json({ message: 'Event notification created successfully' });
  } catch (error) {
    console.error('Error creating event notification:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.createOrganizationNotification = async (req, res) => {
  try {
    const { userEmail, message, organizationId } = req.body;

    if (!userEmail || !message) {
      return res.status(400).json({ error: 'User email and message are required' });
    }

    await exports.createNotification(userEmail, message, 'organization', { organizationId });
    res.status(201).json({ message: 'Organization notification created successfully' });
  } catch (error) {
    console.error('Error creating organization notification:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.createApprovalNotification = async (req, res) => {
  try {
    const { userEmail, message } = req.body;

    if (!userEmail || !message) {
      return res.status(400).json({ error: 'User email and message are required' });
    }

    await exports.createNotification(userEmail, message, 'approval');
    res.status(201).json({ message: 'Approval notification created successfully' });
  } catch (error) {
    console.error('Error creating approval notification:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.createLiquidationNotification = async (req, res) => {
  try {
    const { userEmail, message } = req.body;

    if (!userEmail || !message) {
      return res.status(400).json({ error: 'User email and message are required' });
    }

    await exports.createNotification(userEmail, message, 'liquidation');
    res.status(201).json({ message: 'Liquidation notification created successfully' });
  } catch (error) {
    console.error('Error creating liquidation notification:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.createNotification = async (userEmail, message, type, data = {}) => {
  try {
    console.log('🔹 Attempting to create notification for:', userEmail); // Debug log

    const notification = new Notification({
      userEmail,
      message,
      createdAt: new Date(), // Ensure createdAt is always set
      type,
      ...(type === 'tracker' && data.trackerId && { trackerId: data.trackerId }),
      ...(type === 'event' && data.eventId && { eventId: data.eventId }),
      ...(type === 'organization' && data.organizationId && { organizationId: data.organizationId })
    });
    await notification.save();
    console.log('Notification saved successfully:', notification);
  } catch (error) {
    console.error('Error saving notification:', error);
  }
};

exports.markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.body;
    if (!notificationId) {
      return res.status(400).json({ error: 'Notification ID is required' });
    }

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    notification.read = true;
    await notification.save();

    res.json({ message: 'Notification marked as read', notification });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.markNotificationAsUnread = async (req, res) => {
  try {
    const { notificationId } = req.body;
    if (!notificationId) {
      return res.status(400).json({ error: 'Notification ID is required' });
    }

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    notification.read = false;
    await notification.save();

    res.json({ message: 'Notification marked as unread', notification });
  } catch (error) {
    console.error('Error marking notification as unread:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
