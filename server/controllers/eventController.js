// controllers/eventController.js

const Event = require('../models/eventModel');

// Create a new event
const createEvent = async (req, res) => {
  const { title, start, end } = req.body;

  // Validate input
  if (!title || !start || !end) {
    return res.status(400).json({ error: 'Title, start, and end are required.' });
  }

  try {
    const newEvent = new Event({ title, start, end });
    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (error) {
    console.error('Error creating event:', error); // Log error for debugging
    res.status(500).json({ error: 'Error creating event' });
  }
};

// Get all events
const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find();
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching events' });
  }
};

module.exports = {
  createEvent,
  getAllEvents
};
