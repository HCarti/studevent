    // routes/trackerRoutes.js
const express = require('express');
const Tracker = require('../models/Tracker');
const router = express.Router();

// Get the current progress tracker for an event
router.get('/:eventId', async (req, res) => {
  try {
    const tracker = await Tracker.findOne({ eventId: req.params.eventId });
    if (!tracker) {
      return res.status(404).json({ message: 'Tracker not found' });
    }
    res.json(tracker);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update tracker step status
router.put('/:eventId/step/:stepIndex', async (req, res) => {
  const { status, remarks } = req.body; // Status could be 'approved' or 'declined'
  const { eventId, stepIndex } = req.params;

  try {
    const tracker = await Tracker.findOne({ eventId });
    if (!tracker) {
      return res.status(404).json({ message: 'Tracker not found' });
    }

    // Update step status and color
    tracker.steps[stepIndex].status = status;
    tracker.steps[stepIndex].color = status === 'approved' ? 'green' : 'red';
    tracker.steps[stepIndex].timestamp = Date.now(); // Update timestamp

    // Optionally add remarks if provided
    if (remarks) {
      tracker.remarks = remarks;
    }

    // Update the lastUpdated field
    tracker.lastUpdated = Date.now();

    await tracker.save();
    res.json(tracker);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
