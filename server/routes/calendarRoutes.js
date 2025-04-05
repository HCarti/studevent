const express = require('express');
const router = express.Router();
const CalendarEvent = require('../models/CalendarEvent');
const moment = require('moment');

// Get all calendar events
router.get('/events', async (req, res) => {
  try {
    const events = await CalendarEvent.find()
      .populate('organization', 'organizationName')
      .sort({ startDate: 1 })
      .lean();
    
    res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    res.status(500).json({ error: 'Failed to fetch calendar events' });
  }
});

// Get events within a date range
router.get('/events/range', async (req, res) => {
  try {
    const { start, end } = req.query;
    
    if (!start || !end) {
      return res.status(400).json({ error: 'Start and end dates are required' });
    }

    const events = await CalendarEvent.find({
      $or: [
        { startDate: { $lte: new Date(end) }, endDate: { $gte: new Date(start) } },
        { startDate: { $gte: new Date(start), $lte: new Date(end) } }
      ]
    })
    .populate('organization', 'organizationName')
    .sort({ startDate: 1 })
    .lean();

    res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching calendar events by range:', error);
    res.status(500).json({ error: 'Failed to fetch calendar events' });
  }
});

// Get occupied dates from calendar events
router.get('/occupied-dates',  async (req, res) => {
  try {
    const events = await CalendarEvent.find({}, 'startDate endDate');
    
    const occupiedDates = [];
    
    events.forEach(event => {
      const start = moment(event.startDate).startOf('day');
      const end = moment(event.endDate).endOf('day');
      
      for (let date = start.clone(); date <= end; date.add(1, 'days')) {
        occupiedDates.push(date.format('YYYY-MM-DD'));
      }
    });
    
    res.json({ occupiedDates: [...new Set(occupiedDates)] });
  } catch (error) {
    console.error('Error fetching occupied dates:', error);
    res.status(500).json({ 
      error: 'Failed to fetch occupied dates',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;