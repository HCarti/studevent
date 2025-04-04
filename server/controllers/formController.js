const Form = require('../models/Form');
const User = require('../models/User');
const Notification = require("../models/Notification");
const EventTracker = require("../models/EventTracker");
const mongoose = require("mongoose");
const CalendarEvent = require("../models/CalendarEvent"); // Add this line

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
        
        // Validate event dates for Activity forms
        if (!req.body.eventStartDate || !req.body.eventEndDate) {
          return res.status(400).json({ error: "Event start and end dates are required for Activity forms" });
        }
        break;

      case 'Budget':
        // Budget forms don't need event dates
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
        // Validate event dates for Project forms
        if (!req.body.eventStartDate || !req.body.eventEndDate) {
          return res.status(400).json({ error: "Event start and end dates are required for Project forms" });
        }
        
        if (!req.body.projectTitle || !req.body.projectDescription) {
          return res.status(400).json({ error: "Project title and description are required" });
        }
        break;

      default:
        return res.status(400).json({ error: "Invalid form type" });
    }

    // Validate event dates if they exist
    if (req.body.eventStartDate && req.body.eventEndDate) {
      const startDate = new Date(req.body.eventStartDate);
      const endDate = new Date(req.body.eventEndDate);
      
      if (startDate > endDate) {
        return res.status(400).json({ error: "Event end date must be after start date" });
      }
      
      if (endDate < new Date()) {
        return res.status(400).json({ error: "Event cannot end in the past" });
      }
    }

    // Create and save the form
    const form = new Form(req.body);
    await form.save();

    // Create calendar event for Activity and Project forms
    if (['Activity', 'Project'].includes(req.body.formType)) {
      const event = new CalendarEvent({
        title: req.body.formType === 'Project' ? req.body.projectTitle : req.body.title,
        description: req.body.formType === 'Project' ? req.body.projectDescription : req.body.description,
        location: req.body.location || 'TBA',
        eventStartDate: req.body.eventStartDate,
        eventEndDate: req.body.eventEndDate,
        formId: form._id,
        formType: req.body.formType,
        createdBy: req.user?._id || null,
        status: 'pending' // Will follow form approval status
      });
      
      await event.save();
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

    // 4. Check if event dates are being updated
    let shouldUpdateEvent = false;
    let eventUpdate = {};
    
    if (['Activity', 'Project'].includes(form.formType)) {
      if (updates.eventStartDate || updates.eventEndDate) {
        shouldUpdateEvent = true;
        
        // Validate new dates
        const newStartDate = updates.eventStartDate ? new Date(updates.eventStartDate) : new Date(form.eventStartDate);
        const newEndDate = updates.eventEndDate ? new Date(updates.eventEndDate) : new Date(form.eventEndDate);
        
        if (newStartDate > newEndDate) {
          return res.status(400).json({ error: "Event end date must be after start date" });
        }
        
        if (newEndDate < new Date()) {
          return res.status(400).json({ error: "Event cannot end in the past" });
        }
        
        eventUpdate = {
          eventStartDate: newStartDate,
          eventEndDate: newEndDate
        };
        
        if (form.formType === 'Project' && updates.projectTitle) {
          eventUpdate.title = updates.projectTitle;
        } else if (updates.title) {
          eventUpdate.title = updates.title;
        }
        
        if (updates.description || updates.projectDescription) {
          eventUpdate.description = updates.description || updates.projectDescription;
        }
        
        if (updates.location) {
          eventUpdate.location = updates.location;
        }
      }
    }

    // 5. Perform the form update
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

    // 6. Update the associated event if needed
    if (shouldUpdateEvent) {
      await Event.findOneAndUpdate(
        { formId },
        eventUpdate,
        { new: true, runValidators: true }
      );
    }

    // 7. Reset tracker to first step if needed
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

    // 8. Send notification
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

// Add this new endpoint to get events
exports.getFormEvents = async (req, res) => {
  try {
    const events = await Event.find({
      status: 'approved',
      eventEndDate: { $gte: new Date() } // Only future events
    }).sort({ eventStartDate: 1 });

    res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching form events:", error);
    res.status(500).json({ 
      error: "Server error", 
      details: error.message 
    });
  }
};