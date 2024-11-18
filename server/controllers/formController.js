// controllers/formController.js
const Form = require('../models/Form');
// const ProjectProposalForm = require('../models/projectProposalForm'); // Import your new schema

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
    // Automatically set the applicationDate to the current date if not provided
    if (!req.body.applicationDate) {
      req.body.applicationDate = new Date();
    }

    // Assume `req.user` contains authenticated user information
    if (!req.body.emailAddress && req.user && req.user.email) {
      req.body.emailAddress = req.user.email;
    }

    // Find the organization by name and get its ObjectId
    const organization = await organization.findOne({ name: req.body.studentOrganization });

    if (!organization) {
      return res.status(400).json({ error: "Organization not found" });
    }

    // Replace the studentOrganization field with the ObjectId
    req.body.studentOrganization = organization._id;

    // Create the form with the processed body
    const form = new Form(req.body);
    await form.save();

    res.status(201).json(form);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};