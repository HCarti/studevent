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
      const { trackerId, stepId } = req.params;
      const { status, remarks } = req.body;
      const userId = req.user._id; // Logged-in user ID
      const { role, faculty } = req.user; // Extract role and faculty from user

      console.log("🔍 Incoming PUT Request");
      console.log("User Data:", req.user);
      console.log("Request Body:", req.body);

      if (!req.user || !req.user.role) {
        return res.status(403).json({ message: "Unauthorized: Missing user role." });
    }

      const facultyRoles = ["Adviser", "Dean", "Academic Director", "Academic Services", "Executive Director"];

      if (role !== "Admin" && (!faculty || !facultyRoles.includes(faculty))) {
        return res.status(403).json({ message: "Unauthorized: Only Admins or Faculty reviewers can update the tracker." });
      }


      // Allowed faculty roles for reviewing
      const facultys = ["Adviser", "Dean", "Academic Services", "Academic Director", "Executive Director"];

      // Ensure user is an Admin or Faculty with a valid faculty role
      if (role !== "Admin" && (!faculty || !facultys.includes(faculty))) {
    return res.status(403).json({ message: "Unauthorized: Only Admins or Faculty reviewers can update the tracker." });
}

      // Fetch the event tracker
      const tracker = await EventTracker.findById(trackerId);
      if (!tracker) {
          return res.status(404).json({ message: "Tracker not found" });
      }

      // Find the step being updated
      const step = tracker.steps.find(step => step._id.toString() === stepId);
      if (!step) {
          return res.status(404).json({ message: "Step not found" });
      }

      // Find the first "pending" step (steps must be reviewed in order)
      const firstPendingStepIndex = tracker.steps.findIndex(step => step.status === "pending");
      const firstPendingStep = tracker.steps[firstPendingStepIndex];
     
      if (!firstPendingStep || firstPendingStep._id.toString() !== stepId) {
        return res.status(403).json({ message: "You cannot skip steps. Approve them in order." });
    }

      // Prevent modification of already reviewed steps
      if (firstPendingStep.status !== "pending") {
        return res.status(400).json({ message: "This step has already been reviewed." });
      }    

      // Ensure the correct faculty role is updating the right step
      const stepRoleMap = {
          "Adviser": "Adviser",
          "Dean": "Dean",
          "Admin":"Admin",
          "Academic Services": "Academic Services",
          "Academic Director": "Academic Director",
          "Executive Director": "Executive Director"
      };

          if (step.stepName !== faculty && role !== "Admin") {
      return res.status(403).json({ message: `Unauthorized: Only the ${step.stepName} can review this step.` });
    }
      

      // Assign the reviewer if not already assigned
      if (!firstPendingStep.reviewedBy) {
          firstPendingStep.reviewedBy = userId;
          firstPendingStep.reviewedByRole = faculty || role;
      }

      // Update the step status, remarks, and timestamp
      firstPendingStep.status = status;
      firstPendingStep.remarks = remarks || "";
      firstPendingStep.timestamp = new Date();

      // Move to the next step if approved
      if (status === "approved") {
        const nextStepIndex = tracker.steps.findIndex(s => s._id.toString() === stepId) + 1;
        if (nextStepIndex < tracker.steps.length) {
            tracker.currentStep = tracker.steps[nextStepIndex].stepName;
            tracker.currentAuthority = tracker.steps[nextStepIndex].reviewerRole;          
        } else {
            tracker.currentStep = "Completed";
            tracker.currentAuthority = "None";
        }
    }    

      // Save the updated tracker
      await tracker.save();

      return res.status(200).json({ message: "Tracker step updated successfully", tracker });
  } catch (error) {
      console.error(error);
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
