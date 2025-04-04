const express = require('express');
const router = express.Router();
const Form = require('../models/Form');
const formController = require('../controllers/formController');

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
      });

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
router.get('/forms/events', formController.getFormEvents);

router.get('/all', formController.getAllForms); // ✅ Correct

// Route to get specific form details
router.get('/:formId', formController.getFormById); // ✅ Correct router.get('/:formId', formController.getFormById); // ✅ Correct

router.put('/:formId', formController.updateForm); // Standard RESTful route

// POST route to handle form submission
router.post('/submit', async (req, res) => {
    try {
        const newForm = new Form(req.body);
        const savedForm = await newForm.save(); // Save the form and get the saved instance
        res.status(201).json({ 
            message: 'Form submitted successfully', 
            id: savedForm._id // Return the Object ID of the saved form
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: 'Validation Error', details: error.message });
        }
        console.error('Error saving form:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/occupied-dates', async (req, res) => {
    try {
      const forms = await Form.find({}, 'eventStartDate eventEndDate'); // Only fetch start and end dates
      const occupiedDates = [];
  
      forms.forEach(form => {
        let current = new Date(form.eventStartDate);
        const end = new Date(form.eventEndDate);
  
        while (current <= end) {
          occupiedDates.push(current.toISOString().split('T')[0]); // Add dates in YYYY-MM-DD format
          current.setDate(current.getDate() + 1);
        }
      });
  
      res.json({ occupiedDates });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch occupied dates.' });
    }
  }); 

// Route to submit a new form
router.post('/', formController.createForm);

// router.get('/submissions', getUserSubmissions);


module.exports = router;
