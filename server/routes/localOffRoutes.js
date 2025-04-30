const express = require('express');
const router = express.Router();
const localOffController = require('../controllers/localOffController');
const LocalOffCampus = require('../models/LocalOffCampus');
const EventTracker = require('../models/EventTracker');

router.get("/by-user/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId) return res.status(400).json({ message: "User ID is required" });

    const forms = await LocalOffCampus.find({
      submittedBy: userId
    }).sort({ submittedAt: -1 }); // Newest first

    res.status(200).json({
      success: true,
      data: forms,
      count: forms.length
    });
  } catch (error) {
    console.error("Error fetching Local Off-Campus forms:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal Server Error",
      error: error.message 
    });
  }
});

//before phase routes
router.post('/before', localOffController.submitLocalOffCampusBefore);

router.get('/:offId', localOffController.getLocalOffCampusForms);

// After phase routes
router.post('/after', localOffController.submitLocalOffCampusAfter); // For new submissions
// In your localOffRoutes.js
router.post('/:eventId/update-to-after', localOffController.updateToAfterPhase); // For new submissions
router.put('/:eventId/after', localOffController.updateLocalOffCampusAfter); // For updates

// Add this route to localOffRoutes.js
router.get('/:offId/tracker', async (req, res) => {
  try {
    const formId = req.params.offId;
    
    // First get the form to check its phase
    const form = await LocalOffCampus.findById(formId);
    if (!form) {
      return res.status(404).json({ error: "Local Off-Campus form not found" });
    }

    // Then get the tracker
    const tracker = await EventTracker.findOne({ formId });
    if (!tracker) {
      return res.status(404).json({ error: "Tracker not found for this form" });
    }

    // Return both tracker and form phase
    res.status(200).json({
      ...tracker.toObject(),
      formPhase: form.formPhase
    });

  } catch (error) {
    console.error("Error fetching tracker:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal Server Error",
      error: error.message 
    });
  }
});

module.exports = router;