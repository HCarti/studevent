// controllers/formController.js
const Form = require('../models/Form');
const User = require('../models/User');
// const ProjectProposalForm = require('../models/projectProposalForm'); // Import your new schema
const Notification = require("../models/Notification"); // Import the Notification model
const EventTracker = require("../models/EventTracker"); // ✅ Check this path
const mongoose = require("mongoose");

// Controller to get all submitted forms
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


// Add a new form (when the user submits)

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

    // Event Approval specific logic
    if (req.body.formType === 'Activity') {
      // Activity form validation
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
    } 
    else if (req.body.formType === 'Budget') {
      // Budget form validation
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
    }
    else {
      return res.status(400).json({ error: "Invalid form type" });
    }

    // Create and save the form
    const form = new Form(req.body);
    await form.save();

    console.log("✅ Form Created:", form);

    // Create progress tracker (works for both form types)
    const tracker = new EventTracker({
      formId: form._id,
      currentStep: "Adviser",
      currentAuthority: "Adviser",
      steps: [
        { stepName: "Adviser", reviewerRole: "Adviser", status: "pending", remarks: "", timestamp: null },
        { stepName: "Dean", reviewerRole: "Dean", status: "pending", remarks: "", timestamp: null },
        { stepName: "Admin", reviewerRole: "Admin", status: "pending", remarks: "", timestamp: null },
        { stepName: "Academic Services", reviewerRole: "Academic Services", status: "pending", remarks: "", timestamp: null },
        { stepName: "Academic Director", reviewerRole: "Academic Director", status: "pending", remarks: "", timestamp: null },
        { stepName: "Executive Director", reviewerRole: "Executive Director", status: "pending", remarks: "", timestamp: null },
      ]
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
    console.error("❌ Form Creation Error:", error);
    
    // Handle validation errors more gracefully
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

// Add this after your createForm controller
exports.updateForm = async (req, res) => {
  try {
    const { formId } = req.params;
    
    // 1. Handle both flat and nested payload structures
    const formUpdates = req.body.formData || req.body;
    const formType = req.body.formType; // formType must be at root level

    // 2. Validate formType exists
    if (!formType) {
      return res.status(400).json({ 
        error: "Validation Error",
        details: ["formType is required"]
      });
    }

    // 3. Find the existing form
    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    // 4. Authorization check
    if (form.emailAddress !== req.user.email) {
      return res.status(403).json({ 
        message: 'Only the original submitter can edit this form' 
      });
    }

    // 5. Form-specific validation
    if (formType === 'Budget') {
      if (!formUpdates.nameOfRso) {
        return res.status(400).json({ error: "nameOfRso is required for Budget forms" });
      }
    
      if (!formUpdates.items || !Array.isArray(formUpdates.items) || formUpdates.items.length === 0) {
        return res.status(400).json({ error: "At least one budget item is required" });
      }
    
      const calculatedTotal = formUpdates.items.reduce((sum, item) => {
        return sum + (parseFloat(item.totalCost) || 0);
      }, 0);
      
      if (Math.abs(calculatedTotal - parseFloat(formUpdates.grandTotal || 0)) > 0.01) {
        return res.status(400).json({ 
          error: "Grand total calculation mismatch",
          details: `Calculated: ${calculatedTotal}, Submitted: ${formUpdates.grandTotal}`
        });
      }
      
      // Ensure no organization fields are included
      delete formUpdates.studentOrganization;
    } 
    else if (formType === 'Activity') {
      if (!formUpdates.studentOrganization) {
        return res.status(400).json({ error: "studentOrganization is required for Activity forms" });
      }
      
      const organization = await User.findOne({
        organizationName: formUpdates.studentOrganization,
        role: "Organization",
      });
      
      if (!organization) {
        return res.status(400).json({ error: "Organization not found" });
      }
      formUpdates.studentOrganization = organization._id;
    }

    // 6. Check tracker status
    const tracker = await EventTracker.findOne({ formId });
    if (!tracker) {
      return res.status(404).json({ message: 'Progress tracker not found' });
    }

    const isDeanReviewing = tracker.currentAuthority === 'Dean';
    const isDeanApproved = tracker.steps.some(
      step => step.stepName === 'Dean' && step.status === 'approved'
    );

    if (isDeanReviewing || isDeanApproved) {
      return res.status(403).json({ 
        message: 'Form cannot be edited once it reaches the Dean for review/approval' 
      });
    }

    // 7. Prepare update data
    const updateData = {
      ...formUpdates,
      formType, // Ensure formType is preserved
      lastEdited: new Date()
    };

    // 8. Perform the update
    const updatedForm = await Form.findByIdAndUpdate(
      formId,
      updateData,
      { new: true, runValidators: true }
    );

    // 9. Update tracker if needed
    if (tracker.currentStep !== 'Adviser') {
      await EventTracker.updateOne(
        { formId },
        { 
          $set: { 
            currentStep: 'Adviser', 
            currentAuthority: 'Adviser',
            "steps.$[].status": "pending",
            "steps.$[].remarks": "",
            "steps.$[].timestamp": null
          } 
        }
      );
      await EventTracker.updateOne(
        { formId, "steps.stepName": "Adviser" },
        { $set: { "steps.$.status": "pending" } }
      );
    }

    // 10. Send notification
    if (form.emailAddress) {
      await Notification.create({
        userEmail: form.emailAddress,
        message: `Your ${formType} form has been updated!`,
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
    console.error("Form Update Error:", {
      error: error.message,
      stack: error.stack,
      body: req.body,
      params: req.params
    });
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        error: "Validation Error",
        details: errors 
      });
    }
    
    res.status(500).json({ 
      error: "Server error", 
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};