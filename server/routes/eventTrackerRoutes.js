const express = require('express');
const router = express.Router();
const { getEventTracker, updateEventTracker,  createEventTracker} = require('../controllers/eventTrackerController');
const authenticate = require('../middleware/authenticateToken'); // Add authentication

router.post('/tracker', authenticate, createEventTracker);

// Get event tracker by form ID
router.get('/tracker/:formId', authenticate, getEventTracker);

// Update event tracker status
router.put('/tracker/:formId', authenticate, updateEventTracker);


module.exports = router;
