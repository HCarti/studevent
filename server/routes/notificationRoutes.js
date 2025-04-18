const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authenticateToken");
const {
  getNotifications,
  markNotificationAsRead,
  createTrackerNotification,
  createNotification
} = require("../controllers/notificationController");

// Get notifications with pagination
router.get("/", authenticateToken, getNotifications);

// Mark notification as read
router.post("/mark-read", authenticateToken, markNotificationAsRead);

// Create tracker-related notification
router.post("/tracker", authenticateToken, createTrackerNotification);

// General notification creation (for other services)
router.post("/", authenticateToken, createNotification);

module.exports = router;