const LocalOffCampus = require('../models/LocalOffCampus');
const User = require('../models/User');
const Notification = require('../models/Notification');
const EventTracker = require('../models/EventTracker');
const mongoose = require('mongoose');

// Helper function to get required reviewers based on form phase
const getRequiredReviewers = (formPhase) => {
  if (formPhase === 'BEFORE') {
    return [
      { stepName: "Academic Services", reviewerRole: "Academic Services" },
      { stepName: "Dean", reviewerRole: "Dean" },
      { stepName: "Admin", reviewerRole: "Admin" },
      { stepName: "Executive Director", reviewerRole: "Executive Director" }
    ];
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
      currentStep: 0 // Add currentStep to track progress
    });

    const savedForm = await newForm.save({ session });

    // Create progress tracker - MODIFIED THIS SECTION
    const requiredReviewers = getRequiredReviewers('BEFORE');
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
      currentAuthority: requiredReviewers[0].reviewerRole // Set first reviewer as current
    });

    const savedTracker = await tracker.save({ session });

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
        timestamp: new Date(),
        type: "form-submission"
      }], { session });
    }

    // Send notifications to first reviewers (Academic Services)
    const academicServicesUsers = await User.find({ 
      role: "Academic Services" 
    }).session(session);

    const reviewerNotifications = academicServicesUsers.map(user => ({
      userEmail: user.email,
      message: `New Local Off-Campus BEFORE form submitted by ${req.user.name || 'an organization'}`,
      read: false,
      timestamp: new Date(),
      type: "review-request",
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
    const { eventId, localOffCampus } = req.body;
    
    // Validation
    if (!eventId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: "Event ID is required" });
    }
    
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

    // Verify the BEFORE form exists and is approved
    const beforeForm = await LocalOffCampus.findOne({
      _id: eventId,
      formPhase: "BEFORE",
      status: "approved"
    }).session(session);

    if (!beforeForm) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        error: "No approved BEFORE form found with this ID" 
      });
    }

    // Create the AFTER form
    const afterForm = new LocalOffCampus({
      formPhase: "AFTER",
      eventId: beforeForm._id,
      afterActivity,
      problemsEncountered,
      recommendation,
      submittedBy: req.user._id,
      status: "submitted",
      // Copy relevant fields from BEFORE form
      nameOfHei: beforeForm.nameOfHei,
      region: beforeForm.region,
      address: beforeForm.address
    });

    const savedAfterForm = await afterForm.save({ session });

    // Create progress tracker for AFTER form
    const afterTracker = new EventTracker({
      formId: savedAfterForm._id,
      relatedFormId: beforeForm._id,
      formType: "LocalOffCampus",
      formPhase: "AFTER",
      steps: getRequiredReviewers('AFTER').map(reviewer => ({
        stepName: reviewer.stepName,
        reviewerRole: reviewer.reviewerRole,
        status: "pending"
      })),
      currentStep: 0
    });
    await afterTracker.save({ session });

    // Update BEFORE form to mark it as having an AFTER report
    await LocalOffCampus.findByIdAndUpdate(
      beforeForm._id,
      { hasAfterReport: true },
      { session }
    );

    // Send notification to submitter
    await Notification.create([{
      userId: req.user._id,
      message: `Your Local Off-Campus AFTER form has been submitted successfully!`,
      read: false,
      timestamp: new Date(),
      type: "form-submission"
    }], { session });

    // Send notifications to first reviewers (Academic Services)
    const academicServicesUsers = await User.find({ 
      role: "Academic Services" 
    }).session(session);

    await Notification.insertMany(
      academicServicesUsers.map(user => ({
        userId: user._id,
        message: `New Local Off-Campus AFTER form submitted by ${req.user.name || 'an organization'}`,
        read: false,
        timestamp: new Date(),
        type: "review-request",
        link: `/review/local-off-campus/${savedAfterForm._id}`
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