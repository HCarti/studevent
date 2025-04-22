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
    const events = await CalendarEvent.find({}, 'startDate endDate');
    
    const occupiedDates = [];
    const occupiedTimeSlots = {};
    const eventCounts = {};
    
    events.forEach(event => {
      const start = moment.utc(event.startDate).startOf('day');
      const end = moment.utc(event.endDate).startOf('day');
      
      // Count events per date
      for (let date = start.clone().startOf('day'); date <= end.startOf('day'); date.add(1, 'days')) {
        const dateStr = date.format('YYYY-MM-DD');
        eventCounts[dateStr] = (eventCounts[dateStr] || 0) + 1;
        
        // Mark as fully occupied if 3+ events
        if (eventCounts[dateStr] >= 3) {
          occupiedDates.push(dateStr);
        }
      }

      // Original time slot logic (keep if you still want time-based validation)
      const dateStr = start.format('YYYY-MM-DD');
      const timeStr = start.format('HH:mm');
      
      if (!occupiedTimeSlots[dateStr]) {
        occupiedTimeSlots[dateStr] = [];
      }
      occupiedTimeSlots[dateStr].push(timeStr);
    });
    
    res.json({ 
      occupiedDates: [...new Set(occupiedDates)],
      occupiedTimeSlots,
      eventsPerDate: eventCounts
    });
  } catch (error) {
    console.error('Error in /occupied-slots:', error);
    res.status(500).json({ error: 'Failed to fetch occupied slots' });
  }
});


// Get event counts per date
router.get('/event-counts', async (req, res) => {
  try {
    console.log('Fetching event counts...'); // Debug log
    
    // Add date range filtering if needed
    const events = await CalendarEvent.find({
      $or: [
        { formType: 'Activity' },
        { formType: 'Project' }
      ]
    }, 'startDate endDate').lean();
    
    console.log(`Found ${events.length} events`); // Debug log
    
    const eventCounts = {};
    
    // In /event-counts route, make counting more robust
        events.forEach(event => {
          const start = moment.utc(event.startDate).startOf('day');
          const end = moment.utc(event.endDate).startOf('day');
          
          // Handle cases where end date is before start date
          if (end.isBefore(start)) {
            const dateStr = start.format('YYYY-MM-DD');
            eventCounts[dateStr] = (eventCounts[dateStr] || 0) + 1;
            return;
          }

          for (let date = start.clone(); date <= end; date.add(1, 'days')) {
            const dateStr = date.format('YYYY-MM-DD');
            eventCounts[dateStr] = (eventCounts[dateStr] || 0) + 1;
          }
        });
    
    console.log('Final event counts:', eventCounts); // Debug log
    res.json({ eventCounts });
  } catch (error) {
    console.error('Error in /event-counts:', error);
    res.status(500).json({ 
      error: 'Failed to fetch event counts',
      details: error.message 
    });
  }
});

module.exports = router;