const LocalOffCampus = require('../models/LocalOffCampus');
const User = require('../models/User');
const Notification = require('../models/Notification');
const EventTracker = require('../models/EventTracker');
const mongoose = require('mongoose');

// Helper function to get required reviewers based on form phase
const getRequiredReviewers = async (formPhase, organizationId = null) => {
  if (formPhase === 'BEFORE') {
    const baseSteps = [
      { stepName: "Academic Services", reviewerRole: "Academic Services" },
      { stepName: "Admin", reviewerRole: "Admin" },
      { stepName: "Executive Director", reviewerRole: "Executive Director" }
    ];

    // Only add Dean step if this is an academic organization
    if (organizationId) {
      const org = await User.findById(organizationId);
      if (org && org.organizationType === 'Recognized Student Organization - Academic') {
        // Insert Dean step after Academic Services
        baseSteps.splice(1, 0, { 
          stepName: "Dean", 
          reviewerRole: "Dean" 
        });
      }
    }

    return baseSteps;
  } else { // AFTER form
    return [
      { stepName: "Academic Services", reviewerRole: "Academic Services" },
      { stepName: "Executive Director", reviewerRole: "Executive Director" }
    ];
  }
};

exports.submitLocalOffCampusBefore = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { localOffCampus } = req.body;
    
    // Validation (existing code remains the same)
    if (!localOffCampus) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: "Form data is required" });
    }
    
    const { nameOfHei, region, address, basicInformation, activitiesOffCampus } = localOffCampus;
    
    const errors = [];
    if (!nameOfHei?.trim()) errors.push("Name of HEI is required");
    if (!region?.trim()) errors.push("Region is required");
    if (!address?.trim()) errors.push("Address is required");
    if (!Array.isArray(basicInformation) || basicInformation.length === 0) {
      errors.push("At least one basic information entry is required");
    }
    if (!Array.isArray(activitiesOffCampus) || activitiesOffCampus.length === 0) {
      errors.push("Activities off campus information is required");
    }
    
    if (errors.length > 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        error: "Validation failed",
        details: errors 
      });
    }

    // Get the user's organization (if any)
    let organizationId = null;
    if (req.user.organizationId) {
      organizationId = req.user.organizationId;
    } else if (req.user.role === 'Organization') {
      organizationId = req.user._id;
    }

    // Create the BEFORE form
    const newForm = new LocalOffCampus({
      formPhase: "BEFORE",
      nameOfHei,
      region,
      address,
      basicInformation,
      activitiesOffCampus,
      submittedBy: req.user._id,
      status: "submitted",
      emailAddress: req.user.email,
      currentStep: 0,
      organizationId: organizationId // Store organization reference
    });

    const savedForm = await newForm.save({ session });

    // Create progress tracker with dynamic reviewers
    const requiredReviewers = await getRequiredReviewers('BEFORE', organizationId);
    const tracker = new EventTracker({
      formId: savedForm._id,
      formType: "LocalOffCampus",
      formPhase: "BEFORE",
      steps: requiredReviewers.map(reviewer => ({
        stepName: reviewer.stepName,
        reviewerRole: reviewer.reviewerRole,
        status: "pending",
        remarks: "",
        timestamp: null
      })),
      currentStep: 0,
      currentAuthority: requiredReviewers[0].reviewerRole,
      organizationId: organizationId // Store organization reference
    });

    const savedTracker = await tracker.save({ session });

    // Rest of the function remains the same...
    // Update form with tracker reference
    await LocalOffCampus.findByIdAndUpdate(
      savedForm._id,
      { trackerId: savedTracker._id },
      { session }
    );

    // Send notification to submitter
    if (req.user.email) {
      await Notification.create([{
        userEmail: req.user.email,
        message: `Your Local Off-Campus BEFORE form has been submitted!`,
        read: false,
        type: "event",
        timestamp: new Date(),
        trackerId: savedTracker._id
      }], { session });
    }
    
    // Send notifications to first reviewers
    const firstReviewers = await User.find({ 
      role: requiredReviewers[0].reviewerRole 
    }).session(session);

    const reviewerNotifications = firstReviewers.map(user => ({
      userEmail: user.email,
      message: `New Local Off-Campus BEFORE form submitted by ${req.user.name || 'an organization'}`,
      read: false,
      timestamp: new Date(),
      type: "organization",
      link: `/review/local-off-campus/${savedForm._id}`,
      formId: savedForm._id,
      trackerId: savedTracker._id
    }));

    await Notification.insertMany(reviewerNotifications, { session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: "BEFORE form submitted successfully",
      form: savedForm,
      tracker: savedTracker,
      eventId: savedForm._id
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    console.error("Error submitting BEFORE form:", error);
    res.status(500).json({
      success: false,
      message: "Error submitting BEFORE form",
      error: error.message
    });
  }
};

