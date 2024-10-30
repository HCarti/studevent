const express = require('express');
const router = express.Router();
const Form = require('../models/Form');
const formController = require('../controllers/formController');

// Route to get all forms (admin view) - move this above the formId route
router.get('/all', formController.getAllForms);

// Route to get specific form details
router.get('/:formId', async (req, res) => {
    try {
        const form = await Form.findById(req.params.formId);
        if (!form) {
            return res.status(404).json({ error: 'Form not found' });
        }
        res.status(200).json(form);
    } catch (error) {
        console.error("Error fetching form details:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

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


// Route to submit a new form
router.post('/', formController.createForm);

module.exports = router;
