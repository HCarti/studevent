// controllers/formController.js
const Form = require('../models/Form');

// Controller to get all submitted forms
exports.getAllForms = async (req, res) => {
  console.log("Fetching all forms..."); // Add this line
  try {
      const forms = await Form.find({}).populate('studentOrganization', 'organizationName');
      res.status(200).json(forms);
  } catch (error) {
      console.error("Error fetching forms:", error);
      res.status(500).json({ 
          error: "Internal Server Error", 
          details: error.message 
      });
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
