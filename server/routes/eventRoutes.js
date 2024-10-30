const express = require('express');
const router = express.Router();
const eventProgressController = require('../controllers/eventController');

// Create new event progress entry
router.post('/', eventProgressController.createEventProgress);

// Get all event progress entries
router.get('/', eventProgressController.getAllEventProgress);

// Update event progress entry
router.patch('/:id', eventProgressController.updateEventProgress);

// Send to next reviewer
router.post('/send', eventProgressController.sendToNextReviewer);

module.exports = router;
