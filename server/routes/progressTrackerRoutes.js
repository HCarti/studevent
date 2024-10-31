const express = require('express');
const { submitForm, updateReviewStage, getFormDetails } = require('../controllers/ProgressTrackerController');

const router = express.Router();

// Submit a new form
router.post('/submit', submitForm);

// Update review stage
router.put('/review/:formId', updateReviewStage);

// Get form details with progress
router.get('/:formId', getFormDetails);

module.exports = router;
