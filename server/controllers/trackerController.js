// controllers/trackerController.js
const Tracker = require('../models/Tracker');

// Get the progress tracker for a specific event
exports.getTracker = async (req, res) => {
  try {
    const { eventId } = req.params;
    const tracker = await Tracker.findOne({ eventId });

    if (!tracker) {
      return res.status(404).json({ message: 'Tracker not found' });
    }

    res.json(tracker);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Update a specific step in the progress tracker
exports.updateStep = async (req, res) => {
  try {
    const { eventId, stepIndex } = req.params;
    const { status, remarks } = req.body;

    // Find the tracker for the event
    const tracker = await Tracker.findOne({ eventId });

    if (!tracker) {
      return res.status(404).json({ message: 'Tracker not found' });
    }

    // Update the specific step
    const step = tracker.steps[stepIndex];
    if (!step) {
      return res.status(404).json({ message: 'Step not found' });
    }

    // Update step status, color, remarks, and timestamp
    step.status = status;
    step.color = status === 'approved' ? 'green' : 'red';
    step.remarks = remarks;
    step.timestamp = Date.now();

    // Save the updated tracker
    tracker.updatedAt = Date.now();
    await tracker.save();

    // Emit an event to notify clients (real-time update using Socket.io)
    const io = req.app.get('socketio');
    io.emit('trackerUpdated', tracker);

    res.json(tracker);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
