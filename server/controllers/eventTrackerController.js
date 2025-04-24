const EventTracker = require("../models/EventTracker");
const User = require("../models/User"); // Import User model
const Form = require("../models/Form"); // Import User model
const mongoose = require('mongoose');
const notificationController = require('./notificationController');


// HELPER

const getNextReviewers = async (tracker, currentStepIndex) => {
  try {
    console.log('🔍 Getting next reviewers for step:', currentStepIndex + 1);
    
    if (currentStepIndex + 1 >= tracker.steps.length) {
      console.log('🏁 No next step - process complete');
      return [];
    }

    const nextStep = tracker.steps[currentStepIndex + 1];
    console.log('🔍 Next Step Details:', {
      stepName: nextStep.stepName,
      reviewerRole: nextStep.reviewerRole,
      _id: nextStep._id
    });

    const Form = mongoose.model('Form');
    const form = await Form.findById(tracker.formId);
    
    if (!form) {
      console.log('❌ Form not found for tracker:', tracker.formId);
      return [];
    }

    console.log('🔍 Organization ID from form:', form.organizationId);
    
    // Debug: Check all users in the organization first
    const allOrgUsers = await User.find({
      organizationId: form.organizationId
    }).select('email role organizationId').lean();

    console.log('👥 All users in organization:', 
      allOrgUsers.map(u => ({
        email: u.email,
        role: u.role,
        orgId: u.organizationId
      }))
    );

    // Get reviewers with the exact required role (case-sensitive)
    const reviewers = await User.find({
      role: nextStep.reviewerRole,
      organizationId: form.organizationId
    }).select('email role name').lean();

    console.log('✅ Matching reviewers:', reviewers.map(r => ({
      email: r.email,
      role: r.role,
      name: r.name
    })));

    if (reviewers.length === 0) {
      console.warn('⚠️ No reviewers found for role:', nextStep.reviewerRole);
      console.warn('Available roles in organization:', 
        [...new Set(allOrgUsers.map(u => u.role))]
      );
    }
    
    return reviewers;
    
  } catch (error) {
    console.error("❌ Error getting next reviewers:", error);
    return [];
  }
};

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

// Add this to your eventTrackerController.js
const getReviewSignatures = async (req, res) => {
  try {
      const { formId } = req.params;
      const tracker = await EventTracker.findOne({ formId })
          .populate({
              path: 'steps.reviewedBy',
              select: 'name role signature'
          });

      if (!tracker) {
          return res.status(200).json({});
      }

      const signatures = {};
      
      tracker.steps.forEach(step => {
          if (step.status && step.reviewedBy) {
              // Use stepName or reviewedByRole as the key
              const roleKey = step.stepName.toLowerCase().replace(/\s+/g, '');
              
              signatures[roleKey] = {
                  name: step.reviewedBy.name,
                  signature: step.reviewedBy.signature,
                  date: step.timestamp,
                  status: step.status,
                  remarks: step.remarks
              };
          }
      });

      res.status(200).json(signatures);
  } catch (error) {
      console.error('Error:', error);
      res.status(200).json({});
  }
};

