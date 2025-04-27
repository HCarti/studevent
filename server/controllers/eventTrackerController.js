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
    console.log('🔍 Next Step Details:', nextStep);

    const Form = mongoose.model('Form');
    const form = await Form.findById(tracker.formId);
    
    if (!form) {
      console.log('❌ Form not found for tracker:', tracker.formId);
      return [];
    }

    // Get all possible reviewer roles from the tracker steps
    const allReviewerRoles = [...new Set(tracker.steps.map(step => step.reviewerRole))];
    console.log('🔍 All reviewer roles in tracker:', allReviewerRoles);

    // Get reviewers with the exact required role (case-sensitive)
    const reviewers = await User.find({
      role: nextStep.reviewerRole,
      organizationId: form.organizationId
    }).select('email role name').lean();

    console.log('✅ Matching reviewers:', reviewers);

    if (reviewers.length === 0) {
      // Check if role exists in system at all
      const roleExists = await User.exists({
        organizationId: form.organizationId,
        role: nextStep.reviewerRole
      });
      
      if (!roleExists) {
        console.error(`❌ Role ${nextStep.reviewerRole} doesn't exist in organization`);
      } else {
        console.warn(`⚠️ No active users found for role: ${nextStep.reviewerRole}`);
      }
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

    // Updated reviewer roles list including Admin
    const reviewerRoles = [
      "Adviser", 
      "Dean", 
      "Admin",
      "Academic Services", 
      "Academic Director", 
      "Executive Director"
    ];

    if (role !== "Admin" && (!faculty || !reviewerRoles.includes(faculty))) {
      return res.status(403).json({ 
        message: "Unauthorized: Only Admins or authorized reviewers can update the tracker." 
      });
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

    if (status === "approved") {
      const nextStepIndex = firstPendingOrDeclinedStepIndex + 1;
      
      if (nextStepIndex < tracker.steps.length) {
        const nextStep = tracker.steps[nextStepIndex];
        const nextReviewers = await getNextReviewers(tracker, firstPendingOrDeclinedStepIndex);

        // Get the current reviewer's name for the notification
        const currentReviewerName = currentUserName || 
                                  (step.reviewedBy?.name || 
                                  req.user.email.split('@')[0] || 
                                  'a reviewer');

        // Get form details for more context
        const formDetails = `Form: ${formName} (ID: ${form._id})`;
        const currentStepDetails = `Current Step: ${step.stepName}`;
        const nextStepDetails = `Next Step: ${nextStep.stepName}`;

        if (nextReviewers && nextReviewers.length > 0) {
          // Send notifications to all next reviewers
          const notificationPromises = nextReviewers.map(async (reviewer) => {
            try {
              const message = `
                Action Required: ${formDetails}\n
                ${currentStepDetails} has been approved by ${currentReviewerName}\n
                ${nextStepDetails} now requires your review.\n
                Please log in to the system to take action.
              `;
              
              await notificationController.createNotification(
                reviewer.email,
                `Action Required: ${formName} needs your ${nextStep.stepName} review`,
                message
              );
              
              console.log(`✅ Notification sent to ${reviewer.email}`);
            } catch (error) {
              console.error(`❌ Failed to notify ${reviewer.email}:`, error);
            }
          });

          await Promise.all(notificationPromises);

          // Confirmation to current reviewer
          const confirmationMessage = `
            You approved ${formDetails} at ${step.stepName} stage.\n
            The form has been forwarded to ${nextReviewers.length} reviewer(s) for ${nextStep.stepName} approval.\n
            Reviewers notified: ${nextReviewers.map(r => r.email).join(', ')}
          `;
          
          await notificationController.createNotification(
            currentUserEmail,
            `Approval Confirmation: ${formName} forwarded`,
            confirmationMessage
          );
        } else {
          // No reviewers found for next step - admin should be alerted
          console.error(`❌ No reviewers found for next step: ${nextStep.stepName}`);
          
          const adminMessage = `
            URGENT: Workflow Blocked\n\n
            ${formDetails}\n
            ${currentStepDetails} was approved by ${currentReviewerName}\n
            ${nextStepDetails} has no assigned reviewers.\n
            Please assign reviewers for ${nextStep.stepName} role to continue the workflow.
          `;
          
          // Find admin users to notify
          const admins = await User.find({ 
            organizationId: form.organizationId, 
            role: 'Admin' 
          }).select('email');
          
          if (admins.length > 0) {
            await Promise.all(admins.map(admin => 
              notificationController.createNotification(
                admin.email,
                `Workflow Blocked: Missing reviewers for ${nextStep.stepName}`,
                adminMessage
              )
            ));
          }
          
          // Still notify current user
          await notificationController.createNotification(
            currentUserEmail,
            `Approval Complete - Action Needed`,
            `You approved ${formDetails}, but no reviewers were found for the next step (${nextStep.stepName}). 
             An admin has been notified to resolve this issue.`
          );
        }
      } else {
        // Final approval case - notify submitter
        try {
          const submitter = await User.findById(form.submittedBy).select('email name');
          if (submitter) {
            const approvalMessage = `
              Congratulations!\n\n
              Your form "${formName}" (ID: ${form._id}) has been fully approved by all reviewers.\n
              Final approval completed on: ${new Date().toLocaleString()}\n
              You can now proceed with the next steps for your event.
            `;
            
            await notificationController.createNotification(
              submitter.email,
              `Final Approval: ${formName}`,
              approvalMessage
            );
          }
        } catch (error) {
          console.error("❌ Final approval notification failed:", error);
        }
      }
    } else if (status === "declined") {
      // Decline notification - enhanced version
      try {
        const submitter = await User.findById(form.submittedBy).select('email name');
        if (submitter) {
          const declineMessage = `
            Form Update: ${formName} (ID: ${form._id})\n\n
            Status: DECLINED at ${step.stepName} stage\n
            Reviewed by: ${currentUserName} (${currentStepName})\n
            Date: ${new Date().toLocaleString()}\n
            Remarks: ${remarks || "No remarks provided"}\n\n
            Please address the issues and resubmit the form.
          `;
          
          await notificationController.createNotification(
            submitter.email,
            `Form Declined: ${formName}`,
            declineMessage
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
