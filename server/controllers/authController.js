const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Secret for signing JWT tokens (stored in an environment variable)
const jwtSecret = process.env.JWT_SECRET;

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email: email });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Compare hashed password with the provided password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Create a JWT token with the user's ID and role
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      jwtSecret, // Secret key from env
      { expiresIn: '1h' } // Token expiration time
    );

    // Return the token and user details
    res.status(200).json({
      token,
      user: { 
        email: user.email, 
        role: user.role, 
        firstName: user.firstName, 
        lastName: user.lastName 
      }
    });
  } catch (error) {
    // Log error for internal debugging
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
};

module.exports = { login };
