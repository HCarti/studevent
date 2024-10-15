// controllers/formController.js
const Form = require('../models/Form');

// Get all forms (for admin)
exports.getAllForms = async (req, res) => {
  try {
    const forms = await Form.find();  // Retrieve all forms from MongoDB
    res.json(forms);  // Send the forms as a JSON response
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};

// Add a new form (when the user submits)
exports.createForm = async (req, res) => {
  try {
    const newForm = new Form(req.body);  // Create a new form with the user input
    await newForm.save();  // Save the form to MongoDB
    res.status(201).json(newForm);  // Return the saved form as JSON
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};
