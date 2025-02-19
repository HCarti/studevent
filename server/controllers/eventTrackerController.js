const EventTracker = require('../models/EventTracker');

// Get event tracker by form ID
const getEventTracker = async (req, res) => {
  try {
    const tracker = await EventTracker.findOne({ formId: req.params.formId }).populate('steps.reviewedBy');
    if (!tracker) {
      return res.status(404).json({ message: 'Event tracker not found' });
    }
    res.status(200).json(tracker);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update event tracker status
const updateEventTracker = async (req, res) => {
  try {
    const { formId } = req.params;
    const { status, reviewerId, remarks } = req.body;

    let tracker = await EventTracker.findOne({ formId });
    if (!tracker) {
      return res.status(404).json({ message: 'Event tracker not found' });
    }

    // Update current step
    const stepIndex = tracker.currentStep;
    tracker.steps[stepIndex].status = status;
    tracker.steps[stepIndex].reviewedBy = reviewerId;
    tracker.steps[stepIndex].timestamp = Date.now();
    tracker.steps[stepIndex].remarks = remarks;

    // Move to the next step if approved and there are more steps
    if (status === 'approved' && stepIndex < tracker.steps.length - 1) {
      tracker.currentStep += 1;
    }

    // If declined, reset tracker to organization for revision
    if (status === 'declined') {
      tracker.currentStep = 0; // Reset to the first step
      tracker.steps.forEach((step, index) => {
        if (index !== 0) {
          step.status = 'pending';
          step.reviewedBy = null;
          step.timestamp = null;
          step.remarks = '';
        }
      });
    }

    await tracker.save();
    res.status(200).json(tracker);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getEventTracker, updateEventTracker };
