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
        .select('email firstName lastName faculty role organization')
        .lean();
      return reviewer ? [reviewer] : [];
    }

    // 3. Get common fields for all queries
    const baseFields = 'email firstName lastName faculty role organization';
    
    // 4. Handle Admin role specifically
    if (nextStep.reviewerRole === 'Admin') {
      const admins = await User.find({
        $or: [
          { role: "Admin", status: "Active" },
          { 
            role: "Authority", 
            faculty: "Admin", 
            status: "Active",
            organization: tracker.organizationId 
          }
        ]
      }).select(baseFields).lean();
      return admins;
    }

    // 5. Handle other standard roles
    if (['Academic Services', 'Academic Director', 'Executive Director'].includes(nextStep.reviewerRole)) {
      return await User.find({
        role: "Authority",
        faculty: nextStep.reviewerRole,
        status: "Active",
        organization: tracker.organizationId
      }).select(baseFields).lean();
    }

    // 6. Get organization info
    const form = await Form.findById(tracker.formId)
      .populate('studentOrganization', 'organizationName organizationType')
      .lean();

    if (!form?.studentOrganization) {
      return [];
    }

    const orgName = form.studentOrganization.organizationName;
    const isAcademicOrg = form.studentOrganization.organizationType === 'Recognized Student Organization - Academic';

    // 7. Handle Adviser case
    if (nextStep.reviewerRole === 'Adviser') {
      return await User.find({
        role: "Authority",
        faculty: "Adviser",
        organization: orgName,
        status: "Active"
      }).select(baseFields).lean();
    }

    // 8. Enhanced Dean case handling for academic orgs
    if (nextStep.reviewerRole === 'Dean') {
      if (!isAcademicOrg) {
        console.log(`Skipping Dean notification for non-academic org: ${orgName}`);
        return [];
      }
      
      // Find dean specifically for this academic organization
      const deans = await User.find({
        role: "Authority",
        faculty: "Dean",
        deanForOrganization: orgName,
        status: "Active"
      }).select(baseFields).lean();

      if (deans.length === 0) {
        console.warn(`No active dean found for academic org: ${orgName}`);
      }
      return deans;
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
    // Fetch the tracker with proper population
    const tracker = await EventTracker.findById(trackerId)
      .populate({
        path: 'formId',
        model: 'LocalOffCampus'  // Explicitly specify the model
      })
      .populate({
        path: 'steps.reviewedBy',
        select: 'firstName lastName email role faculty organization'
      });

    if (!tracker) {
      return res.status(404).json({ message: "Tracker not found" });
    }

    if (!tracker.formId) {
      return res.status(404).json({ message: "Form reference missing in tracker" });
    }

    let form;
      try {
        // Get the actual form ID (handles both populated and non-populated cases)
        const formId = tracker.formId?._id || tracker.formId;
        
        if (!formId) {
          return res.status(404).json({ message: "Form ID not found in tracker" });
        }

        // Try LocalOffCampus first, then regular Form
        form = await LocalOffCampus.findById(formId)
          .populate('studentOrganization', 'email organizationName') || 
          await mongoose.model('Form').findById(formId)
            .populate('studentOrganization', 'email organizationName');
      } catch (error) {
        console.error("Error finding form:", error);
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
          // Return immediately without processing signature
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
  
      // Only process signature if all validations pass
      if (!signature) {
        return res.status(400).json({ message: "Signature is required for approval." });
      }
  
      // Update the step with reviewer details
      step.status = status;
      step.remarks = remarks || "";
      step.timestamp = new Date();
      step.reviewedBy = {
        _id: userId,
        firstName: firstName,
        lastName: lastName,
        email: currentUserEmail,
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
      tracker.currentStatus = "declined"; // THIS WAS MISSING
      
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

// In your updateTrackerStep function, replace the notification section with:

// Notification type mapping
const NOTIFICATION_TYPE_MAPPING = {
  REVIEW_REQUIRED: 'tracker',
  APPROVAL_COMPLETE: 'approval',
  MISSING_REVIEWER: 'tracker',
  FORM_APPROVED: 'approval',
  FORM_DECLINED: 'approval'
};

if (status === "approved") {
  const nextStepIndex = tracker.steps.findIndex(s => s._id.equals(step._id)) + 1;
  
  if (nextStepIndex < tracker.steps.length) {
    const nextStep = tracker.steps[nextStepIndex];
    const nextReviewers = await getNextReviewers(tracker, nextStepIndex - 1);

    const currentReviewerName = `${firstName} ${lastName}` || 
                              req.user.email.split('@')[0] || 
                              'a reviewer';

    // Special handling for Adviser to Dean transition
    if (step.stepName === 'Adviser' && nextStep.reviewerRole === 'Dean') {
      const form = await Form.findById(tracker.formId)
        .populate('studentOrganization', 'organizationType')
        .lean();
      
      const isAcademicOrg = form?.studentOrganization?.organizationType === 
                          'Recognized Student Organization - Academic';

      if (isAcademicOrg && nextReviewers.length > 0) {
        const deanMessage = `Form ${formName} from ${form.studentOrganization.organizationName} ` +
                           `has been approved by adviser ${currentReviewerName} ` +
                           `and requires your review as Dean.`;
        
        await Promise.all(nextReviewers.map(async (dean) => {
          await notificationController.createNotification(
            dean.email,
            deanMessage,
            NOTIFICATION_TYPE_MAPPING.REVIEW_REQUIRED,
            { 
              formId: form._id, 
              formType: form.formType,
              organizationName: form.studentOrganization.organizationName 
            }
          );
          console.log(`Dean notification sent to ${dean.email}`);
        }));
      }
    }
    // Regular notification handling for other cases
    else if (nextReviewers.length > 0) {
      await Promise.all(nextReviewers.map(async (reviewer) => {
        await notificationController.createNotification(
          reviewer.email,
          `Form ${formName} has been approved by ${currentReviewerName} and now requires your ${nextStep.stepName} review.`,
          NOTIFICATION_TYPE_MAPPING.REVIEW_REQUIRED,
          { formId: form._id, formType: form.formType }
        );
      }));

      // Notify current reviewer
      await notificationController.createNotification(
        currentUserEmail,
        `You approved ${formName}. It has been sent to ${nextReviewers.length} reviewer(s) for ${nextStep.stepName} approval.`,
        NOTIFICATION_TYPE_MAPPING.APPROVAL_COMPLETE,
        { formId: form._id, formType: form.formType }
      );
    } else {
      // Notify admins if no reviewers found
      const admins = await User.find({ 
        organizationId: form.organizationId, 
        role: 'Admin' 
      }).select('email').lean();

      if (admins.length > 0) {
        await Promise.all(admins.map(async (admin) => {
          await notificationController.createNotification(
            admin.email,
            `No reviewers found for ${nextStep.stepName} role for form ${formName}.`,
            NOTIFICATION_TYPE_MAPPING.MISSING_REVIEWER,
            { formId: form._id, formType: form.formType }
          );
        }));
      }

      // Notify current reviewer
      await notificationController.createNotification(
        currentUserEmail,
        `You approved ${formName}, but no reviewers were found for ${nextStep.stepName}.`,
        NOTIFICATION_TYPE_MAPPING.APPROVAL_COMPLETE,
        { formId: form._id, formType: form.formType }
      );
    }
  } else {
    // Final approval notifications
    try {
      // Notify submitter
      const submitter = await User.findById(form.submittedBy).select('email name');
      if (submitter) {
        await notificationController.createNotification(
          submitter.email,
          `Your form "${formName}" has been fully approved by all reviewers.`,
          NOTIFICATION_TYPE_MAPPING.FORM_APPROVED,
          { formId: form._id, formType: form.formType }
        );
      }

      // Notify organization
      const orgContact = getOrganizationContact();
      if (orgContact) {
        await notificationController.createNotification(
          orgContact.email,
          `Your organization's form "${formName}" has been fully approved!`,
          NOTIFICATION_TYPE_MAPPING.FORM_APPROVED,
          { formId: form._id, formType: form.formType }
        );
      }
    } catch (error) {
      console.error("Final approval notification failed:", error);
    }
  }
} else if (status === "declined") {
  // Decline notifications
  try {
    const submitter = await User.findById(form.submittedBy).select('email name');
    if (submitter) {
      await notificationController.createNotification(
        submitter.email,
        `Form ${formName} was declined at ${step.stepName} stage. Remarks: ${remarks || "None"}`,
        NOTIFICATION_TYPE_MAPPING.FORM_DECLINED,
        { formId: form._id, formType: form.formType }
      );
    }

    const orgContact = getOrganizationContact();
    if (orgContact) {
      await notificationController.createNotification(
        orgContact.email,
        `Your organization's form ${formName} was declined at ${step.stepName} stage.`,
        NOTIFICATION_TYPE_MAPPING.FORM_DECLINED,
        { formId: form._id, formType: form.formType }
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
// Update your getEventTrackerByFormId function
// In your eventTrackerController.js
const getEventTrackerByFormId = async (req, res) => {
  try {
    const { formId } = req.params;
    const tracker = await EventTracker.findOne({ formId })
      .populate({
        path: 'steps.reviewedBy',
        select: 'firstName lastName email role faculty',
        model: 'User' // Explicitly specify the model
      })
      .lean();

    if (!tracker) {
      return res.status(404).json({ message: "Event tracker not found" });
    }

    // Ensure all reviewedBy fields are properly populated
    tracker.steps = tracker.steps.map(step => {
      if (step.reviewedBy && typeof step.reviewedBy === 'string') {
        // Handle case where population didn't work
        step.reviewedBy = { _id: step.reviewedBy };
      }
      return step;
    });

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
