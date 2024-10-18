// routes/eventRoutes.js
const express = require('express');
const { createEvent, getAllEvents } = require('../controllers/eventController');

const router = express.Router();

// Route to create a new event
router.post('/events', createEvent); // This should match with your Axios POST request

// Route to get all events
router.get('/events', getAllEvents);

module.exports = router;
