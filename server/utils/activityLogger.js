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
    case 'USER_SOFT_DELETED':
      description = `Moved ${additionalInfo.role} user to trash: ${additionalInfo.email}`;
      break;
    case 'USER_RESTORED':
      description = `Restored ${targetUser.role} user from trash: ${targetUser.email}`;
      if (additionalInfo.restoredAt) {
        description += ` (Deleted at: ${new Date(additionalInfo.restoredAt).toLocaleString()})`;
      }
      break;
    case 'USER_STATUS_CHANGED':
      description = `Changed status of ${targetUser.role} user ${targetUser.email} to ${additionalInfo.newStatus}`;
      break;
    case 'ORGANIZATION_UPDATED':
      description = `Updated organization: ${targetUser.organizationName || targetUser.email}`;
      if (additionalInfo.changedFields) {
        description += ` (Changed: ${Object.keys(additionalInfo.changedFields).join(', ')})`;
      }
      break;
    default:
      description = `Performed action: ${action} on ${targetUser?.role || 'user'} ${targetUser?.email || ''}`;
  }

  try {
    await ActivityLog.create({
      userId: adminUser._id,
      userEmail: adminUser.email,
      userRole: adminUser.role,
      action,
      targetUserId: targetUser?._id,
      targetUserEmail: targetUser?.email,
      targetUserRole: targetUser?.role,
      description,
      timestamp,
      additionalInfo: JSON.stringify(additionalInfo)
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
    // Don't throw error as we don't want to block the main operation
  }
};

module.exports = logSuperAdminAction;