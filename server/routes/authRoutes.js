    const express = require('express');
    const router = express.Router();
    const { login, verifyOTP } = require('../controllers/authController');

    // Login
    router.post('/login', login);

    // // OTP Verification
    // router.post('/verify-otp', verifyOTP);

    module.exports = router;
