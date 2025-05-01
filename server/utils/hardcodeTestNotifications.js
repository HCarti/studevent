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

const hardcodeTestNotifications = async () => {
  try {
    console.log('Starting test notification setup...');

    // Find 2 most recent notifications to update
    const notifications = await Notification.find({}).sort({ createdAt: -1 }).limit(2);

    if (notifications.length === 0) {
      console.log('No notifications found to update');
      process.exit(1);
    }

    console.log(`Found ${notifications.length} notifications to update for testing`);

    // 1. Fetch an actual tracker ID from your database
    const tracker = await EventTracker.findOne();

    // 2. Fetch an organization (user with organization role)
    const organization = await User.findOne({
      role: { $in: ['Organization', 'Authority', 'Admin'] }
    });

    if (!tracker && !organization) {
      console.log('No trackers or organizations found in the database to link');
      process.exit(1);
    }

    // Update the first notification to be a tracker notification
    if (notifications[0]) {
      const notification1 = notifications[0];
      notification1.type = 'tracker';
      notification1.message =
        'TESTING: This is a tracker notification that should navigate correctly';

      if (tracker) {
        notification1.trackerId = tracker._id;
        console.log(`Set notification 1 to tracker type with tracker ID: ${tracker._id}`);
      } else {
        console.log('No tracker found, only updating the type');
      }

      await notification1.save();
      console.log(`Updated notification 1 (ID: ${notification1._id}) to type tracker`);
    }

    // Update the second notification to be an organization notification
    if (notifications.length > 1 && notifications[1]) {
      const notification2 = notifications[1];
      notification2.type = 'organization';
      notification2.message =
        'TESTING: This is an organization notification that should navigate correctly';

      if (organization) {
        notification2.organizationId = organization._id;
        console.log(
          `Set notification 2 to organization type with organization ID: ${organization._id}`
        );
      } else {
        console.log('No organization found, only updating the type');
      }

      await notification2.save();
      console.log(`Updated notification 2 (ID: ${notification2._id}) to type organization`);
    }

    // Create an approval notification
    if (notifications.length < 2) {
      const approvalNotification = new Notification({
        userEmail: notifications[0].userEmail, // Use the same user email
        message: 'TESTING: This is an approval notification that should navigate to approvals page',
        type: 'approval',
        read: false,
        createdAt: new Date()
      });

      await approvalNotification.save();
      console.log(`Created new approval notification (ID: ${approvalNotification._id})`);
    }

    console.log('Test notifications setup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Test notification setup failed:', error);
    process.exit(1);
  }
};

// Run the script
hardcodeTestNotifications();
