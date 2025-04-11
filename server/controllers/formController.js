const Form = require('../models/Form');
const User = require('../models/User');
const Notification = require("../models/Notification");
const EventTracker = require("../models/EventTracker");
const mongoose = require("mongoose");
const CalendarEvent = require("../models/CalendarEvent");
const moment = require('moment');

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
    // Detailed logging of incoming form data
    console.log('Creating calendar event from form:', {
      formType: form.formType,
      formId: form._id,
      allFormFields: Object.keys(form).filter(key => key !== '_id'), // Log all fields except _id
      relevantFields: {
        title: form.eventTitle || form.projectTitle,
        description: form.description || form.projectDescription,
        location: form.location || form.venue,
        startDate: form.startDate || form.eventStartDate,
        endDate: form.endDate || form.eventEndDate
      }
    });

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
      console.error('Missing required fields for calendar event:', {
        hasTitle: !!eventData.title,
        hasStartDate: !!eventData.startDate,
        eventData
      });
      return null;
    }

    console.log('Attempting to create calendar event with:', eventData);
    const calendarEvent = new CalendarEvent(eventData);
    const savedEvent = await calendarEvent.save();
    console.log('Successfully created calendar event:', savedEvent);
    
    return savedEvent;
  } catch (error) {
    console.error('Error creating calendar event:', {
      error: error.message,
      stack: error.stack,
      formId: form._id,
      formType: form.formType,
      formData: form // Log entire form for debugging
    });
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
  if (formType === 'Project') {
    return [
      { stepName: "Admin", reviewerRole: "Admin" },
      { stepName: "Academic Services", reviewerRole: "Academic Services" },
      { stepName: "Executive Director", reviewerRole: "Executive Director" }
    ];
  }
  // Default reviewers for Activity/Budget forms
  return [
    { stepName: "Adviser", reviewerRole: "Adviser" },
    { stepName: "Dean", reviewerRole: "Dean" },
    { stepName: "Admin", reviewerRole: "Admin" },
    { stepName: "Academic Services", reviewerRole: "Academic Services" },
    { stepName: "Academic Director", reviewerRole: "Academic Director" },
    { stepName: "Executive Director", reviewerRole: "Executive Director" }
  ];
};

