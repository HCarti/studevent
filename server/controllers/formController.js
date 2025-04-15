const Form = require('../models/Form');
const User = require('../models/User');
const Notification = require("../models/Notification");
const EventTracker = require("../models/EventTracker");
const mongoose = require("mongoose");
const CalendarEvent = require("../models/CalendarEvent");
const moment = require('moment');
const BudgetProposal = require("../models/BudgetProposal");

// HELPERS

// Enhanced event capacity check that handles both form types
const checkEventCapacity = async (startDate, endDate, currentFormId = null) => {
  const start = moment(startDate).startOf('day');
  const end = moment(endDate).startOf('day');
  
  // Build query to find overlapping events from both form types
  const query = {
    $or: [
      { startDate: { $lte: end.toDate() }, endDate: { $gte: start.toDate() } }
    ]
  };
  
  if (currentFormId) {
    query.formId = { $ne: currentFormId };
  }

  const existingEvents = await CalendarEvent.find(query);
  
  // Count events per date
  const eventCounts = {};
  existingEvents.forEach(event => {
    const eventStart = moment(event.startDate).startOf('day');
    const eventEnd = moment(event.endDate).startOf('day');
    
    for (let date = eventStart.clone(); date <= eventEnd; date.add(1, 'days')) {
      const dateStr = date.format('YYYY-MM-DD');
      eventCounts[dateStr] = (eventCounts[dateStr] || 0) + 1;
    }
  });
  
  // Check each day of the new event
  for (let date = start.clone(); date <= end; date.add(1, 'days')) {
    const dateStr = date.format('YYYY-MM-DD');
    if ((eventCounts[dateStr] || 0) >= 3) {
      throw new Error(`Date ${dateStr} has reached the maximum number of events (3)`);
    }
  }
};

// Unified calendar event creator that handles both form types
const createCalendarEventFromForm = async (form) => {
  try {
    if (!['Activity', 'Project'].includes(form.formType)) {
      console.log(`Skipping calendar event for form type: ${form.formType}`);
      return null;
    }

    // Get the correct date fields based on form type
    const startDate = form.startDate || form.eventStartDate;
    const endDate = form.endDate || form.eventEndDate || startDate;

    if (!startDate) {
      console.log('No start date found for calendar event');
      return null;
    }

    // Double-check capacity
    await checkEventCapacity(startDate, endDate, form._id);

    // Handle different form types differently
    const eventData = {
      title: form.formType === 'Project' ? form.projectTitle : form.eventTitle,
      description: form.formType === 'Project' 
        ? form.projectDescription 
        : form.objectives || "No description provided",
      location: form.formType === 'Project' 
        ? form.venue || "No venue specified"
        : form.venueAddress || "No location specified",
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : new Date(startDate),
      formId: form._id,
      formType: form.formType,
      createdBy: form.emailAddress || "system",
      organization: form.studentOrganization || null
    };

    // Validate required fields
    if (!eventData.title || !eventData.startDate) {
      console.error('Missing required fields for calendar event:', eventData);
      return null;
    }

    const calendarEvent = new CalendarEvent(eventData);
    const savedEvent = await calendarEvent.save();
    return savedEvent;
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return null;
  }
};

// Helper to update calendar event when form changes
const updateCalendarEventFromForm = async (form) => {
  try {
    // Find existing event for this form
    const existingEvent = await CalendarEvent.findOne({ formId: form._id });
    
    if (!existingEvent) {
      return await createCalendarEventFromForm(form);
    }
    if (form.eventStartDate) {
      await checkEventCapacity(
        form.eventStartDate, 
        form.eventEndDate || form.eventStartDate, 
        form._id
      );
    }
    // Update event details
    existingEvent.title = form.title || form.projectTitle || `${form.formType} Form`;
    existingEvent.description = form.description || form.projectDescription || existingEvent.description;
    existingEvent.startDate = form.eventStartDate;
    existingEvent.endDate = form.eventEndDate || form.eventStartDate;
    existingEvent.location = form.location || existingEvent.location;

    return await existingEvent.save();
  } catch (error) {
    console.error('Error updating calendar event:', error);
    return null;
  }
};

