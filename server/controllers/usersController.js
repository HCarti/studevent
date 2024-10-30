  const User = require('../models/User');
  const jwt = require('jsonwebtoken');

  // Login and generate JWT
  const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user || user.password !== password) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      // Just return user data
      res.status(200).json({ message: 'Login successful', data: user });
    } catch (error) {
      res.status(500).json({ message: 'Login error', error: error.message });
    }
  };
  
  // Get all users
  const getUsers = async (req, res) => {
    try {
      const users = await User.find();
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: `Error fetching users: ${error.message}` });
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

  module.exports = { getUsers, getUserById, updateUser, deleteUserById, addUser, loginUser };
