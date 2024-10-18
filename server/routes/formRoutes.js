const express = require('express');
const router = express.Router();
const Form = require('../models/Form');
const formController = require('../controllers/formController');

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

// Route to get all forms (admin view)
router.get('/all', formController.getAllForms);

// Route to submit a new form
router.post('/', formController.createForm);

module.exports = router;
