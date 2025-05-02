const EventTracker = require("../models/EventTracker");
const User = require("../models/User"); // Import User model
const Form = require("../models/Form"); // Import User model
const mongoose = require('mongoose');
const notificationController = require('./notificationController');
const LocalOffCampus = require('../models/LocalOffCampus');


// HELPER

const getOrganizationEmail = async (formId) => {
  try {
    const Form = mongoose.model('Form');
    const form = await Form.findById(formId)
      .populate('studentOrganization', 'email organizationName');
    
    if (!form) {
      console.log('❌ Form not found');
      return null;
    }

    // Handle both direct email and populated organization cases
    if (form.studentOrganization) {
      return {
        email: form.studentOrganization.email || `${form.studentOrganization.organizationName.toLowerCase().replace(/\s+/g, '')}@nu-mos.edu.sh`,
        name: form.studentOrganization.organizationName
      };
    } else if (form.emailAddress) {
      return {
        email: form.emailAddress,
        name: form.studentOrganizationName || 'Your Organization'
      };
    }

    return null;
  } catch (error) {
    console.error('Error getting organization email:', error);
    return null;
  }
};

const getNextReviewers = async (tracker, currentStepIndex) => {
  try {
    // 1. Check if process is complete
    if (currentStepIndex + 1 >= tracker.steps.length) {
      return [];
    }

    const nextStep = tracker.steps[currentStepIndex + 1];
    
    // 2. Handle pre-assigned reviewers (advisers/deans)
    if (nextStep.assignedReviewer) {
      const reviewer = await User.findById(nextStep.assignedReviewer)
        .select('email firstName lastName faculty role')
        .lean();
      return reviewer ? [reviewer] : [];
    }

    // 3. Get common fields for all queries
    const baseFields = 'email firstName lastName faculty role organization';
    
    // 4. Handle standard roles (Admin, Academic Services, etc.)
    if (['Admin', 'Academic Services', 'Academic Director', 'Executive Director'].includes(nextStep.reviewerRole)) {
      return await User.find({
        role: "Authority",
        faculty: nextStep.reviewerRole,
        status: "Active"
      }).select(baseFields).lean();
    }

    // 5. Get organization info once (for both Adviser and Dean cases)
    const form = await Form.findById(tracker.formId)
      .populate('studentOrganization', 'organizationName organizationType')
      .lean();

    if (!form?.studentOrganization) {
      return [];
    }

    const orgName = form.studentOrganization.organizationName;
    const isAcademicOrg = form.studentOrganization.organizationType === 'Recognized Student Organization - Academic';

    // 6. Handle Adviser case
    if (nextStep.reviewerRole === 'Adviser') {
      return await User.find({
        role: "Authority",
        faculty: "Adviser",
        organization: orgName,
        status: "Active"
      }).select(baseFields).lean();
    }

    // 7. Handle Dean case (only for academic orgs)
    if (nextStep.reviewerRole === 'Dean' && isAcademicOrg) {
      return await User.find({
        role: "Authority",
        faculty: "Dean",
        organization: orgName, // Changed from organizationId to orgName
        status: "Active"
      }).select(baseFields).lean();
    }

    return [];
  } catch (error) {
    console.error("Error in getNextReviewers:", error);
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
    const { trackerId, stepId } = req.params;
    const { status, remarks, signature } = req.body;
    const userId = req.user._id;
    const { role, faculty, email: currentUserEmail, firstName, lastName } = req.user;

    // Validate user and request
    if (!req.user) {
      return res.status(403).json({ message: "Unauthorized: Missing user credentials." });
    }

    const reviewerRoles = [
      "Adviser", 
      "Dean", 
      "Academic Services", 
      "Academic Director", 
      "Executive Director"
    ];

    if (role !== "Admin" && (!faculty || !reviewerRoles.includes(faculty))) {
      return res.status(403).json({ 
        message: "Unauthorized: Only Admins or authorized reviewers can update the tracker." 
      });
    }

    // Fetch the tracker with populated form and organization data
    const tracker = await EventTracker.findById(trackerId)
      .populate({
        path: 'formId',
        populate: {
          path: 'studentOrganization',
          select: 'organizationName'
        }
      })
      .populate({
        path: 'steps.reviewedBy',
        select: 'firstName lastName email role faculty organization'
      });
    
    if (!tracker) {
      return res.status(404).json({ message: "Tracker not found" });
    }

    let form;
    try {
      form = await LocalOffCampus.findById(tracker.formId._id) || 
             await mongoose.model('Form').findById(tracker.formId._id)
               .populate('studentOrganization', 'email organizationName');
    } catch (error) {
      console.error("Error finding form:", error);
      return res.status(404).json({ message: "Form not found" });
    }

    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    // Find the step
    const step = tracker.steps.find(step => step._id.toString() === stepId);
    if (!step) {
      return res.status(404).json({ message: "Step not found" });
    }

    // Additional validation for Advisers - must be assigned to this organization
    if (faculty === "Adviser") {
      const isAssignedAdviser = await User.findOne({
        _id: userId,
        role: "Authority",
        faculty: "Adviser",
        organization: form.studentOrganization?.organizationName || form.organizationName,
        status: "Active"
      });

      if (!isAssignedAdviser && role !== "Admin") {
        return res.status(403).json({ 
          message: "Unauthorized: Only the assigned adviser for this organization can review this step." 
        });
      }
    }

    // Validate step order
    const firstPendingOrDeclinedStepIndex = tracker.steps.findIndex(step => 
      step.status === "pending" || step.status === "declined"
    );

    if (!tracker.steps[firstPendingOrDeclinedStepIndex] || 
        tracker.steps[firstPendingOrDeclinedStepIndex]._id.toString() !== stepId) {
      return res.status(403).json({ message: "You cannot skip steps. Approve them in order." });
    }

    if (tracker.steps[firstPendingOrDeclinedStepIndex].status !== "pending" && 
        tracker.steps[firstPendingOrDeclinedStepIndex].status !== "declined") {
      return res.status(400).json({ message: "This step has already been reviewed." });
    }

    if (step.stepName !== faculty && role !== "Admin") {
      return res.status(403).json({ message: `Unauthorized: Only the ${step.stepName} can review this step.` });
    }

    // Update the step with reviewer details
    step.status = status;
    step.remarks = remarks || "";
    step.timestamp = new Date();
    step.reviewedBy = {
      _id: userId,
      firstName: firstName,
      lastName: lastName,
      role: role,
      faculty: faculty
    };
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
    const isApproved = tracker.steps.every(step => {
      // Skip Dean check for non-academic orgs
      if (step.stepName === 'Dean' && form.organizationType !== 'Recognized Student Organization - Academic') {
        return true;
      }
      return step.status === 'approved';
    });

    if (form.formPhase) { // LocalOffCampus form
      form.finalStatus = isDeclined ? 'declined' : isApproved ? 'approved' : 'pending';
      form.status = isDeclined ? 'rejected' : isApproved ? 'approved' : 'submitted';
    } else { // Regular Form
      form.finalStatus = isDeclined ? 'declined' : isApproved ? 'approved' : 'pending';
    }

    await form.save();

    // Enhanced notification handling
    // Enhanced notification handling
const formName = form.formType === 'Activity' 
? form.eventTitle || `Activity Form ${form._id}`
: form.formType === 'Project' 
  ? form.projectTitle || `Project Form ${form._id}`
  : form.formType === 'LocalOffCampus' 
    ? `Local Off-Campus ${form.formPhase} Form ${form._id}`
    : `Form ${form._id}`;

const currentStepName = step.stepName;

    const getOrganizationContact = () => {
      if (form.studentOrganization) {
        return {
          email: form.studentOrganization.email || 
                `${form.studentOrganization.organizationName.toLowerCase().replace(/\s+/g, '')}@nu-moa.edu.ph`,
          name: form.studentOrganization.organizationName
        };
      }
      return null;
    };

    if (status === "approved") {
      const nextStepIndex = tracker.steps.findIndex(s => s._id.equals(step._id)) + 1;
      
      if (nextStepIndex < tracker.steps.length) {
        const nextStep = tracker.steps[nextStepIndex];
        const nextReviewers = await getNextReviewers(tracker, nextStepIndex - 1); // Updated

        const currentReviewerName = `${firstName} ${lastName}` || 
                          req.user.email.split('@')[0] || 
                          'a reviewer';

        if (nextReviewers.length > 0) {
          for (const reviewer of nextReviewers) {
            try {
              await notificationController.createNotification(
                reviewer.email,
                `Action Required: ${formName} needs your ${nextStep.stepName} review`,
                `Form ${formName} has been approved by ${currentReviewerName} and now requires your ${nextStep.stepName} review.`
              );
            } catch (error) {
              console.error(`Failed to notify ${reviewer.email}:`, error);
            }
          }

          await notificationController.createNotification(
            currentUserEmail,
            `Approval Complete: ${formName}`,
            `You approved ${formName}. It has been sent to ${nextReviewers.length} reviewer(s) for ${nextStep.stepName} approval.`
          );
        } else {
          const admins = await User.find({ 
            organizationId: form.organizationId, 
            role: 'Admin' 
          }).select('email').lean();
          
          await notificationController.createNotification(
            currentUserEmail,
            `Approval Complete - Action Needed`,
            `You approved ${formName}, but no reviewers were found for ${nextStep.stepName}. Admins have been notified.`
          );
        }
      } else {
        // Final approval case - notify submitter AND organization
        try {
          // Notify individual submitter
          const submitter = await User.findById(form.submittedBy).select('email name');
          if (submitter) {
            await notificationController.createNotification(
              submitter.email,
              `Approved: ${formName}`,
              `Your form "${formName}" has been fully approved by all reviewers.`
            );
          }

          // Notify organization
          const orgContact = getOrganizationContact();
          if (orgContact) {
            await notificationController.createNotification(
              orgContact.email,
              `Organization Update: ${formName} Approved`,
              `Your organization's form "${formName}" has been fully approved!\n\n` +
              `Form Details:\n` +
              `- ID: ${form._id}\n` +
              `- Type: ${form.formType}\n` +
              `- Final Approval Date: ${new Date().toLocaleString()}\n\n` +
              `You can now proceed with the next steps for your ${form.formType === 'Activity' ? 'event' : 'project'}.`
            );
          }
        } catch (error) {
          console.error("Final approval notification failed:", error);
        }
      }
    } else if (status === "declined") {
      // Decline notification - notify submitter AND organization
      try {
        const submitter = await User.findById(form.submittedBy).select('email name');
        if (submitter) {
          await notificationController.createNotification(
            submitter.email,
            `Form Declined: ${formName}`,
            `Form Update: ${formName} (ID: ${form._id})\n\n` +
            `Status: DECLINED at ${step.stepName} stage\n` +
            `Reviewed by: ${currentUserName} (${currentStepName})\n` +
            `Date: ${new Date().toLocaleString()}\n` +
            `Remarks: ${remarks || "No remarks provided"}\n\n` +
            `Please address the issues and resubmit the form.`
          );
        }

        // Notify organization
        const orgContact = getOrganizationContact();
        if (orgContact) {
          await notificationController.createNotification(
            orgContact.email,
            `Organization Update: ${formName} Declined`,
            `Your organization's form update:\n\n` +
            `Form: ${formName} (ID: ${form._id})\n` +
            `Status: DECLINED at ${step.stepName} stage\n` +
            `Reviewed by: ${currentUserName} (${currentStepName})\n` +
            `Date: ${new Date().toLocaleString()}\n` +
            `Remarks: ${remarks || "No remarks provided"}\n\n` +
            `Please address the issues and resubmit the form.`
          );
        }
      } catch (error) {
        console.error("Decline notification failed:", error);
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
