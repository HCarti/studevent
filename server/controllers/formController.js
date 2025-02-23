// controllers/formController.js
const Form = require('../models/Form');
const User = require('../models/User');
// const ProjectProposalForm = require('../models/projectProposalForm'); // Import your new schema
const Notification = require("../models/Notification"); // Import the Notification model
const EventTracker = require("../models/EventTracker"); // ✅ Check this path



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

exports.getFormById = async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }
    res.status(200).json(form);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



// exports.getUserSubmissions = async (req, res) => {
//   try {
//     const { userId } = req.query; // Get the userId from query params

//     // If userId is not provided, return an error
//     if (!userId) {
//       return res.status(400).json({ message: 'User ID is required' });
//     }

//     // Find the submissions for this user
//     const submissions = await Form.find({ userId: userId }).populate('eventId'); // Assuming eventId is referenced in the Form model

//     // If no submissions found, return an empty array
//     if (!submissions.length) {
//       return res.status(404).json({ message: 'No submissions found for this user' });
//     }

//     // Return the submissions
//     res.status(200).json(submissions);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Internal Server Error' });
//   }
// };  



// Add a new form (when the user submits)

exports.createForm = async (req, res) => {
  try {
    if (!req.body.applicationDate) {
      req.body.applicationDate = new Date();
    }

    if (!req.body.emailAddress && req.user && req.user.email) {
      req.body.emailAddress = req.user.email;
    }

    const organization = await User.findOne({
      organizationName: req.body.studentOrganization,
      role: "Organization",
    });

    if (!organization) {
      return res.status(400).json({ error: "Organization not found with the provided name" });
    }

    req.body.studentOrganization = organization._id;

    const form = new Form(req.body);
    await form.save();

    console.log("✅ Form Created:", form); // ✅ Debug log

    // ✅ Fix: Declare `tracker` outside of the try-catch

    console.log("🛠 Creating tracker for form ID:", form._id);

    const tracker = new EventTracker({
      formId: form._id,
      steps: [
        { label: "Adviser", status: "pending" },
        { label: "Dean", status: "pending" },
        { label: "Academic Services", status: "pending" },
        { label: "Academic Director", status: "pending" },
        { label: "Executive Director", status: "pending" },
      ],
      currentStep: 0,
    });

    console.log("🔄 Saving tracker...");
    await tracker.save().catch(err => {
        console.error("❌ Tracker Save Error:", err);
        throw err; // Re-throw the error to be caught in the catch block
    });


    if (req.body.emailAddress) {
      await Notification.create({
        userEmail: req.body.emailAddress,
        message: `Your form has been submitted successfully!`,
        read: false,
        timestamp: new Date(),
      });
    } else {
      console.error("Error: Email address is missing in the request body!");
    }

    // ✅ Fix: Ensure `tracker` is defined before sending response
    res.status(201).json({ form, tracker: tracker || {} });

  } catch (error) {
    console.error("❌ Full Error Details:", error); // Log full error details
    res.status(500).json({ error: "Server error", details: error.message });
}
};

