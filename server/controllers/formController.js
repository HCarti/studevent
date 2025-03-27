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
    if (req.body.formType === 'EventApproval' && req.body.studentOrganization) {
      const organization = await User.findOne({
        organizationName: req.body.studentOrganization,
        role: "Organization",
      });
      if (!organization) {
        return res.status(400).json({ error: "Organization not found" });
      }
      req.body.studentOrganization = organization._id;
    }else {
      return res.status(400).json({ error: "studentOrganization is required for EventApproval forms" });
    }
    // ... rest of your code
  

    // Budget form validation
    if (req.body.formType === 'Budget') {
      // Verify items array exists and has at least one item
      if (!req.body.items || !Array.isArray(req.body.items) || req.body.items.length === 0) {
        return res.status(400).json({ error: "At least one budget item is required" });
      }

      // Verify grandTotal matches sum of item totals
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
