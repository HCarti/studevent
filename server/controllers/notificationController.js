const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching notifications' });
    }
};

exports.createNotification = async (userEmail, message) => {
    try {
      console.log("🔹 Attempting to create notification for:", userEmail); // Debug log

      const notification = new Notification({
        userEmail,
        message,
        timestamp: new Date(),
      });
      await notification.save();
      console.log("Notification saved successfully:", notification);
    } catch (error) {
      console.error("Error saving notification:", error);
    }
  };

  