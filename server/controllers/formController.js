const Form = require('../models/Form');
const User = require('../models/User');
const Notification = require("../models/Notification");
const EventTracker = require("../models/EventTracker");
const mongoose = require("mongoose");
const CalendarEvent = require("../models/CalendarEvent");

//HELPERS
// Helper to create calendar event from form data
const createCalendarEventFromForm = async (form) => {
  try {
    // Only create events for Activity and Project forms with dates
    if (!['Activity', 'Project'].includes(form.formType) || !form.eventStartDate) {
      return null;
    }

    const eventData = {
      title: form.title || form.projectTitle || `${form.formType} Form`,
      description: form.description || form.projectDescription || 'No description provided',
      startDate: form.eventStartDate,
      endDate: form.eventEndDate || form.eventStartDate,
      location: form.location || 'TBA',
      formId: form._id,
      formType: form.formType,
      createdBy: form.emailAddress || 'system',
      organization: form.studentOrganization || null
    };

    const calendarEvent = new CalendarEvent(eventData);
    return await calendarEvent.save();
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

    // Form type specific validation
    switch (req.body.formType) {
      case 'Activity':
        if (!req.body.studentOrganization) {
          return res.status(400).json({ error: "studentOrganization is required for Activity forms" });
        }
        
        const organization = await User.findOne({
          organizationName: req.body.studentOrganization,
          role: "Organization",
        });
        
        if (!organization) {
          return res.status(400).json({ error: "Organization not found" });
        }
        req.body.studentOrganization = organization._id;
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
        // Add any Project-specific validation here
        if (!req.body.projectTitle || !req.body.projectDescription) {
          return res.status(400).json({ error: "Project title and description are required" });
        }
        break;

      default:
        return res.status(400).json({ error: "Invalid form type" });
    }

    // Create and save the form
    const form = new Form(req.body);
    await form.save();

        // Create calendar event if this is an Activity/Project form with dates
        if (['Activity', 'Project'].includes(req.body.formType) && req.body.eventStartDate) {
          await createCalendarEventFromForm(form);
        }

    // Get the appropriate reviewers based on form type
    const requiredReviewers = getRequiredReviewers(req.body.formType);
    
    // Create progress tracker with form-specific reviewers
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

    res.status(201).json({ form, tracker });

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