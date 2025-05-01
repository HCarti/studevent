const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const EventTracker = require('../models/EventTracker');
const User = require('../models/User');
require('dotenv').config();

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/studevent';

// Connect to MongoDB
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const analyzeNotificationContent = async notification => {
  const message = notification.message.toLowerCase();

  // Default type is event if we can't determine
  let type = 'event';
  let data = {};

  // Analyze message content to guess the notification type
  if (message.includes('tracker') || message.includes('track')) {
    type = 'tracker';
    // Try to find a tracker that might be related
    const trackers = await EventTracker.find({}).limit(5);
    if (trackers.length > 0) {
      // Just assign the first one as a placeholder
      data.trackerId = trackers[0]._id;
    }
  } else if (message.includes('organization') || message.includes('org')) {
    type = 'organization';
    // Find organizations (which are users with org roles)
    const orgs = await User.find({ role: { $in: ['Organization', 'Authority', 'Admin'] } }).limit(
      5
    );
    if (orgs.length > 0) {
      data.organizationId = orgs[0]._id;
    }
  } else if (message.includes('approval') || message.includes('approve')) {
    type = 'approval';
  } else if (message.includes('liquidation') || message.includes('budget')) {
    type = 'liquidation';
  }

  return { type, data };
};

const migrateNotifications = async () => {
  try {
    console.log('Starting notification migration...');

    // Get all notifications
    const notifications = await Notification.find({});
    console.log(`Found ${notifications.length} notifications to update`);

    // Update each notification
    for (const notification of notifications) {
      // Skip if notification already has a type
      if (notification.type) {
        console.log(
          `Notification ${notification._id} already has type ${notification.type}, skipping`
        );
        continue;
      }

      // Analyze notification content to determine type and data
      const { type, data } = await analyzeNotificationContent(notification);

      // Update the notification
      notification.type = type;

      // Add IDs based on type
      if (type === 'tracker' && data.trackerId) {
        notification.trackerId = data.trackerId;
      } else if (type === 'organization' && data.organizationId) {
        notification.organizationId = data.organizationId;
      }

      // Save updated notification
      await notification.save();
      console.log(`Updated notification ${notification._id} to type ${type}`);
    }

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

// Run the migration
migrateNotifications();