// Helper function to get required reviewers based on form type
const getRequiredReviewers = (formType) => {
  switch(formType) {
    case 'Project':
      return [
        { stepName: "Admin", reviewerRole: "Admin" },
        { stepName: "Academic Services", reviewerRole: "Academic Services" },
        { stepName: "Executive Director", reviewerRole: "Executive Director" }
      ];
    case 'LocalOffCampus':
      return [
        { stepName: "Initial Submission", reviewerRole: "Adviser" }
      ];
    case 'Activity':
    default:
      return [
        { stepName: "Adviser", reviewerRole: "Adviser" },
        { stepName: "Dean", reviewerRole: "Dean" },
        { stepName: "Admin", reviewerRole: "Admin" },
        { stepName: "Academic Services", reviewerRole: "Academic Services" },
        { stepName: "Academic Director", reviewerRole: "Academic Director" },
        { stepName: "Executive Director", reviewerRole: "Executive Director" }
      ];
  }
};

// Main controller methods
exports.getAllForms = async (req, res) => {
  try {
    const { formType } = req.query;
    const filter = formType ? { formType } : {};
    
    const forms = await Form.find(filter)
      .populate("studentOrganization")
      .populate("attachedBudget")
      .lean();

    if (!forms.length) {
      return res.status(404).json({ message: "No forms found" });
    }
    res.status(200).json(forms);
  } catch (error) {
    console.error("Error fetching forms:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
};

// Update getFormById to populate attachedBudget:
exports.getFormById = async (req, res) => {
  try {
    const form = await Form.findById(req.params.formId)
      .populate('attachedBudget')
      .populate('studentOrganization');
      
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }
    res.status(200).json(form);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createForm = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Set default application date if not provided
    if (!req.body.applicationDate) {
      req.body.applicationDate = new Date();
    }

    // Auto-populate email if user is logged in
    if (!req.body.emailAddress && req.user?.email) {
      req.body.emailAddress = req.user.email;
    }

    // Handle organization lookup
    if (req.body.studentOrganization) {
      let organization;

      if (mongoose.Types.ObjectId.isValid(req.body.studentOrganization)) {
        organization = await User.findOne({
          _id: req.body.studentOrganization,
          role: "Organization"
        }).session(session);
      }

      if (!organization) {
        organization = await User.findOne({
          organizationName: req.body.studentOrganization,
          role: "Organization"
        }).session(session);
      }

      if (!organization) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ error: "Organization not found" });
      }

      req.body.studentOrganization = organization._id;
      req.body.presidentName = organization.presidentName;
      req.body.presidentSignature = organization.presidentSignature;
      
      if (!organization.presidentSignature) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ 
          error: "Organization president signature is required" 
        });
      }
    }

    // Handle budget creation if included in request
    let budgetProposal = null;
    if (req.body.budgetData) {
      try {
        // Create budget proposal
        budgetProposal = new BudgetProposal({
          nameOfRso: req.user.organizationName || req.body.studentOrganization?.organizationName,
          eventTitle: req.body.budgetData.eventTitle || req.body.eventTitle || 'Budget Proposal',
          items: req.body.budgetData.items,
          grandTotal: req.body.budgetData.items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0),
          createdBy: req.user._id,
          organization: req.body.studentOrganization || req.user.organizationId,
          formType: 'Activity',
          isActive: true
        });

        await budgetProposal.save({ session });

        // Attach budget to form
        req.body.attachedBudget = budgetProposal._id;
        req.body.budgetAmount = budgetProposal.grandTotal;
        req.body.budgetFrom = budgetProposal.nameOfRso;
      } catch (budgetError) {
        await session.abortTransaction();
        session.endSession();
        console.error("Budget creation error:", budgetError);
        return res.status(400).json({ 
          error: "Budget creation failed",
          details: budgetError.message 
        });
      }
    } else if (req.body.attachedBudget) {
      // Handle existing budget attachment
      const validBudget = await BudgetProposal.findOne({
        _id: req.body.attachedBudget,
        organization: req.body.studentOrganization || req.user.organizationId,
        isActive: true
      }).session(session);

      if (!validBudget) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ 
          error: 'Budget proposal not found or not active for your organization' 
        });
      }

      // Update budget to link with this form
      await BudgetProposal.findByIdAndUpdate(
        validBudget._id,
        { 
          associatedForm: req.body._id, 
          formType: 'Activity' 
        },
        { session }
      );
    }

    // Form type specific validation
    switch (req.body.formType) {
      case 'Activity':
        if (!req.body.studentOrganization) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({ error: "studentOrganization is required for Activity forms" });
        }
        
        if (req.body.eventStartDate) {
          try {
            const endDate = req.body.eventEndDate || req.body.eventStartDate;
            await checkEventCapacity(req.body.eventStartDate, endDate);
          } catch (capacityError) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ error: capacityError.message });
          }
        }
        break;

      case 'Budget':
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ error: "Budget forms should be submitted through a different endpoint" });

      case 'Project':
        if (!req.body.projectTitle || !req.body.projectDescription) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({ error: "Project title and description are required" });
        }
        
        if (req.body.eventStartDate) {
          try {
            const endDate = req.body.eventEndDate || req.body.eventStartDate;
            await checkEventCapacity(req.body.eventStartDate, endDate);
          } catch (capacityError) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ error: capacityError.message });
          }
        }
        break;

      case 'LocalOffCampus':
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ error: "Local Off Campus forms should be submitted through their specific endpoints" });

      default:
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ error: "Invalid form type" });
    }

    // Create and save the form
    const form = new Form(req.body);
    await form.save({ session });

    // Create calendar event if this is an Activity/Project form with dates
    if (['Activity', 'Project'].includes(req.body.formType)) {
      try {
        await createCalendarEventFromForm(form, session);
      } catch (eventError) {
        console.error('Error creating calendar event:', eventError);
        // Not fatal - continue without calendar event
      }
    }

    // Create progress tracker for relevant form types
    let tracker = null;
    if (['Activity', 'Project', 'LocalOffCampus'].includes(req.body.formType)) {
      const requiredReviewers = getRequiredReviewers(req.body.formType);
      const trackerSteps = requiredReviewers.map(reviewer => ({
        stepName: reviewer.stepName,
        reviewerRole: reviewer.reviewerRole,
        status: "pending",
        remarks: "",
        timestamp: null
      }));

      tracker = new EventTracker({
        formId: form._id,
        formType: req.body.formType,
        currentStep: trackerSteps[0].stepName,
        currentAuthority: trackerSteps[0].reviewerRole,
        steps: trackerSteps
      });
      await tracker.save({ session });
    }

    // Create tracker for budget if it was created with this form
    if (budgetProposal) {
      const budgetTracker = new EventTracker({
        formId: budgetProposal._id,
        formType: 'Budget',
        currentStep: 'Initial Submission',
        currentAuthority: 'Adviser',
        steps: [{
          stepName: 'Initial Submission',
          reviewerRole: 'Adviser',
          status: 'pending',
          remarks: '',
          timestamp: null
        }]
      });
      await budgetTracker.save({ session });
    }

    // Send notification
    if (req.body.emailAddress) {
      await Notification.create([{
        userEmail: req.body.emailAddress,
        message: `Your ${req.body.formType} form has been submitted!`,
        read: false,
        timestamp: new Date(),
      }], { session });
    }

    await session.commitTransaction();
    session.endSession();

    const responseData = {
      form: {
        ...form.toObject(),
        presidentName: form.presidentName,
        presidentSignature: form.presidentSignature
      },
      tracker: tracker ? await EventTracker.findOne({ formId: form._id }) : null
    };

    if (budgetProposal) {
      responseData.budget = budgetProposal;
      responseData.budgetTracker = await EventTracker.findOne({ 
        formId: budgetProposal._id 
      });
    }

    res.status(201).json(responseData);

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    console.error("Form Creation Error:", error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        error: "Validation Error",
        details: errors 
      });
    }
    
    res.status(500).json({ 
      error: "Server error", 
      details: error.message 
    });
  }
};

