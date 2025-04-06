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
router.get('/occupied-slots', async (req, res) => {
  try {
    // Get all events
    const events = await CalendarEvent.find({}, 'startDate endDate');
    
    const occupiedDates = [];
    const occupiedTimeSlots = {};
    
    events.forEach(event => {
      const start = moment(event.startDate);
      const end = moment(event.endDate);
      
      // If it's a multi-day event, add all dates to occupiedDates
      if (end.diff(start, 'days') > 0) {
        for (let date = start.clone(); date <= end; date.add(1, 'days')) {
          const dateStr = date.format('YYYY-MM-DD');
          occupiedDates.push(dateStr);
        }
      } else {
        // Single day event - add specific time slots
        const dateStr = start.format('YYYY-MM-DD');
        const timeStr = start.format('HH:mm');
        
        if (!occupiedTimeSlots[dateStr]) {
          occupiedTimeSlots[dateStr] = [];
        }
        
        // Add time slot plus buffer (e.g., 1 hour before/after)
        const slotTime = moment(timeStr, 'HH:mm');
        for (let i = -1; i <= 1; i++) {
          const bufferTime = slotTime.clone().add(i, 'hours');
          occupiedTimeSlots[dateStr].push(bufferTime.format('HH:mm'));
        }
      }
    });
    
    res.json({ 
      occupiedDates: [...new Set(occupiedDates)],
      occupiedTimeSlots 
    });
  } catch (error) {
    console.error('Error in /occupied-slots:', error);
    res.status(500).json({ error: 'Failed to fetch occupied slots' });
  }
});

module.exports = router;