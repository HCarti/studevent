const express = require('express');
const router = express.Router();
const { getEventTracker, updateTrackerStep, createEventTracker } = require('../controllers/eventTrackerController');
const authenticate = require('../middleware/authenticateToken'); // Authentication middleware
const EventTracker = require('../models/EventTracker'); // Import the EventTracker model

// Create event tracker (POST /api/tracker)
router.post('/', authenticate, createEventTracker);

// Get event tracker by form ID (GET /api/tracker/:formId)
router.get('/:formId', authenticate, getEventTracker);

// Update a specific step in the event tracker (PUT /api/tracker/update-step/:trackerId/:stepId)
router.put("/update-step/:trackerId/:stepId", authenticate, updateTrackerStep);


module.exports = router;