exports.deleteForm = async (req, res) => {
  try {
    const { formId } = req.params;
    const userEmail = req.user?.email;
    const isAdmin = req.user?.role === 'Admin';

    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    const isSubmitter = form.emailAddress === userEmail;
    if (!isAdmin && !isSubmitter) {
      return res.status(403).json({ 
        message: 'Only the form submitter or admin can delete this form' 
      });
    }

    const tracker = await EventTracker.findOne({ formId });
    if (form.formType !== 'Budget' && !tracker) {
      return res.status(404).json({ message: 'Progress tracker not found' });
    }

    const restrictedStages = [
      'Dean',
      'Admin',
      'Academic Services',
      'Academic Director',
      'Executive Director'
    ];

    if (tracker) {
      const hasPassedRestrictedStage = tracker.steps.some(step => {
        return restrictedStages.includes(step.reviewerRole) && 
               (step.status === 'approved' || step.status === 'declined');
      });

      if (hasPassedRestrictedStage && !isAdmin) {
        return res.status(403).json({
          message: 'Form cannot be deleted as it has progressed beyond allowed review stages'
        });
      }
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      await Form.findByIdAndDelete(formId).session(session);

      if (tracker) {
        await EventTracker.deleteOne({ formId }).session(session);
      }

      await CalendarEvent.deleteOne({ formId }).session(session);

      await Notification.deleteMany({
        userEmail: form.emailAddress,
        message: { $regex: form.formType, $options: 'i' }
      }).session(session);

      await session.commitTransaction();
      session.endSession();

      res.status(200).json({ 
        message: 'Form and all associated data deleted successfully',
        deletedFormId: formId
      });

    } catch (transactionError) {
      await session.abortTransaction();
      session.endSession();
      throw transactionError;
    }

  } catch (error) {
    console.error("Form Deletion Error:", error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        error: "Invalid form ID format" 
      });
    }
    
    res.status(500).json({ 
      error: "Server error during form deletion", 
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.updateForm = async (req, res) => {
  try {
    const { formId } = req.params;
    const updates = req.body;

    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    if (form.emailAddress !== req.user.email) {
      return res.status(403).json({ 
        message: 'Only the original submitter can edit this form' 
      });
    }

    // Skip budget-specific validation since budget forms will be handled separately
    if (form.formType === 'Activity' || form.formType === 'Project') {
      if (updates.eventStartDate) {
        const endDate = updates.eventEndDate || form.eventEndDate || updates.eventStartDate;
        await checkEventCapacity(updates.eventStartDate, endDate, formId);
      }
    }

    const tracker = await EventTracker.findOne({ formId });
    if (form.formType !== 'Budget' && !tracker) {
      return res.status(404).json({ message: 'Progress tracker not found' });
    }

    if (form.formType === 'Project' && tracker) {
      const isUnderReview = tracker.steps.some(
        step => step.status === 'approved' || step.status === 'declined'
      );
      
      if (isUnderReview) {
        return res.status(403).json({ 
          message: 'Project form cannot be edited once review has started' 
        });
      }
    } else if (tracker) {
      const isDeanReviewing = tracker.currentAuthority === 'Dean';
      const isDeanApproved = tracker.steps.some(
        step => step.stepName === 'Dean' && step.status === 'approved'
      );

      if (isDeanReviewing || isDeanApproved) {
        return res.status(403).json({ 
          message: 'Form cannot be edited once it reaches the Dean for review/approval' 
        });
      }
    }

    const updateOptions = {
      new: true,
      runValidators: true
    };

    const updatedForm = await Form.findByIdAndUpdate(
      formId,
      { 
        ...updates,
        lastEdited: new Date()
      },
      updateOptions
    );

    // Reset tracker if exists
    if (tracker) {
      const firstStep = tracker.steps[0];
      if (tracker.currentStep !== firstStep.stepName) {
        await EventTracker.updateOne(
          { formId },
          { 
            $set: { 
              currentStep: firstStep.stepName,
              currentAuthority: firstStep.reviewerRole,
              "steps.$[].status": "pending",
              "steps.$[].remarks": "",
              "steps.$[].timestamp": null
            } 
          }
        );
        await EventTracker.updateOne(
          { formId, "steps.stepName": firstStep.stepName },
          { $set: { "steps.$.status": "pending" } }
        );
      }
    }

    if (['Activity', 'Project'].includes(form.formType) && updates.eventStartDate) {
      await updateCalendarEventFromForm(updatedForm);
    }

    if (form.emailAddress) {
      await Notification.create({
        userEmail: form.emailAddress,
        message: `Your ${form.formType} form has been updated!`,
        read: false,
        timestamp: new Date(),
      });
    }

    res.status(200).json({
      message: 'Form updated successfully',
      form: updatedForm,
      tracker: form.formType !== 'Budget' ? await EventTracker.findOne({ formId }) : null
    });

  } catch (error) {
    console.error("Form Update Error:", error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        error: "Validation Error",
        details: errors 
      });
    }
    
    res.status(500).json({ 
      error: "Server error", 
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.submitLocalOffCampusBefore = async (req, res) => {
  try {
    const { localOffCampus } = req.body;
    
    if (!localOffCampus) {
      return res.status(400).json({ error: "Form data is required" });
    }
    
    const { nameOfHei, region, address, basicInformation, activitiesOffCampus } = localOffCampus;
    
    if (!nameOfHei?.trim()) {
      return res.status(400).json({ error: "Name of HEI is required" });
    }
    
    if (!region?.trim()) {
      return res.status(400).json({ error: "Region is required" });
    }
    
    if (!address?.trim()) {
      return res.status(400).json({ error: "Address is required" });
    }
    
    if (!Array.isArray(basicInformation) || basicInformation.length === 0) {
      return res.status(400).json({ error: "At least one basic information entry is required" });
    }
    
    if (!Array.isArray(activitiesOffCampus) || activitiesOffCampus.length === 0) {
      return res.status(400).json({ error: "Activities off campus information is required" });
    }

    const newForm = new Form({
      formType: "LocalOffCampus",
      localOffCampus: {
        formPhase: "BEFORE",
        nameOfHei,
        region,
        address,
        basicInformation,
        activitiesOffCampus,
        submittedBy: req.user._id,
        status: "submitted"
      }
    });

    const savedForm = await newForm.save();
    
    const tracker = new EventTracker({
      formId: savedForm._id,
      formType: "LocalOffCampus",
      currentStep: "Initial Submission",
      currentAuthority: "Adviser",
      steps: [
        {
          stepName: "Initial Submission",
          reviewerRole: "Adviser",
          status: "pending",
          remarks: "",
          timestamp: null
        }
      ]
    });
    await tracker.save();

    res.status(201).json({
      success: true,
      message: "BEFORE form submitted successfully",
      form: savedForm,
      eventId: savedForm._id
    });
  } catch (error) {
    console.error("Error submitting BEFORE form:", error);
    res.status(500).json({
      success: false,
      message: "Error submitting BEFORE form",
      error: error.message
    });
  }
};

exports.submitLocalOffCampusAfter = async (req, res) => {
  try {
    const { localOffCampus } = req.body;
    
    if (!localOffCampus) {
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
      return res.status(400).json({ 
        error: "Validation failed",
        details: errors 
      });
    }

    const newForm = new Form({
      formType: "LocalOffCampus",
      localOffCampus: {
        formPhase: "BEFORE",
        nameOfHei,
        region,
        address,
        basicInformation,
        activitiesOffCampus,
        submittedBy: req.user._id,
        status: "submitted",
        afterActivity: [],
        problemsEncountered: null,
        recommendation: null
      }
    });

    const savedForm = await newForm.save();
    
    await EventTracker.updateOne(
      { formId: beforeForm._id },
      { 
        $set: { 
          currentStep: "After Report Submitted",
          "steps.$[elem].status": "completed",
          "steps.$[elem].timestamp": new Date()
        }
      },
      { arrayFilters: [{ "elem.stepName": "Initial Submission" }] }
    );

    res.status(201).json({
      success: true,
      message: "AFTER form submitted successfully",
      form: savedForm
    });
  } catch (error) {
    console.error("Error submitting AFTER form:", error);
    res.status(500).json({
      success: false,
      message: "Error submitting AFTER form",
      error: error.message
    });
  }
};

exports.getLocalOffCampusForm = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const beforeForm = await Form.findById(eventId);
    if (!beforeForm || beforeForm.formType !== "LocalOffCampus") {
      return res.status(404).json({ error: "Form not found" });
    }
    
    const afterForm = await Form.findOne({ 
      "localOffCampus.eventId": eventId 
    });
    
    const responseData = {
      before: beforeForm,
      after: afterForm || null,
      tracker: await EventTracker.findOne({ formId: eventId })
    };
    
    res.status(200).json({
      success: true,
      data: responseData
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


// === BUDGET PROPOSAL FUNCTIONS ===

// Budget Proposal Controller Methods
exports.createBudgetProposal = async (req, res) => {
  try {
    const { items, eventTitle, targetFormType, targetFormId } = req.body;
    
    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'At least one budget item is required' });
    }

    // Calculate grand total
    const grandTotal = items.reduce((sum, item) => {
      return sum + (item.quantity * item.unitCost);
    }, 0);

    // Create new budget proposal
    const newBudget = new BudgetProposal({
      nameOfRso: req.user.organizationName,
      eventTitle: eventTitle || 'Budget Proposal',
      items,
      grandTotal,
      createdBy: req.user._id,
      organization: req.user.organizationId,
      associatedForm: targetFormId || null,
      formType: targetFormType || null
    });

    await newBudget.save();

    // If this is linked to an existing form, update the form
    if (targetFormId) {
      await Form.findByIdAndUpdate(targetFormId, {
        $set: {
          attachedBudget: newBudget._id,
          budgetAmount: grandTotal,
          budgetFrom: req.user.organizationName
        }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Budget proposal created successfully',
      budget: newBudget,
      returnPath: req.body.returnPath // Pass through for frontend redirection
    });

  } catch (error) {
    console.error('Error creating budget proposal:', error);
    res.status(500).json({ 
      error: 'Failed to create budget proposal',
      details: error.message 
    });
  }
};

exports.updateBudgetProposal = async (req, res) => {
  try {
    const { budgetId } = req.params;
    const { items, eventTitle } = req.body;

    // Find existing budget
    const budget = await BudgetProposal.findById(budgetId);
    if (!budget) {
      return res.status(404).json({ error: 'Budget proposal not found' });
    }

    // Verify ownership
    if (budget.organization.toString() !== req.user.organizationId.toString()) {
      return res.status(403).json({ error: 'Unauthorized to update this budget' });
    }

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'At least one budget item is required' });
    }

    // Calculate new grand total
    const grandTotal = items.reduce((sum, item) => {
      return sum + (item.quantity * item.unitCost);
    }, 0);

    // Update budget
    budget.items = items;
    budget.grandTotal = grandTotal;
    budget.eventTitle = eventTitle || budget.eventTitle;
    budget.updatedAt = new Date();

    await budget.save();

    // Update any linked forms
    if (budget.associatedForm) {
      await Form.findByIdAndUpdate(budget.associatedForm, {
        $set: {
          budgetAmount: grandTotal
        }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Budget proposal updated successfully',
      budget
    });

  } catch (error) {
    console.error('Error updating budget proposal:', error);
    res.status(500).json({ 
      error: 'Failed to update budget proposal',
      details: error.message 
    });
  }
};

// Get budget proposals for dropdown
exports.getBudgetProposals = async (req, res) => {
  try {
      const budgets = await BudgetProposal.find({
          organization: req.user.organizationId,
          status: 'submitted'
      }).select('_id nameOfRso eventTitle grandTotal createdAt');
      
      res.json(budgets);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
};

// In createForm, add budget validation:
if (req.body.attachedBudget) {
  const validBudget = await BudgetProposal.findOne({
      _id: req.body.attachedBudget,
      organization: req.body.studentOrganization
  });
  
  if (!validBudget) {
      return res.status(400).json({ 
          error: 'Budget proposal not found or organization mismatch' 
      });
  }
  
  // Auto-populate budget-related fields
  if (req.body.formType === 'Activity') {
      req.body.budgetAmount = validBudget.grandTotal;
      req.body.budgetFrom = validBudget.nameOfRso;
  }
}