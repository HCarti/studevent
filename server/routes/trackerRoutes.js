    // routes/trackerRoutes.js
const express = require('express');
const Tracker = require('../models/EventProgress');
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
  const { status, remarks } = req.body;
  const { eventId, stepIndex } = req.params;

  try {
    const tracker = await Tracker.findOne({ eventId });

    if (!tracker) {
      return res.status(404).json({ message: 'Tracker not found' });
    }

    const step = tracker.steps[stepIndex];
    if (!step) {
      return res.status(404).json({ message: 'Step not found' });
    }

    step.status = status;
    step.color = status === 'approved' ? 'green' : 'red';
    step.timestamp = Date.now();

    if (remarks) {
      step.remarks = remarks;
    }

    await tracker.save();
    res.json(tracker);
  } catch (error) {
    console.error('Error updating tracker:', error);  // Log error
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