exports.submitLocalOffCampusAfter = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { eventId } = req.params;
    const { localOffCampus, formPhase } = req.body; // Modified to accept formPhase
    
    // Validation
    if (!localOffCampus) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: "Form data is required" });
    }
    
    const { afterActivity, problemsEncountered, recommendation } = localOffCampus;
    
    const errors = [];
    if (!Array.isArray(afterActivity) || afterActivity.length === 0) {
      errors.push("At least one after activity entry is required");
    }
    if (!problemsEncountered?.trim()) {
      errors.push("Problems encountered is required");
    }
    if (!recommendation?.trim()) {
      errors.push("Recommendation is required");
    }
    
    if (errors.length > 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        error: "Validation failed",
        details: errors 
      });
    }

    // Create the AFTER form
    const afterForm = new LocalOffCampus({
      formPhase: formPhase || 'AFTER', // Use provided formPhase or default
      eventId,
      afterActivity,
      problemsEncountered,
      recommendation,
      submittedBy: req.user._id,
      status: "submitted"
    });

    const savedAfterForm = await afterForm.save({ session });

    // Create progress tracker for AFTER form
    const afterTracker = new EventTracker({
      formId: savedAfterForm._id,
      relatedFormId: eventId,
      formType: "LocalOffCampus",
      formPhase: formPhase || 'AFTER',
      steps: getRequiredReviewers('AFTER').map(reviewer => ({
        stepName: reviewer.stepName,
        reviewerRole: reviewer.reviewerRole,
        status: "pending"
      })),
      currentStep: 0
    });
    await afterTracker.save({ session });

    // Send notifications
    await Notification.create([{
      userId: req.user._id,
      message: `Your Local Off-Campus AFTER form has been submitted successfully!`,
      read: false,
      timestamp: new Date(),
      type: "event", // Changed from "form-submission"
      trackerId: afterTracker._id
    }], { session });

    const academicServicesUsers = await User.find({ 
      role: "Academic Services" 
    }).session(session);

    await Notification.insertMany(
      academicServicesUsers.map(user => ({
        userId: user._id,
        message: `New Local Off-Campus AFTER form submitted by ${req.user.name || 'an organization'}`,
        read: false,
        timestamp: new Date(),
        type: "organization", // Changed from "review-request"
        link: `/review/local-off-campus/${savedAfterForm._id}`,
        trackerId: afterTracker._id
      })),
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: "AFTER form submitted successfully",
      form: savedAfterForm,
      tracker: afterTracker
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    console.error("Error submitting AFTER form:", error);
    res.status(500).json({
      success: false,
      message: "Error submitting AFTER form",
      error: error.message
    });
  }
};

exports.getLocalOffCampusForms = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    // Get BEFORE form
    const beforeForm = await LocalOffCampus.findOne({
      _id: eventId,
      formPhase: "BEFORE"
    });
    
    if (!beforeForm) {
      return res.status(404).json({ error: "BEFORE form not found" });
    }
    
    // Get AFTER form if exists
    const afterForm = await LocalOffCampus.findOne({
      eventId: beforeForm._id,
      formPhase: "AFTER"
    });
    
    // Get trackers
    const beforeTracker = await EventTracker.findOne({ 
      formId: beforeForm._id 
    });
    
    const afterTracker = afterForm ? await EventTracker.findOne({ 
      formId: afterForm._id 
    }) : null;
    
    res.status(200).json({
      success: true,
      data: {
        before: {
          form: beforeForm,
          tracker: beforeTracker
        },
        after: afterForm ? {
          form: afterForm,
          tracker: afterTracker
        } : null
      }
    });
  } catch (error) {
    console.error("Error retrieving form data:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving form data",
      error: error.message
    });
  }
};