exports.getAllForms = async (req, res) => {
  try {
    const { formType } = req.query;
    const filter = formType ? { formType } : {};
    
    const forms = await Form.find(filter)
      .populate("studentOrganization")
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

exports.getFormById = async (req, res) => {
  try {
    const form = await Form.findById(req.params.formId);
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }
    res.status(200).json(form);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createForm = async (req, res) => {
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

      // First try to find by ID if the value is a valid ObjectId
      if (mongoose.Types.ObjectId.isValid(req.body.studentOrganization)) {
        organization = await User.findOne({
          _id: req.body.studentOrganization,
          role: "Organization"
        });
      }

      // If not found by ID or not an ID, try by name
      if (!organization) {
        organization = await User.findOne({
          organizationName: req.body.studentOrganization,
          role: "Organization"
        });
      }

      if (!organization) {
        return res.status(400).json({ error: "Organization not found" });
      }

      // Always use the organization's _id
      req.body.studentOrganization = organization._id;
      req.body.presidentName = organization.presidentName;
      req.body.presidentSignature = organization.presidentSignature;
      
      if (!organization.presidentSignature) {
        return res.status(400).json({ 
          error: "Organization president signature is required" 
        });
      }
    }

    // Form type specific validation
    switch (req.body.formType) {
      case 'Activity':
        if (!req.body.studentOrganization) {
          return res.status(400).json({ error: "studentOrganization is required for Activity forms" });
        }
        
        // Event capacity validation
        if (req.body.eventStartDate) {
          const endDate = req.body.eventEndDate || req.body.eventStartDate;
          await checkEventCapacity(req.body.eventStartDate, endDate);
        }
        break;

      case 'Budget':
        if (!req.body.nameOfRso) {
          return res.status(400).json({ error: "nameOfRso is required for Budget forms" });
        }

        if (!req.body.items || !Array.isArray(req.body.items) || req.body.items.length === 0) {
          return res.status(400).json({ error: "At least one budget item is required" });
        }

        const calculatedTotal = req.body.items.reduce((sum, item) => {
          return sum + (parseFloat(item.totalCost) || 0);
        }, 0);
        
        if (Math.abs(calculatedTotal - parseFloat(req.body.grandTotal || 0)) > 0.01) {
          return res.status(400).json({ 
            error: "Grand total calculation mismatch",
            details: `Calculated: ${calculatedTotal}, Submitted: ${req.body.grandTotal}`
          });
        }
        break;

      case 'Project':
        if (!req.body.projectTitle || !req.body.projectDescription) {
          return res.status(400).json({ error: "Project title and description are required" });
        }
        
        // Event capacity validation
        if (req.body.eventStartDate) {
          const endDate = req.body.eventEndDate || req.body.eventStartDate;
          await checkEventCapacity(req.body.eventStartDate, endDate);
        }
        break;

      default:
        return res.status(400).json({ error: "Invalid form type" });
    }

    // Create and save the form
    const form = new Form(req.body);
    await form.save();

    // Create calendar event if this is an Activity/Project form with dates
    if (['Activity', 'Project'].includes(req.body.formType)) {
      try {
        const calendarEvent = await createCalendarEventFromForm(form);
        if (!calendarEvent) {
          console.error('Calendar event creation failed for form:', form._id);
        }
      } catch (eventError) {
        console.error('Error creating calendar event:', eventError);
      }
    }

    // Create progress tracker
    const requiredReviewers = getRequiredReviewers(req.body.formType);
    const trackerSteps = requiredReviewers.map(reviewer => ({
      stepName: reviewer.stepName,
      reviewerRole: reviewer.reviewerRole,
      status: "pending",
      remarks: "",
      timestamp: null
    }));

    const tracker = new EventTracker({
      formId: form._id,
      formType: req.body.formType,
      currentStep: trackerSteps[0].stepName,
      currentAuthority: trackerSteps[0].reviewerRole,
      steps: trackerSteps
    });
    await tracker.save();

    // Send notification
    if (req.body.emailAddress) {
      await Notification.create({
        userEmail: req.body.emailAddress,
        message: `Your ${req.body.formType} form has been submitted!`,
        read: false,
        timestamp: new Date(),
      });
    }

    res.status(201).json({ 
      form: {
        ...form.toObject(),
        presidentName: form.presidentName,
        presidentSignature: form.presidentSignature
      }, 
      tracker 
    });

  } catch (error) {
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

// Add this to your formController.js

exports.deleteForm = async (req, res) => {
  try {
    const { formId } = req.params;
    const userEmail = req.user?.email;

    // 1. Validate the form exists and belongs to the user
    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    // Check if the current user is the submitter or an admin
    const isAdmin = req.user?.role === 'Admin';
    const isSubmitter = form.emailAddress === userEmail;
    
    if (!isAdmin && !isSubmitter) {
      return res.status(403).json({ 
        message: 'Only the form submitter or admin can delete this form' 
      });
    }

    // 2. Check if the form can be deleted (only pending forms can be deleted)
    const tracker = await EventTracker.findOne({ formId });
    if (!tracker) {
      return res.status(404).json({ message: 'Progress tracker not found' });
    }

    // For non-admins, check if the form is still in editable state
    if (!isAdmin) {
      const isEditable = () => {
        if (!tracker.reviewStages || tracker.currentStep === undefined) return false;
        const deanStepIndex = tracker.reviewStages.findIndex(step => step.role === 'Dean');
        return deanStepIndex === -1 || tracker.currentStep < deanStepIndex;
      };

      if (!isEditable()) {
        return res.status(403).json({ 
          message: 'Form cannot be deleted as it has already progressed in the review process' 
        });
      }
    }

    // 3. Start a transaction to ensure all deletions succeed or fail together
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Delete the form
      await Form.findByIdAndDelete(formId).session(session);

      // Delete the associated tracker
      await EventTracker.deleteOne({ formId }).session(session);

      // Delete associated calendar event if exists
      await CalendarEvent.deleteOne({ formId }).session(session);

      // Delete any associated notifications
      await Notification.deleteMany({ 
        userEmail: form.emailAddress,
        message: { $regex: form.formType, $options: 'i' } 
      }).session(session);

      // Commit the transaction
      await session.commitTransaction();
      session.endSession();

      res.status(200).json({ 
        message: 'Form and all associated data deleted successfully',
        deletedFormId: formId
      });

    } catch (transactionError) {
      // If any error occurs, abort the transaction
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

    // 1. Find the form and its tracker
    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    if (form.emailAddress !== req.user.email) {
      return res.status(403).json({ 
        message: 'Only the original submitter can edit this form' 
      });
    }

    // 2. Form type specific validation
    if (form.formType === 'Budget' || updates.formType === 'Budget') {
      if (!updates.items || !Array.isArray(updates.items)) {
        return res.status(400).json({ error: "Valid items array is required for Budget forms" });
      }
      if (form.formType === 'Activity' || form.formType === 'Project') {
        // Check event capacity if dates are being updated
        if (updates.eventStartDate) {
          const endDate = updates.eventEndDate || form.eventEndDate || updates.eventStartDate;
          await checkEventCapacity(updates.eventStartDate, endDate, formId);
        }
      }

      const itemErrors = [];
      updates.items.forEach((item, index) => {
        if (item.quantity === undefined || isNaN(item.quantity)) {
          itemErrors.push(`items.${index}.quantity: Required number`);
        }
        if (item.unitCost === undefined || isNaN(item.unitCost)) {
          itemErrors.push(`items.${index}.unitCost: Required number`);
        }
      });

      if (itemErrors.length > 0) {
        return res.status(400).json({
          error: "Budget Item Validation Error",
          details: itemErrors
        });
      }
    }

    const tracker = await EventTracker.findOne({ formId });
    if (!tracker) {
      return res.status(404).json({ message: 'Progress tracker not found' });
    }

    // 3. For Project forms, check if editing is allowed (not reviewed by Admin yet)
    if (form.formType === 'Project') {
      const isUnderReview = tracker.steps.some(
        step => step.status === 'approved' || step.status === 'declined'
      );
      
      if (isUnderReview) {
        return res.status(403).json({ 
          message: 'Project form cannot be edited once review has started' 
        });
      }
    }
    // For Activity/Budget forms, check Dean review status
    else {
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

    // 4. Perform the update
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

    // 5. Reset tracker to first step if needed
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

        // Update calendar event if this is an Activity/Project form with dates
        if (['Activity', 'Project'].includes(form.formType) && updates.eventStartDate) {
          await updateCalendarEventFromForm(updatedForm);
        }

    // 6. Send notification
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
      tracker: await EventTracker.findOne({ formId })
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