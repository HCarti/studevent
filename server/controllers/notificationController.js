const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching notifications' });
    }
};

exports.createNotification = async (userId, message) => {
    try {
        const notification = new Notification({ userId, message });
        await notification.save();
    } catch (error) {
        console.error('Error creating notification:', error);
    }
};