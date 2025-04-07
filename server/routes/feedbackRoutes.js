// routes/feedbackRoutes.js
const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');

router.post('/',  feedbackController.submitFeedback);
router.post('/latest',  feedbackController.getLatestFeedback);
router.get('/:formId',  feedbackController.getFeedbackForForm);

module.exports = router;