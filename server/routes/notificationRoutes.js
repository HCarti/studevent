const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authenticateToken");
const Notification = require("../models/Notification"); // Create this model

// Get notifications by user email
router.get("/notifications", authenticateToken, async (req, res) => {
  try {
    const { userEmail } = req.query;
    if (!userEmail) return res.status(400).json({ message: "User email is required." });

    const notifications = await Notification.find({ userEmail }).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
