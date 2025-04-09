const express = require('express');
const router = express.Router();
const Form = require('../models/Form');
const multer = require('multer');
const formController = require('../controllers/formController');

// Configure multer for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
      files: 5 // Allow multiple files (attachments + signatures)
    }
  });

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

// Add this route for calendar events
// router.get('/forms/events', formController.getFormEvents);

router.get('/all', formController.getAllForms); // ✅ Correct

// Route to get specific form details
router.get('/:formId', formController.getFormById); // ✅ Correct router.get('/:formId', formController.getFormById); // ✅ Correct

router.put('/:formId', formController.updateForm); // Standard RESTful route

// POST route to handle form submission
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

// Route to submit a new form
router.post('/', 
    upload.fields([
      { name: 'attachments', maxCount: 4 }, // Allow up to 4 attachments
      { name: 'additionalSignatures', maxCount: 1 } // For any additional signatures
    ]),
    formController.createForm
  );

// router.get('/submissions', getUserSubmissions);


module.exports = router;
