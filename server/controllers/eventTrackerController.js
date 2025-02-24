const EventTracker = require('../models/EventTracker');
const User = require('../models/User'); // Import User model to fetch reviewer IDs
const Form = require("../models/Form");

// Get event tracker by form ID
const getEventTracker = async (req, res) => {
  console.log("🔍 Fetching tracker for formId:", req.params.formId); // ✅ Debug log

  try {
    const tracker = await EventTracker.findOne({ formId: req.params.formId });

    if (!tracker) {
      console.log("❌ Tracker Not Found for formId:", req.params.formId); // ✅ Debug log
      return res.status(404).json({ message: "Tracker not found" });
    }

    console.log("✅ Tracker Found:", tracker); // ✅ Debug log
    res.status(200).json(tracker);
  } catch (error) {
    console.error("❌ Error fetching tracker data:", error);
    res.status(500).json({ error: "Internal server error" });
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
    const { reviewerId, status, remarks } = req.body; // Reviewer ID, status, and remarks from frontend

    const tracker = await EventTracker.findOne({ formId }).populate("steps.reviewedBy");

    if (!tracker) {
      return res.status(404).json({ error: "Event tracker not found." });
    }

    const reviewer = await User.findById(reviewerId);
    if (!reviewer) {
      return res.status(400).json({ error: "Reviewer not found." });
    }

    // Find the current step
    const stepIndex = tracker.steps.findIndex(step => step.stepName === tracker.currentStep);
    if (stepIndex === -1) {
      return res.status(400).json({ error: "Current step not found in tracker." });
    }

    const currentStep = tracker.steps[stepIndex];

    // Ensure the reviewer matches the expected role
    if (reviewer.role !== currentStep.reviewerRole) {
      return res.status(403).json({ error: `You are not authorized to review this step.` });
    }

    // Update current step
    currentStep.status = status;
    currentStep.reviewedBy = reviewer._id;
    currentStep.reviewedByRole = reviewer.role;
    currentStep.remarks = remarks;
    currentStep.timestamp = new Date();

    // If approved, move to the next step
    if (status === "approved") {
      if (stepIndex < tracker.steps.length - 1) {
        tracker.currentStep = tracker.steps[stepIndex + 1].stepName;
        tracker.currentAuthority = tracker.steps[stepIndex + 1].reviewerRole;
      } else {
        // If last step is approved, mark the form as fully approved
        await Form.findByIdAndUpdate(formId, { status: "approved" });
      }
    } else if (status === "declined") {
      // If declined, return to the previous step
      if (stepIndex > 0) {
        tracker.currentStep = tracker.steps[stepIndex - 1].stepName;
        tracker.currentAuthority = tracker.steps[stepIndex - 1].reviewerRole;
      } else {
        // If the first step is declined, form is fully rejected
        await Form.findByIdAndUpdate(formId, { status: "declined" });
      }
    }

    await tracker.save();

    res.status(200).json({ message: "Tracker updated successfully", tracker });

  } catch (error) {
    console.error("Error updating event tracker:", error);
    res.status(500).json({ error: "Server error", details: error.message });
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
