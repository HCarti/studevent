const express = require('express');
const router = express.Router();
const { getEventTracker, updateEventTracker } = require('../controllers/eventTrackerController');

// Get event tracker by form ID
router.get('/tracker/:formId', getEventTracker);

// Update event tracker status
router.put('/tracker/:formId', updateEventTracker);

module.exports = router;
