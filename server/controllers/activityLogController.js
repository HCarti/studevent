// controllers/activityLogController.js
const ActivityLog = require('../models/ActivityLog');

const getActivityLogs = async (req, res) => {
  try {
    const { action, role, days } = req.query;
    const filter = {};

    if (action) filter.action = action;
    if (role) filter.targetUserRole = role;
    
    if (days) {
      const date = new Date();
      date.setDate(date.getDate() - parseInt(days));
      filter.timestamp = { $gte: date };
    }

    const logs = await ActivityLog.find(filter)
      .sort({ timestamp: -1 })
      .populate('userId', 'email firstName lastName role')
      .populate('targetUserId', 'email role');

    res.status(200).json({
      success: true,
      data: logs
    });
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching activity logs'
    });
  }
};

module.exports = {
  getActivityLogs
};