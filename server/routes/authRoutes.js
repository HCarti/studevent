const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const {login}= require ('../controllers/authController')
const bcrypt = require('bcryptjs');

// Login
router.post('/login', login)

module.exports = router;
