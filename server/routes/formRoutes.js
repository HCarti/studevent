const express = require('express');
const router = express.Router();
const Form = require('../models/Form');
const multer = require('multer');
const formController = require('../controllers/formController');
const BudgetProposal = require("../models/BudgetProposal");

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 5 // Allow multiple files (attachments + signatures)
  }
});

// ======================
// GENERAL FORM ROUTES
// ======================
router.get("/by-email/:email", async (req, res) => {
  try {
    const email = req.params.email;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    console.log("🔍 Searching forms for email:", email);

    // Case-insensitive search
    const forms = await Form.find({
      emailAddress: { $regex: new RegExp(`^${email}$`, "i") },
    }).populate('studentOrganization', 'organizationName presidentName presidentSignature');

    if (forms.length === 0) {
      return res.status(404).json({ message: "No forms found for this email" });
    }

    res.status(200).json(forms);
  } catch (error) {
    console.error("🔥 Error fetching forms by email:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.delete('/:formId', formController.deleteForm);
router.get('/all', formController.getAllForms);
router.get('/:formId', formController.getFormById);
router.put('/:formId', formController.updateForm);

// ======================
// FORM SUBMISSION ROUTES
// ======================
router.post('/submit', 
  upload.none(), // Explicitly disable file uploads for this route
  async (req, res) => {
    try {
      const newForm = new Form(req.body);
      const savedForm = await newForm.save();
      res.status(201).json({ 
        message: 'Form submitted successfully', 
        id: savedForm._id
      });
    } catch (error) {
      if (error.name === 'ValidationError') {
        return res.status(400).json({ error: 'Validation Error', details: error.message });
      }
      console.error('Error saving form:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

// // New route for creating form with budget
// router.post('/with-budget',
//   upload.fields([
//     { name: 'attachments', maxCount: 4 },
//     { name: 'additionalSignatures', maxCount: 1 }
//   ]),
//   formController.createFormWithBudget
// );

// ======================
// LOCAL OFF-CAMPUS ROUTES
// ======================
router.post('/local-off-campus/before', formController.submitLocalOffCampusBefore);
router.post('/local-off-campus/after', formController.submitLocalOffCampusAfter);
router.get('/local-off-campus/:eventId', formController.getLocalOffCampusForm);

// ======================
// BUDGET PROPOSAL ROUTES
// ======================
router.post('/budget-proposals', formController.createBudgetProposal);
router.put('/budget-proposals/:budgetId', formController.updateBudgetProposal);
// Add these new routes to your formRoutes.js
router.get('/budget-proposals', async (req, res) => {
  console.log('Entering budget-proposals route'); // Debug log
  try {
    // Explicitly check if this is a budget-proposals request
    if (req.path.includes('budget-proposals')) {
      const user = req.user;
      
      let query = {};
      if (user.role === 'Organization') {
        query = { 
          organization: user._id,
          status: { $in: ['submitted', 'approved'] }
        };
      } else if (user.role === 'Admin') {
        query = { 
          status: { $in: ['submitted', 'approved'] }
        };
      } else {
        query = { 
          createdBy: user._id,
          status: { $in: ['submitted', 'approved'] }
        };
      }

      const budgets = await BudgetProposal.find(query)
        .select('_id nameOfRso eventTitle grandTotal status createdAt')
        .sort({ createdAt: -1 })
        .lean();

      return res.json(budgets);
    }
    
    // If it's not a budget-proposals request, continue with normal flow
    next();
  } catch (error) {
    console.error('Full error stack:', error.stack); // This will show where exactly the error occurs
    res.status(500).json({ 
      error: 'Failed to fetch budget proposals',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});


router.get('/budget-proposals/:id', async (req, res) => {
  try {
    const budget = await BudgetProposal.findOne({
      _id: req.params.id,
      $or: [
        { organization: req.user.organizationId || req.user._id },
        { createdBy: req.user._id }
      ]
    });

    if (!budget) {
      return res.status(404).json({ error: 'Budget proposal not found' });
    }

    res.json(budget);
  } catch (error) {
    console.error('Error fetching budget proposal:', error);
    res.status(500).json({ 
      error: 'Failed to fetch budget proposal',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get form with budget options
// router.get('/:formId/with-budgets', formController.getFormWithBudgetOptions);


module.exports = router;