// Update event tracker progress
const updateTrackerStep = async (req, res) => {
  try {
    console.log("🔍 Incoming PUT Request");
    console.log("User Data:", req.user);
    console.log("Request Body:", req.body);

    const { trackerId, stepId } = req.params;
    const { status, remarks, signature } = req.body;
    const userId = req.user._id;
    const { role, faculty, email: currentUserEmail, name: currentUserName } = req.user;

    // Validate user and request
    if (!req.user) {
      return res.status(403).json({ message: "Unauthorized: Missing user credentials." });
    }

    const facultyRoles = ["Adviser", "Dean", "Academic Services", "Academic Director", "Executive Director"];
    if (role !== "Admin" && (!faculty || !facultyRoles.includes(faculty))) {
      return res.status(403).json({ message: "Unauthorized: Only Admins or Faculty reviewers can update the tracker." });
    }

    // Fetch the tracker and form
    const tracker = await EventTracker.findById(trackerId).populate({
      path: 'steps.reviewedBy',
      select: 'email role name'
    });
    if (!tracker) {
      return res.status(404).json({ message: "Tracker not found" });
    }

    const Form = mongoose.model('Form');
    const form = await Form.findById(tracker.formId);
    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    // Find the step
    const step = tracker.steps.find(step => step._id.toString() === stepId);
    if (!step) {
      return res.status(404).json({ message: "Step not found" });
    }

    // Find the first pending or declined step
    const firstPendingOrDeclinedStepIndex = tracker.steps.findIndex(step => 
      step.status === "pending" || step.status === "declined"
    );

    // Ensure the step being updated is the first pending or declined step
    if (!tracker.steps[firstPendingOrDeclinedStepIndex] || 
        tracker.steps[firstPendingOrDeclinedStepIndex]._id.toString() !== stepId) {
      return res.status(403).json({ message: "You cannot skip steps. Approve them in order." });
    }

    // Check if the step is already reviewed (only for pending steps)
    if (tracker.steps[firstPendingOrDeclinedStepIndex].status !== "pending" && 
        tracker.steps[firstPendingOrDeclinedStepIndex].status !== "declined") {
      return res.status(400).json({ message: "This step has already been reviewed." });
    }

    // Ensure the user has the correct role to review this step
    if (step.stepName !== faculty && role !== "Admin") {
      return res.status(403).json({ message: `Unauthorized: Only the ${step.stepName} can review this step.` });
    }

    // Update the step
    step.status = status;
    step.remarks = remarks || "";
    step.timestamp = new Date();
    step.reviewedBy = userId;
    step.reviewedByRole = faculty || role;
    step.signature = signature;

    // Update tracker progress
    if (status === "approved") {
      const nextStepIndex = firstPendingOrDeclinedStepIndex + 1;
      if (nextStepIndex < tracker.steps.length) {
        tracker.currentStep = tracker.steps[nextStepIndex].stepName;
        tracker.currentAuthority = tracker.steps[nextStepIndex].reviewerRole;
      } else {
        tracker.currentStep = "Completed";
        tracker.currentAuthority = "None";
        tracker.isCompleted = true;
      }
    } else if (status === "declined") {
      tracker.currentStep = step.stepName;
      tracker.currentAuthority = step.reviewerRole;
      
      // Reset subsequent steps
      for (let i = firstPendingOrDeclinedStepIndex + 1; i < tracker.steps.length; i++) {
        tracker.steps[i].status = "pending";
        tracker.steps[i].reviewedBy = null;
        tracker.steps[i].reviewedByRole = null;
        tracker.steps[i].remarks = "";
        tracker.steps[i].timestamp = null;
        tracker.steps[i].signature = null;
      }
    }

    // Save the updated tracker
    await tracker.save();

    // Update form status
    const isDeclined = tracker.steps.some(step => step.status === 'declined');
    const isApproved = tracker.steps.every(step => step.status === 'approved');
    form.finalStatus = isDeclined ? 'declined' : isApproved ? 'approved' : 'pending';
    await form.save();

    // Enhanced notification handling
    const formName = form.name || `Form ${form._id}`;
    const currentStepName = step.stepName;

    // In the notification section of updateTrackerStep (around line 200-250):

    
if (status === "approved") {
  const nextStepIndex = firstPendingOrDeclinedStepIndex + 1;
  
  if (nextStepIndex < tracker.steps.length) {
    const nextStep = tracker.steps[nextStepIndex];
    const nextReviewers = await getNextReviewers(tracker, firstPendingOrDeclinedStepIndex);

    // FIX 1: Ensure we always have a reviewer name
    const reviewerName = req.user.name || 
                       (step.reviewedBy?.name || 
                       req.user.email.split('@')[0] || 
                       'a reviewer');

    // Only proceed if we actually found next reviewers
    if (nextReviewers && nextReviewers.length > 0) {
      // Send notifications to next reviewers
      for (const reviewer of nextReviewers) {
        try {
          await notificationController.createNotification(
            reviewer.email,
            `Action Required: ${formName} has been approved by ${reviewerName} (${step.stepName}) ` +
            `and now requires your ${nextStep.stepName} review.`
          );
        } catch (error) {
          console.error(`Failed to notify ${reviewer.email}:`, error);
        }
      }

      // FIX 2: Accurate confirmation message when next reviewers exist
      await notificationController.createNotification(
        currentUserEmail,
        `You approved ${formName}. The form has been sent to ${nextReviewers.length} ` +
        `reviewer(s) for ${nextStep.stepName} approval.`
      );
    } else {
      // This should theoretically never happen if workflow is configured correctly
      console.error('No next reviewers found despite existing next step!');
      await notificationController.createNotification(
        currentUserEmail,
        `You approved ${formName}, but no ${nextStep.stepName} reviewers were found.`
      );
    }
  } else {
    // Final approval case
    const submitter = await User.findById(form.submittedBy).select('email');
    if (submitter) {
      await notificationController.createNotification(
        submitter.email,
        `Your form "${formName}" has been fully approved!`
      );
    }
  }
} else if (status === "declined") {
      // Decline notification
      try {
        const submitter = await User.findById(form.submittedBy).select('email name');
        if (submitter) {
          await notificationController.createNotification(
            submitter.email,
            `Your form "${formName}" was declined by ${currentUserName} (${currentStepName}). 
             Remarks: ${remarks || "No remarks provided"}`
          );
        }
      } catch (error) {
        console.error("❌ Decline notification failed:", error);
      }
    }

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
  getReviewSignatures,
  getEventTracker,
  createEventTracker,
  updateTrackerStep,
  getEventTrackerByFormId,
};
