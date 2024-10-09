const User = require('../models/User');

// Get all users
const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
};

// Add user
const addUser = async (req, res) => {
  try {
    if (!req.body.firstName || !req.body.email || !req.body.password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Handle fields based on role
    const userData = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: req.body.password,
      role: req.body.role,
      status: 'Active',
    };

    // Attach faculty or organization type and logo/photo based on the role
     if (req.body.role === 'Authority') {
      userData.faculty = req.body.faculty || null;
      userData.logo = req.file ? req.file.filename : null;  // Ensure logo is being added here
    } else if (req.body.role === 'Organization') {
      userData.organizationType = req.body.organizationType || null;
      userData.logo = req.file ? req.file.filename : null; // Add logo/photo for Organizations
    }

    const newUser = new User(userData);
    await newUser.save();
    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (error) {
    console.error('Error adding user:', error.message);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
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

module.exports = { getUsers, getUserById, updateUser, deleteUserById, addUser };
