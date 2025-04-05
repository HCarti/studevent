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
// router.get('/forms/events', formController.getFormEvents);

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

// In your backend routes
// routes/forms.js
router.get('/occupied-dates', authenticateToken, async (req, res) => {
  try {
    // Get all CalendarEvents (not Forms)
    const events = await CalendarEvent.find({}, 'startDate endDate');
    
    const occupiedDates = [];
    
    events.forEach(event => {
      const start = moment(event.startDate).startOf('day');
      const end = moment(event.endDate).endOf('day');
      
      for (let date = start.clone(); date <= end; date.add(1, 'days')) {
        occupiedDates.push(date.format('YYYY-MM-DD'));
      }
    });
    
    res.json({ occupiedDates: [...new Set(occupiedDates)] });
  } catch (error) {
    console.error('Error fetching occupied dates:', error);
    res.status(500).json({ 
      error: 'Failed to fetch occupied dates',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Route to submit a new form
router.post('/', formController.createForm);

// router.get('/submissions', getUserSubmissions);


module.exports = router;
