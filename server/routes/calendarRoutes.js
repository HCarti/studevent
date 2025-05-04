const express = require('express');
const router = express.Router();
const CalendarEvent = require('../models/CalendarEvent');
const moment = require('moment');
const BlockedDate = require('../models/BlockedDate');
const User = require('../models/User'); // Make sure to import your User model

const verifySuperAdmin = async (req, res, next) => {
  try {
    // Get user ID from the authenticated request
    const userId = req.user?._id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized - No user ID found' });
    }

    // Directly check if user is SuperAdmin
    const superAdmin = await User.findOne({
      _id: userId,
      role: "SuperAdmin", // Assuming your schema has a "role" field
      status: "Active"    // Assuming you have an active status field
    }).select('_id email firstName lastName');

    if (!superAdmin) {
      return res.status(403).json({ error: 'Access denied - SuperAdmin privileges required' });
    }

    // Attach the superAdmin info to the request if needed
    req.superAdmin = superAdmin;
    next();
  } catch (error) {
    console.error('SuperAdmin verification error:', error);
    res.status(500).json({ error: 'Server error during authorization' });
  }
};

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
// In your existing /events/range route, add this at the beginning:
router.get('/events/range', async (req, res) => {
  try {
    const { start, end } = req.query;
    
    if (!start || !end) {
      return res.status(400).json({ error: 'Start and end dates are required' });
    }

    // First check if any dates in the range are blocked
    const blockedInRange = await BlockedDate.findOne({
      $or: [
        { 
          startDate: { $lte: new Date(end) },
          $or: [
            { endDate: { $gte: new Date(start) } },
            { endDate: null }
          ]
        },
        { 
          startDate: { $gte: new Date(start), $lte: new Date(end) }
        }
      ]
    }).lean();

    if (blockedInRange) {
      // Return both events and blocked dates info
      const events = await CalendarEvent.find({
        $or: [
          { startDate: { $lte: new Date(end) }, endDate: { $gte: new Date(start) } },
          { startDate: { $gte: new Date(start), $lte: new Date(end) } }
        ]
      })
      .populate('organization', 'organizationName')
      .sort({ startDate: 1 })
      .lean();

      return res.status(200).json({
        events,
        blockedDatesInfo: {
          hasBlockedDates: true,
          firstBlocked: blockedInRange
        }
      });
    }

    // Original event query if no blocked dates
    const events = await CalendarEvent.find({
      $or: [
        { startDate: { $lte: new Date(end) }, endDate: { $gte: new Date(start) } },
        { startDate: { $gte: new Date(start), $lte: new Date(end) } }
      ]
    })
    .populate('organization', 'organizationName')
    .sort({ startDate: 1 })
    .lean();

    res.status(200).json({
      events,
      blockedDatesInfo: {
        hasBlockedDates: false
      }
    });
  } catch (error) {
    console.error('Error fetching calendar events by range:', error);
    res.status(500).json({ error: 'Failed to fetch calendar events' });
  }
});

// Get all blocked dates
router.get('/blocked-dates', async (req, res) => {
  try {
    const blockedDates = await BlockedDate.find()
      .sort({ startDate: 1 })
      .lean();
    
    res.status(200).json(blockedDates);
  } catch (error) {
    console.error('Error fetching blocked dates:', error);
    res.status(500).json({ error: 'Failed to fetch blocked dates' });
  }
});

// Create new blocked date range
// Block dates route
router.post('/block-dates', verifySuperAdmin, async (req, res) => {
  try {
    const { title, description, startDate, endDate } = req.body;

    // Validate required fields
    if (!title || !startDate) {
      return res.status(400).json({
        error: 'Validation failed',
        details: 'Title and start date are required'
      });
    }

    // Create with raw dates - let schema handle normalization
    const newBlock = new BlockedDate({
      title,
      description,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
      createdBy: req.user._id
    });

    await newBlock.save();

    // Return formatted dates in response
    res.status(201).json({
      message: 'Dates blocked successfully',
      blockedDate: {
        ...newBlock.toObject(),
        startDate: moment.utc(newBlock.startDate).format('YYYY-MM-DD'),
        endDate: newBlock.endDate ? moment.utc(newBlock.endDate).format('YYYY-MM-DD') : null
      }
    });

  } catch (error) {
    console.error('Error in block-dates:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.message
      });
    }
    
    res.status(500).json({
      error: 'Server error',
      details: 'Failed to process blocked dates request'
    });
  }
});

// Delete blocked dates route
router.delete('/blocked-dates/:id', verifySuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    const deletedBlock = await BlockedDate.findByIdAndDelete(id);
    
    if (!deletedBlock) {
      return res.status(404).json({ error: 'Blocked date range not found' });
    }
    
    res.status(200).json({ 
      message: 'Blocked date range removed successfully',
      deletedBlock 
    });
  } catch (error) {
    console.error('Error deleting blocked dates:', error);
    res.status(500).json({ error: 'Failed to remove blocked dates' });
  }
});

// Check if specific date is blocked
router.get('/is-date-blocked', async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }

    const queryDate = new Date(date);
    const blocked = await BlockedDate.findOne({
      startDate: { $lte: queryDate },
      $or: [
        { endDate: { $gte: queryDate } },
        { endDate: null }
      ]
    }).lean();

    res.status(200).json({ 
      isBlocked: !!blocked,
      blockInfo: blocked || null
    });
  } catch (error) {
    console.error('Error checking blocked date:', error);
    res.status(500).json({ error: 'Failed to check date availability' });
  }
});

module.exports = router;