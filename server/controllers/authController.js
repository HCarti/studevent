const User = require('../models/User');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
  const { email, password } = req.body;
  console.log('JWT_SECRET:', process.env.JWT_SECRET); // Check if JWT_SECRET is accessible

  try {
    const user = await User.findOne({ email: email });
    console.log(user);

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }


    // Generate a JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role }, // Include relevant user data in the payload
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // Set token expiration time
    );

    // Send back the token and user data (excluding password for security)
    res.status(200).json({
      data: { 
        _id: user._id, 
        email: user.email, 
        role: user.role, 
        firstName: user.firstName, 
        lastName: user.lastName 
      },
      token,
      success: true,
      loginStatus: "success"
    });
    
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
};

module.exports = { login };
