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
        const users = await User.find({ role, organizationId }); // Fetch all users with this role
        return users.map(user => user._id); // Store multiple IDs if needed
      })
    );

    // Filter out null values (in case some roles are unassigned)
    
      const steps = reviewers
      .flat() // Flatten array in case of multiple users per role
      .map((id, index) => ({
        stepName: roles[index],  // Make sure your `stepName` field exists
        reviewerRole: roles[index],  // Store role explicitly
        status: 'pending',
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
    const { reviewerId, status, remarks } = req.body; // Extract values from request body

    const tracker = await EventTracker.findOne({ formId }).populate({
      path: "steps.reviewedBy",
      select: "name role",
    });

    if (!tracker) {
      return res.status(404).json({ error: "Event tracker not found." });
    }

    // Validate currentStep exists
    if (!tracker.steps || tracker.steps.length === 0) {
      return res.status(400).json({ error: "Invalid steps data." });
    }

    const stepIndex = tracker.currentStep;
    if (typeof stepIndex !== "number" || stepIndex < 0 || !tracker.steps || !tracker.steps[stepIndex]) {
      return res.status(400).json({ error: "Invalid current step." });
  }
  
  console.log("Tracker Data:", tracker);
  console.log("Current Step:", tracker.currentStep);
  console.log("Steps Array:", tracker.steps);
  console.log("Step Index:", stepIndex);


    const currentStep = tracker.steps[stepIndex];

    // Retrieve reviewer's details
    const reviewer = await User.findById(reviewerId);
    if (!reviewer) {
      return res.status(404).json({ error: "Reviewer not found." });
    }

    // Validate if reviewer is authorized for this step
    const isAuthorizedReviewer =
      reviewer.role === currentStep.reviewerRole ||
      reviewer.facultyRole === currentStep.reviewerRole;

    if (!isAuthorizedReviewer) {
      return res.status(403).json({ error: "You are not authorized to review this step." });
    }

    // Update the current step
    currentStep.status = status;
    currentStep.reviewedBy = reviewer._id;
    currentStep.reviewedByRole = reviewer.role || reviewer.facultyRole || "Unknown Role";
    currentStep.remarks = remarks;
    currentStep.timestamp = new Date();

    // Logic for moving to the next step
    if (status === "approved") {
      if (stepIndex < tracker.steps.length - 1) {
        tracker.currentStep = stepIndex + 1;
        tracker.currentAuthority = tracker.steps[tracker.currentStep].reviewerRole;
      } else {
        await Form.findByIdAndUpdate(formId, { status: "approved" });
      }
    } else if (status === "declined") {
      if (stepIndex > 0) {
        tracker.currentStep = stepIndex - 1;
        tracker.currentAuthority = tracker.steps[tracker.currentStep].reviewerRole;
      } else {
        await Form.findByIdAndUpdate(formId, { status: "rejected", message: "Please revise and resubmit." });
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
  getEventTrackerByFormId
};
