// controllers/formController.js
const Form = require('../models/Form');

// Controller to get all submitted forms
exports.getAllForms = async (req, res) => {
  console.log("Fetching all forms...");
  try {
      const forms = await Form.find({});
      console.log("Forms retrieved:", forms); // Log the retrieved forms
      try {
          const populatedForms = await Form.populate(forms, { path: 'studentOrganization', select: 'organizationName' });
          res.status(200).json(populatedForms);
      } catch (populateError) {
          console.error("Error populating forms:", populateError);
          res.status(500).json({ error: "Internal Server Error during population", details: populateError.message });
      }
  } catch (error) {
      console.error("Error fetching forms:", error); // Log full error
      res.status(500).json({ 
          error: "Internal Server Error", 
          details: error.message // More detailed error response
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
