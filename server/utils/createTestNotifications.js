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

const createTestNotifications = async () => {
  try {
    console.log('Starting test notification creation...');

    // Get the user's email to assign notifications to
    const user = await User.findOne({});

    if (!user || !user.email) {
      console.log('No users found in the database to assign notifications to');
      process.exit(1);
    }

    const userEmail = user.email;
    console.log(`Creating test notifications for user: ${userEmail}`);

    // 1. Fetch an actual tracker ID from your database
    const tracker = await EventTracker.findOne();

    // 2. Fetch an organization (user with organization role)
    const organization = await User.findOne({
      role: { $in: ['Organization', 'Authority', 'Admin'] }
    });

    // Create tracker notification
    const trackerNotification = new Notification({
      userEmail,
      message: 'TEST: Your tracker has been updated - click to view details',
      type: 'tracker',
      read: false,
      createdAt: new Date(),
      ...(tracker && { trackerId: tracker._id })
    });

    await trackerNotification.save();
    console.log(`Created tracker notification (ID: ${trackerNotification._id})`);

    // Create organization notification
    const orgNotification = new Notification({
      userEmail,
      message: 'TEST: An organization you follow has posted a new event',
      type: 'organization',
      read: false,
      createdAt: new Date(),
      ...(organization && { organizationId: organization._id })
    });

    await orgNotification.save();
    console.log(`Created organization notification (ID: ${orgNotification._id})`);

    // Create approval notification
    const approvalNotification = new Notification({
      userEmail,
      message: 'TEST: Your event requires approval - click to check status',
      type: 'approval',
      read: false,
      createdAt: new Date()
    });

    await approvalNotification.save();
    console.log(`Created approval notification (ID: ${approvalNotification._id})`);

    // Create liquidation notification
    const liquidationNotification = new Notification({
      userEmail,
      message: 'TEST: Your liquidation report is ready for review',
      type: 'liquidation',
      read: false,
      createdAt: new Date()
    });

    await liquidationNotification.save();
    console.log(`Created liquidation notification (ID: ${liquidationNotification._id})`);

    console.log('Test notifications created successfully!');
    console.log('Created notifications:');
    console.log(`1. Tracker notification: ${trackerNotification._id}`);
    console.log(`2. Organization notification: ${orgNotification._id}`);
    console.log(`3. Approval notification: ${approvalNotification._id}`);
    console.log(`4. Liquidation notification: ${liquidationNotification._id}`);

    process.exit(0);
  } catch (error) {
    console.error('Test notification creation failed:', error);
    process.exit(1);
  }
};

// Run the script
createTestNotifications();
