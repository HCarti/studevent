const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
    try {
      const notifications = await Notification.find({ userEmail: req.user.email })
        .sort({ createdAt: -1 })
        .populate('formId', 'name'); // Include form name
      res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching notifications' });
    }
};

exports.createNotification = async (userEmail, message, type, formId = null) => {
    try {
      console.log(`🔹 Creating ${type} notification for:`, userEmail);

      const notification = new Notification({
        userEmail,
        message,
        type,
        formId,
        createdAt: new Date(),
      });

      await notification.save();
      console.log("✅ Notification saved successfully:", notification);
      return notification;
    } catch (error) {
      console.error("❌ Error saving notification:", error);
      throw error; // Re-throw to handle in calling function
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

exports.notifyOrganizationAdmins = async (organizationId, message, options = {}) => {
  try {
    const admins = await User.find({
      organizationId,
      role: { $in: ['Admin', 'Organization Admin'] } // Adjust roles as needed
    }).select('email name');
    
    const notifications = [];
    for (const admin of admins) {
      const notification = await this.createNotification(
        admin.email,
        message,
        'organization_notice',
        options.formId,
        options.trackerId
      );
      notifications.push(notification);
    }
    return notifications;
  } catch (error) {
    console.error('Error notifying organization admins:', error);
    throw error;
  }
};