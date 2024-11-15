// routes/emailRoutes.js
const express = require('express');
const { sendEmailNotification } = require('../controllers/emailController');

const router = express.Router();

// Define the route for sending an email notification
router.post('/notify-user', sendEmailNotification);

module.exports = router;
