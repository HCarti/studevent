const express = require('express');
const router = express.Router();
const { getEventTracker, updateEventTracker, createEventTracker } = require('../controllers/eventTrackerController');
const authenticate = require('../middleware/authenticateToken'); // Add authentication

// Create event tracker (POST /api/tracker)
router.post('/', authenticate, createEventTracker);

// Get event tracker by form ID (GET /api/tracker/:formId)
router.get('/:formId', authenticate, getEventTracker);

// Update event tracker status (PUT /api/tracker/:formId)
router.put('/:formId', authenticate, updateEventTracker);

module.exports = router;