// Add this to localOffController
exports.checkBeforeFormApproval = async (req, res) => {
  try {
    const beforeForm = await LocalOffCampus.findOne({
      submittedBy: req.user._id,
      formPhase: "BEFORE"
    }).select('_id status formPhase hasAfterReport');

    if (!beforeForm) {
      return res.status(200).json({
        approved: false,
        exists: false,
        message: "No BEFORE form found"
      });
    }

    res.status(200).json({
      approved: beforeForm.status === 'approved',
      hasAfterReport: beforeForm.hasAfterReport || false,
      eventId: beforeForm._id,
      exists: true,
      status: beforeForm.status,
      formPhase: beforeForm.formPhase
    });
  } catch (error) {
    console.error("Error checking BEFORE form:", error);
    res.status(500).json({ 
      error: error.message,
      details: "Server error while checking form status"
    });
  }
};

exports.updateToAfterPhase = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { formId } = req.params;
    const { localOffCampus } = req.body;

    // 1. Enhanced validation
    if (!localOffCampus || typeof localOffCampus !== 'object') {
      throw new Error('Invalid request format');
    }

    const { afterActivity, problemsEncountered, recommendation } = localOffCampus;

    if (!Array.isArray(afterActivity)) {
      throw new Error('afterActivity must be an array');
    }

    if (afterActivity.length === 0) {
      throw new Error('At least one activity is required');
    }

    if (!problemsEncountered?.trim()) {
      throw new Error('Problems encountered is required');
    }

    if (!recommendation?.trim()) {
      throw new Error('Recommendation is required');
    }

    // 2. Find BEFORE form
    const beforeForm = await LocalOffCampus.findOne({
      _id: formId,
      formPhase: 'BEFORE',
      status: 'approved'
    }).session(session);

    if (!beforeForm) {
      throw new Error('Approved BEFORE form not found');
    }

    // 3. Update to AFTER phase
    const updatedForm = await LocalOffCampus.findByIdAndUpdate(
      formId,
      {
        formPhase: 'AFTER',
        afterActivity: localOffCampus.afterActivity,
        problemsEncountered: localOffCampus.problemsEncountered,
        recommendation: localOffCampus.recommendation,
        status: 'submitted'
      },
      { new: true, session }
    );

    // Update tracker
    const requiredReviewers = getRequiredReviewers('AFTER');
    await EventTracker.findOneAndUpdate(
      { formId },
      {
        formPhase: 'AFTER',
        steps: requiredReviewers.map(reviewer => ({
          stepName: reviewer.stepName,
          reviewerRole: reviewer.reviewerRole,
          status: 'pending',
          remarks: '',
          timestamp: null
        })),
        currentStep: 0
      },
      { session }
    );

    // Send notifications
    const academicServicesUsers = await User.find({ 
      role: "Academic Services" 
    }).session(session);

    await Notification.insertMany(
      academicServicesUsers.map(user => ({
        userId: user._id,
        message: `Local Off-Campus AFTER form submitted by ${req.user.name}`,
        read: false,
        timestamp: new Date(),
        type: "review-request",
        link: `/review/local-off-campus/${formId}`
      })),
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: "AFTER phase updated successfully",
      form: updatedForm
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Update error:", error.message);
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

exports.updateLocalOffCampusAfter = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { afterActivity, problemsEncountered, recommendation, formPhase } = req.body;

    const updatedForm = await LocalOffCampus.findByIdAndUpdate(
      eventId,
      {
        afterActivity,
        problemsEncountered,
        recommendation,
        formPhase,
        updatedAt: Date.now()
      },
      { new: true }
    );

    if (!updatedForm) {
      return res.status(404).json({ error: "Local Off-Campus form not found" });
    }

    res.status(200).json({
      success: true,
      message: "AFTER report updated successfully",
      data: updatedForm
    });
  } catch (error) {
    console.error("Error updating AFTER report:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};
