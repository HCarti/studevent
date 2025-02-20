const EventTracker = require('../models/EventTracker');
const User = require('../models/User'); // Import User model to fetch reviewer IDs

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

// Function to create a new event tracker
const createEventTracker = async (req, res) => {
  try {
    const { formId, organizationId } = req.body; // Form and organization ID

    // Define the sequence of reviewers (Role-based assignment)
    const roles = [
      'Adviser',
      'College Dean',
      'SDAO',
      'Academic Services',
      'Academic Director',
      'Executive Director'
    ];

    // Fetch the corresponding reviewer IDs based on roles
    const reviewers = await Promise.all(
      roles.map(async (role) => {
        const user = await User.findOne({ role, organizationId }); // Ensure same organization
        return user ? user._id : null;
      })
    );

    // Filter out null values (in case some roles are unassigned)
    const steps = reviewers
      .filter((id) => id !== null)
      .map((id, index) => ({
        step: roles[index],
        status: index === 0 ? 'pending' : 'pending',
        reviewedBy: null,
        timestamp: null,
        remarks: '',
      }));

    // Create the new event tracker
    const tracker = new EventTracker({
      formId,
      steps,
      currentStep: 0,
      isCompleted: false,
    });

    await tracker.save();
    res.status(201).json(tracker);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateEventTracker = async (req, res) => {
  try {
    const { formId } = req.params;
    const { status, reviewerId, remarks } = req.body;

    let tracker = await EventTracker.findOne({ formId });
    if (!tracker) {
      return res.status(404).json({ message: 'Event tracker not found' });
    }

    // Validate reviewerId
    if (!reviewerId) {
      return res.status(400).json({ message: 'Reviewer ID is required' });
    }

    // Get the reviewer's role
    const reviewer = await User.findById(reviewerId);
    if (!reviewer) {
      return res.status(404).json({ message: 'Reviewer not found' });
    }

    const roleSequence = [
      'Adviser',
      'College Dean',
      'SDAO',
      'Academic Services',
      'Academic Director',
      'Executive Director'
    ];

    const stepIndex = tracker.currentStep;
    const currentStepRole = roleSequence[stepIndex];

    if (reviewer.role !== currentStepRole) {
      return res.status(403).json({ message: 'You are not authorized to review this form at this step.' });
    }

    tracker.steps[stepIndex].status = status;
    tracker.steps[stepIndex].reviewedBy = reviewerId;
    tracker.steps[stepIndex].timestamp = Date.now();
    tracker.steps[stepIndex].remarks = remarks;

    if (status === 'approved') {
      if (stepIndex < tracker.steps.length - 1) {
        tracker.currentStep += 1; // Move to the next step
      } else {
        tracker.isCompleted = true; // Mark tracker as completed
      }
    } else if (status === 'declined') {
      tracker.steps[stepIndex].status = 'declined';
      tracker.steps[stepIndex].reviewedBy = null;
      tracker.steps[stepIndex].timestamp = null;
      tracker.steps[stepIndex].remarks = remarks || 'Requires Revision';
      tracker.currentStep = stepIndex; // Stay on the same step
    }

    await tracker.save();
    res.status(200).json({ message: 'Tracker updated successfully', tracker });
  } catch (error) {
    console.error('Error updating tracker:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Function to fetch event trackers for the logged-in reviewer
const getTrackersForReviewer = async (req, res) => {
  try {
    const { reviewerId } = req.params;

    // Find the reviewer's role
    const reviewer = await User.findById(reviewerId);
    if (!reviewer) {
      return res.status(404).json({ message: "Reviewer not found" });
    }

    const trackers = await EventTracker.find({
      'steps.step': reviewer.role, // Check if the role matches
      currentStep: { $gte: 0 },
    });

    res.status(200).json(trackers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const getEventTrackerByFormId = async (req, res) => {
  try {
    const { formId } = req.params;
    const tracker = await EventTracker.findOne({ formId });

    if (!tracker) {
      return res.status(404).json({ message: "Event tracker not found" });
    }

    res.status(200).json(tracker);
  } catch (error) {
    console.error("Error fetching event tracker:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


module.exports = {
  getEventTracker,
  createEventTracker,
  updateEventTracker,
  getTrackersForReviewer,
  getEventTrackerByFormId
};
