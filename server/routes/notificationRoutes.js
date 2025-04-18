const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authenticateToken");
const Notification = require("../models/Notification"); // Create this model
const { markNotificationAsRead, createTrackerNotification } = require("../controllers/notificationController");

// Get notifications by user email
router.get("/notifications", authenticateToken, async (req, res) => {
  console.log("🟢 Authenticated user:", req.user);

  if (!req.user || !req.user.email) {
      return res.status(400).json({ message: "User email is missing" });
  }

  console.log("🔹 Fetching notifications for:", req.user.email);

  try {
    const notifications = await Notification.find({ userEmail: req.user.email }).sort({ createdAt: -1 });

      console.log("✅ Notifications found:", notifications.length);

      res.json(notifications);
  } catch (error) {
      console.error("❌ Error fetching notifications:", error);
      res.status(500).json({ message: "Server error" });
  }
});

router.post("/tracker-notification", authenticateToken, createTrackerNotification);

router.post("/mark-read", authenticateToken, markNotificationAsRead); // Protect route


module.exports = router;
