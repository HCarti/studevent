const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
    try {
      const notifications = await Notification.find({ userEmail: req.user.email }).sort({ createdAt: -1 });
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
        createdAt: new Date(),  // Ensure createdAt is always set
      });
      await notification.save();
      console.log("Notification saved successfully:", notification);
    } catch (error) {
      console.error("Error saving notification:", error);
    }
  };

  exports.markNotificationAsRead = async (req, res) => {
    try {
        const { notificationId } = req.body;
        if (!notificationId) {
            return res.status(400).json({ error: "Notification ID is required" });
        }

        const notification = await Notification.findById(notificationId);
        if (!notification) {
            return res.status(404).json({ error: "Notification not found" });
        }

        notification.read = true;
        await notification.save();

        res.json({ message: "Notification marked as read", notification });
    } catch (error) {
        console.error("Error marking notification as read:", error);
        res.status(500).json({ error: "Server error" });
    }
};


  