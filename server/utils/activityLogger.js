// utils/activityLogger.js
const ActivityLog = require('../models/ActivityLog');

const logSuperAdminAction = async (adminUser, action, targetUser, additionalInfo = {}) => {
  let description = '';
  const timestamp = new Date();
  
  switch (action) {
    case 'USER_CREATED':
      description = `Created ${targetUser.role} user: ${targetUser.email}`;
      break;
    case 'USER_UPDATED':
      description = `Updated ${targetUser.role} user: ${targetUser.email}`;
      if (additionalInfo.changedFields) {
        description += ` (Changed: ${Object.keys(additionalInfo.changedFields).join(', ')})`;
      }
      break;
    case 'USER_DELETED':
      description = `Deleted ${additionalInfo.role} user: ${additionalInfo.email}`;
      break;
    case 'USER_STATUS_CHANGED':
      description = `Changed status of ${targetUser.role} user ${targetUser.email} to ${additionalInfo.newStatus}`;
      break;
    default:
      description = 'Performed user management action';
  }

  await ActivityLog.create({
    userId: adminUser._id,
    userEmail: adminUser.email,
    userRole: adminUser.role,
    action,
    targetUserId: targetUser?._id,
    targetUserEmail: targetUser?.email,
    targetUserRole: targetUser?.role,
    description,
    timestamp
  });
};

module.exports = logSuperAdminAction;