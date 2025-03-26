const express = require('express');
const router = express.Router();
const { getEventTracker, updateTrackerStep, createEventTracker, getReviewSignatures } = require('../controllers/eventTrackerController');
const EventTracker = require('../models/EventTracker'); // Import the EventTracker model

// Add this to your routes file (e.g., trackerRoutes.js)
router.get('/signatures/:formId', getReviewSignatures);

// Create event tracker (POST /api/tracker)
router.post('/', createEventTracker);

// Get event tracker by form ID (GET /api/tracker/:formId)
router.get('/:formId', getEventTracker);

// Update a specific step in the event tracker (PUT /api/tracker/update-step/:trackerId/:stepId)
router.put("/update-step/:trackerId/:stepId", updateTrackerStep);

module.exports = router;