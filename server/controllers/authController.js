  // const User = require('../models/User');
  // const jwt = require('jsonwebtoken');

  // const login = async (req, res) => {
  //   const { email, password } = req.body;
  //   console.log('JWT_SECRET:', process.env.JWT_SECRET); // Debug log for JWT_SECRET
  
  //   try {
  //     const user = await User.findOne({ email: email });
  //     if (!user) {
  //       return res.status(401).json({ message: 'Invalid email or password.' });
  //     }
  
  //     if (password === user.password) {
  //       // Generate a JWT token
  //       const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
  //       // Respond with user data and the token
  //       res.status(200).json({ data: user, token, success: true, loginStatus: "success" });
  //     } else {
  //       res.status(404).json({ success: false, loginStatus: "failed" });
  //     }
  
  //   } catch (error) {
  //     res.status(500).json({ message: 'Error logging in' });
  //   }
  // };
  

  // module.exports = { login };