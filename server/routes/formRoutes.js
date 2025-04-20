const express = require('express');
const router = express.Router();
const multer = require('multer');
const formController = require('../controllers/formController');
const Form = require('../models/Form');

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 5 // Allow multiple files
  }
});

// ======================
// GENERAL FORM ROUTES
// ======================
// In your routes file
router.get("/by-email/:email", async (req, res) => {
  try {
    const email = req.params.email;
    if (!email) return res.status(400).json({ message: "Email is required" });

    // Get regular forms
    const forms = await Form.find({
      emailAddress: { $regex: new RegExp(`^${email}$`, "i") },
    }).populate('studentOrganization', 'organizationName presidentName presidentSignature');

    // Get Local Off-Campus forms
    const localOffForms = await LocalOffCampus.find({
      emailAddress: { $regex: new RegExp(`^${email}$`, "i") },
    });

    // Combine and format all forms
    const allForms = [
      ...forms.map(f => ({ ...f._doc, source: 'form' })),
      ...localOffForms.map(f => ({ 
        ...f._doc, 
        source: 'localOff',
        formType: 'LocalOffCampus',
        eventTitle: `Local Off-Campus: ${f.nameOfHei}`,
        finalStatus: f.status
      }))
    ];

    allForms.length === 0 
      ? res.status(404).json({ message: "No forms found" })
      : res.status(200).json(allForms);
  } catch (error) {
    console.error("Error fetching forms:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


router.delete('/:formId', formController.deleteForm);
router.get('/all', formController.getAllForms);
router.get('/:formId', formController.getFormById);
router.put('/:formId', formController.updateForm);

// ======================
// FORM SUBMISSION ROUTES
// ======================
router.post('/submit', upload.none(), formController.createForm);

module.exports = router;