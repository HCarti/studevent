// routes/activityLogRoutes.js
const express = require('express');
const router = express.Router();
const activityLogController = require('../controllers/activityLogController');
const authenticateToken = require('../middleware/authenticateToken');

router.get(
  '/',
  authenticateToken,
  authenticateToken.restrictTo('SuperAdmin'), // Fixed reference
  activityLogController.getActivityLogs
);

module.exports = router;