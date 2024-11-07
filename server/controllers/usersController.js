  const User = require('../models/User');
  const jwt = require('jsonwebtoken');
  

  const createToken = (_id) => {
    return jwt.sign({_id}, process.env.SECRET, { expiresIn: '3d' })
}

  // Login and generate JWT
  const login = async (req, res) => {
    const { email, password } = req.body;
    console.log('JWT_SECRET:', process.env.JWT_SECRET); // Check if JWT_SECRET is accessible
  
    try {
      const user = await User.findOne({ email: email });
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }
  
      if (password === user.password) {
        // Generate JWT token
        // const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        // console.log("Generated token:", token); // Log token for debugging  
        const token = createToken(user._id)
        // Send token and user data in the response
        res.status(200).json({
          success: true,
          token, // include token here
          data: {
            _id: user._id,
            email: user.email,
            role: user.role,
            password: user.password
          }
        });
      } else {
        res.status(401).json({ message: 'Invalid email or password.' });
      }
    } catch (error) {
      console.error('Error logging in:', error.message);
      res.status(500).json({ message: 'Error logging in' });
    }
  };
  

  // Add user
  const addUser = async (userData, blobUrl) => {
    try {
      console.log('User Data:', userData);
      console.log('Blob URL:', blobUrl);

      if (!userData.email || !userData.password) throw new Error('Email and password are required');

      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) throw new Error('Email already exists');

      const newUser = new User({
        email: userData.email,
        password: userData.password,
        role: userData.role,
        status: 'Active',
        logo: blobUrl,
      });

      if (userData.role === 'Authority') {
        newUser.firstName = userData.firstName;
        newUser.lastName = userData.lastName || '';
        newUser.faculty = userData.faculty || null;
      } else if (userData.role === 'Admin') {
        newUser.firstName = userData.firstName;
        newUser.lastName = userData.lastName || '';
      } else if (userData.role === 'Organization') {
        newUser.organizationType = userData.organizationType || null;
        newUser.organizationName = userData.organizationName || null;
      }

      await newUser.save();
      return newUser;
    } catch (error) {
      throw error;
    }
  };

  // Get user by ID
  const getUserById = async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      res.status(200).json(user);
    } catch (error) {
      res.status(404).json({ message: 'User not found' });
    }
  };

  // Update user by ID
  const updateUser = async (req, res) => {
    const userId = req.params.id;
    const updatedData = req.body;

    try {
      const user = await User.findByIdAndUpdate(userId, updatedData, { new: true });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json(user);
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };

  // Delete user by ID
  const deleteUserById = async (req, res) => {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting user' });
    }
  };

  module.exports = { getUserById, updateUser, deleteUserById, addUser, login };
