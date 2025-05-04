// routes/activityLogRoutes.js
const express = require('express');
const router = express.Router();
const activityLogController = require('../controllers/activityLogController');
const { authenticateToken, restrictTo } = require('../middleware/authMiddleware');

router.get(
  '/',
  authenticateToken,
  restrictTo('SuperAdmin'),
  activityLogController.getActivityLogs
);

module.exports = router;