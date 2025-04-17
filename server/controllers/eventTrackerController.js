const EventTracker = require("../models/EventTracker");
const User = require("../models/User"); // Import User model
const mongoose = require('mongoose');
const notificationController = require('./notificationController');

// HELPER

const getNextReviewers = async (tracker, currentStepIndex) => {
  try {
    const nextStepIndex = currentStepIndex + 1;
    if (nextStepIndex >= tracker.steps.length) return [];

    const nextStep = tracker.steps[nextStepIndex];
    const form = await Form.findById(tracker.formId).select('organizationId submittedBy');

    if (!form) {
      console.error('❌ Form not found');
      return [];
    }

    // Debug: Show critical info
    console.log('🔍 Critical Info:', {
      formId: tracker.formId,
      organizationId: form.organizationId,
      requiredRole: nextStep.reviewerRole
    });

    // Fallback if organizationId is missing
    const query = { role: nextStep.reviewerRole };
    if (form.organizationId) {
      query.organizationId = form.organizationId;
    } else {
      console.warn('⚠️ No organizationId on form - searching all users with role');
    }

    const reviewers = await User.find(query)
      .select('email name role organizationId')
      .lean();

    console.log('👥 Found Reviewers:', reviewers.map(r => ({
      email: r.email,
      role: r.role,
      org: r.organizationId
    })));

    return reviewers;
  } catch (error) {
    console.error('❌ getNextReviewers error:', error);
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
    const { role, faculty, email: currentUserEmail } = req.user; // Add email to destructuring

    // Validate user and request
    if (!req.user) {
      return res.status(403).json({ message: "Unauthorized: Missing user credentials." });
    }

    const facultyRoles = ["Adviser", "Dean", "Academic Services", "Academic Director", "Executive Director"];
    if (role !== "Admin" && (!faculty || !facultyRoles.includes(faculty))) {
      return res.status(403).json({ message: "Unauthorized: Only Admins or Faculty reviewers can update the tracker." });
    }

    // Fetch the tracker
    const tracker = await EventTracker.findById(trackerId).populate({
      path: 'steps.reviewedBy',
      select: 'email role'
    });
    if (!tracker) {
      return res.status(404).json({ message: "Tracker not found" });
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
    console.log("First Pending or Declined Step Index:", firstPendingOrDeclinedStepIndex);

    const firstPendingOrDeclinedStep = tracker.steps[firstPendingOrDeclinedStepIndex];
    console.log("First Pending or Declined Step:", firstPendingOrDeclinedStep);

    // Ensure the step being updated is the first pending or declined step
    if (!firstPendingOrDeclinedStep || firstPendingOrDeclinedStep._id.toString() !== stepId) {
      return res.status(403).json({ message: "You cannot skip steps. Approve them in order." });
    }

    // Check if the step is already reviewed (only for pending steps)
    if (firstPendingOrDeclinedStep.status !== "pending" && firstPendingOrDeclinedStep.status !== "declined") {
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

    // Update currentStep and currentAuthority
    if (status === "approved") {
      const nextStepIndex = firstPendingOrDeclinedStepIndex + 1;
      if (nextStepIndex < tracker.steps.length) {
        tracker.currentStep = tracker.steps[nextStepIndex].stepName;
        tracker.currentAuthority = tracker.steps[nextStepIndex].reviewerRole;
      } else {
        tracker.currentStep = "Completed";
        tracker.currentAuthority = "None";
      }
    } else if (status === "declined") {
      // If the step is declined, stay on the current step
      tracker.currentStep = step.stepName;
      tracker.currentAuthority = step.reviewerRole;

      // Reset all subsequent steps to "pending"
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

    if (status === "approved") {
      const nextStepIndex = firstPendingOrDeclinedStepIndex + 1;
      
      // Debug: Log current workflow state
      console.log('🔍 Workflow State:', {
        currentStep: firstPendingOrDeclinedStepIndex,
        totalSteps: tracker.steps.length,
        nextStepExists: nextStepIndex < tracker.steps.length,
        formId: tracker.formId,
        currentUser: currentUserEmail
      });
    
      if (nextStepIndex < tracker.steps.length) {
        // Get next step details
        const nextStep = tracker.steps[nextStepIndex];
        const formName = form.name || `Form ${form._id}`;
        
        // Debug: Log next step details
        console.log('🔍 Next Step Details:', {
          stepName: nextStep.stepName,
          requiredRole: nextStep.reviewerRole,
          currentStatus: nextStep.status
        });
    
        // Get next reviewers with enhanced debugging
        const nextReviewers = await getNextReviewers(tracker, firstPendingOrDeclinedStepIndex);
        console.log('👥 Next Reviewers Found:', {
          count: nextReviewers.length,
          reviewers: nextReviewers.map(r => ({
            email: r.email,
            role: r.role,
            name: r.name
          }))
        });
    
        // Send notifications to next reviewers
        for (const reviewer of nextReviewers) {
          try {
            const notificationMessage = `Action Required: ${formName} requires your ${nextStep.stepName} review.`;
            console.log(`✉️ Attempting to notify ${reviewer.email}`);
            
            await notificationController.createNotification(
              reviewer.email,
              notificationMessage
            );
            
            console.log(`✅ Successfully notified ${reviewer.email}`);
          } catch (notificationError) {
            console.error(`❌ Failed to notify ${reviewer.email}:`, {
              error: notificationError.message,
              stack: notificationError.stack
            });
          }
        }
    
        // Send confirmation to current reviewer
        try {
          const confirmationMessage = `You approved ${formName}. ${nextReviewers.length} reviewer(s) have been notified.`;
          console.log(`✉️ Sending confirmation to ${currentUserEmail}`);
          
          await notificationController.createNotification(
            currentUserEmail,
            confirmationMessage
          );
          
          console.log(`✅ Confirmation sent to ${currentUserEmail}`);
        } catch (error) {
          console.error("❌ Failed to send confirmation:", {
            error: error.message,
            stack: error.stack
          });
        }
      } else {
        // Final approval case
        console.log('🏁 Form fully approved - notifying submitter');
        
        try {
          const submitter = await User.findById(form.submittedBy).select('email name');
          if (submitter) {
            await notificationController.createNotification(
              submitter.email,
              `Your form "${form.name}" has been fully approved!`
            );
            console.log(`✅ Final approval sent to submitter: ${submitter.email}`);
          } else {
            console.error('❌ Form submitter not found');
          }
        } catch (error) {
          console.error("❌ Final approval notification failed:", {
            error: error.message,
            stack: error.stack
          });
        }
      }
    } else if (status === "declined") {
      // Decline case
      console.log('🛑 Form declined - notifying submitter');
      
      try {
        const submitter = await User.findById(form.submittedBy).select('email name');
        if (submitter) {
          await notificationController.createNotification(
            submitter.email,
            `Your form "${form.name}" was declined by ${req.user.name}. Remarks: ${remarks || "None provided"}`
          );
          console.log(`✅ Decline notification sent to ${submitter.email}`);
        } else {
          console.error('❌ Form submitter not found for decline notification');
        }
      } catch (error) {
        console.error("❌ Decline notification failed:", {
          error: error.message,
          stack: error.stack
        });
      }
    }
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
  getReviewSignatures,
  getEventTracker,
  createEventTracker,
  updateTrackerStep,
  getEventTrackerByFormId,
};
