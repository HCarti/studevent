const EventProgress = require('../models/EventProgress'); // Adjust path as necessary
const Form = require('../models/Form'); // To reference form data if needed

// Create a new event progress entry
exports.createEventProgress = async (req, res) => {
  try {
    const newEventProgress = new EventProgress(req.body); // Expecting req.body to have necessary fields
    const savedEventProgress = await newEventProgress.save();
    res.status(201).json({ message: 'Event progress created successfully', eventProgress: savedEventProgress });
  } catch (error) {
    console.error('Error creating event progress:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get all event progress entries (for admin view)
exports.getAllEventProgress = async (req, res) => {
  try {
    const eventProgressList = await EventProgress.find().populate('formId'); // Assuming formId references the form
    res.status(200).json(eventProgressList);
  } catch (error) {
    console.error('Error fetching event progress:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Update event progress entry (for when a review is completed)
exports.updateEventProgress = async (req, res) => {
  const { id } = req.params; // Event progress ID from URL
  const updatedData = req.body; // New data from the request

  try {
    const updatedProgress = await EventProgress.findByIdAndUpdate(id, updatedData, { new: true });
    if (!updatedProgress) {
      return res.status(404).json({ message: 'Event progress not found' });
    }
    res.status(200).json(updatedProgress);
  } catch (error) {
    console.error('Error updating event progress:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Function to send the event tracker to the next admin or authority
exports.sendToNextReviewer = async (req, res) => {
  const { id, nextReviewerId } = req.body; // Event progress ID and next reviewer's ID from the request

  try {
    const updatedProgress = await EventProgress.findByIdAndUpdate(
      id,
      { currentReviewer: nextReviewerId }, // Update the current reviewer
      { new: true }
    );

    if (!updatedProgress) {
      return res.status(404).json({ message: 'Event progress not found' });
    }

    // Optionally, add logic here to notify the next reviewer (e.g., sending an email or notification)

    res.status(200).json({ message: 'Sent to next reviewer successfully', updatedProgress });
  } catch (error) {
    console.error('Error sending to next reviewer:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
