const EventTracker = require("../models/EventTracker");
const User = require("../models/User"); // Import User model
const Form = require("../models/Form");

// Get event tracker by form ID
const getEventTracker = async (req, res) => {
  console.log("🔍 Fetching tracker for formId:", req.params.formId);

  try {
    const tracker = await EventTracker.findOne({ formId: req.params.formId });

    if (!tracker) {
      console.log("❌ Tracker Not Found for formId:", req.params.formId);
      return res.status(404).json({ message: "Tracker not found" });
    }

    console.log("✅ Tracker Found:", tracker);
    res.status(200).json(tracker);
  } catch (error) {
    console.error("❌ Error fetching tracker data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Create a new event tracker
const createEventTracker = async (req, res) => {
  try {
    const { formId, organizationId } = req.body;

    // Fetch distinct roles dynamically
    let roles = await User.distinct("role", { organizationId });

    // Fetch the corresponding reviewer IDs based on roles
    const reviewers = await Promise.all(
      roles.map(async (role) => {
        const users = await User.find({ role, organizationId });
        return users.map((user) => ({ userId: user._id, role }));
      })
    );

    // Flatten and filter out empty reviewer arrays
    const validReviewers = reviewers.flat().filter(({ userId }) => userId);

    if (validReviewers.length === 0) {
      return res.status(400).json({ error: "No reviewers found for this organization." });
    }

    // Construct steps, ensuring unique roles are assigned properly
    const steps = validReviewers.map(({ userId, role }) => ({
      stepName: role,
      reviewerRole: role,
      status: "pending",
      reviewedBy: null,
      timestamp: null,
      remarks: "",
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
    console.error("❌ Error creating event tracker:", error);
    res.status(500).json({ message: error.message });
  }
};

// Update event tracker progress
const updateTrackerStep = async (req, res) => {
  try {
      console.log("🔍 Incoming PUT Request");
      console.log("User Data:", req.user);
      console.log("Request Body:", req.body);

      const { trackerId, stepId } = req.params;
      const { status, remarks } = req.body;
      const userId = req.user._id;
      const { role, faculty } = req.user;

      // Validate user and request
      if (!req.user) {
          return res.status(403).json({ message: "Unauthorized: Missing user credentials." });
      }

      const facultyRoles = ["Adviser", "Dean", "Academic Services", "Academic Director", "Executive Director"];
      if (role !== "Admin" && (!faculty || !facultyRoles.includes(faculty))) {
          return res.status(403).json({ message: "Unauthorized: Only Admins or Faculty reviewers can update the tracker." });
      }

      // Fetch the tracker
      const tracker = await EventTracker.findById(trackerId);
      if (!tracker) {
          return res.status(404).json({ message: "Tracker not found" });
      }

      // Log the steps for debugging
      console.log("Steps in Tracker:", tracker.steps);

      // Find the step
      const step = tracker.steps.find(step => step._id.toString() === stepId);
      if (!step) {
          return res.status(404).json({ message: "Step not found" });
      }

      // Find the first pending step
      const firstPendingStepIndex = tracker.steps.findIndex(step => step.status === "pending");
      console.log("First Pending Step Index:", firstPendingStepIndex);

      const firstPendingStep = tracker.steps[firstPendingStepIndex];
      console.log("First Pending Step:", firstPendingStep);

      // Ensure the step being updated is the first pending step
      if (!firstPendingStep || firstPendingStep._id.toString() !== stepId) {
          return res.status(403).json({ message: "You cannot skip steps. Approve them in order." });
      }

      // Check if the step is already reviewed
      if (firstPendingStep.status !== "pending") {
          return res.status(400).json({ message: "This step has already been reviewed." });
      }

      // Ensure the user has the correct role to review this step
      if (step.stepName !== faculty && role !== "Admin") {
          return res.status(403).json({ message: `Unauthorized: Only the ${step.stepName} can review this step.` });
      }

      // Update the step
      firstPendingStep.status = status;
      firstPendingStep.remarks = remarks || "";
      firstPendingStep.timestamp = new Date();
      firstPendingStep.reviewedBy = userId;
      firstPendingStep.reviewedByRole = faculty || role;

      // Update currentStep and currentAuthority
      if (status === "approved") {
          const nextStepIndex = firstPendingStepIndex + 1;
          if (nextStepIndex < tracker.steps.length) {
              tracker.currentStep = tracker.steps[nextStepIndex].stepName;
              tracker.currentAuthority = tracker.steps[nextStepIndex].reviewerRole;
          } else {
              tracker.currentStep = "Completed";
              tracker.currentAuthority = "None";
          }
      } else if (status === "rejected") {
          // If the step is rejected, stay on the current step
          tracker.currentStep = firstPendingStep.stepName;
          tracker.currentAuthority = firstPendingStep.reviewerRole;
      }

      // Save the updated tracker
      console.log("Tracker before saving:", tracker);
      await tracker.save();
      console.log("Tracker after saving:", tracker);

      // Update the Form's finalStatus based on the tracker's steps
      const Form = mongoose.model('Form');
      const form = await Form.findById(tracker.formId);

      if (!form) {
          return res.status(404).json({ message: "Form not found" });
      }

      // Check if any step is declined
      const isDeclined = tracker.steps.some(step => step.status === 'declined');

      // Check if all steps are approved
      const isApproved = tracker.steps.every(step => step.status === 'approved');

      // Determine the finalStatus
      let finalStatus = 'pending';
      if (isDeclined) {
          finalStatus = 'declined';
      } else if (isApproved) {
          finalStatus = 'approved';
      }

      // Update the Form's finalStatus
      form.finalStatus = finalStatus;
      await form.save();

      // Return the updated tracker and form
      return res.status(200).json({ message: "Tracker step updated successfully", tracker, form });

  } catch (error) {
      console.error("❌ Error updating progress tracker:", error);
      return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get event tracker by form ID
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
  updateTrackerStep,
  getEventTrackerByFormId,
};
