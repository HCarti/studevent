  const User = require('../models/User');

  // Get all users
  const getUsers = async (req, res) => {
    try {
        const users = await User.find(); // Retrieve all users from the database
        res.status(200).json(users);     // Return the list of users
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: `Error fetching users: ${error.message}` });
    }
  };

  // Add user
  const addUser = async (req, res) => {
  try {
    console.log('Request Body:', req.body);  // Log the request body for debugging
    console.log('Uploaded File:', req.file); // Log the uploaded file for debugging

    if (!req.body.email || !req.body.password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const userData = {
      email: req.body.email,
      password: req.body.password,
      role: req.body.role,
      status: 'Active',
      logo: req.file ? req.file.filename : null, // Always set the logo if file exists
    };

    if (req.body.role === 'Authority') {
      userData.firstName = req.body.firstName;
      userData.lastName = req.body.lastName || '';
      userData.faculty = req.body.faculty || null;
    } else if (req.body.role === 'Admin') {
      userData.firstName = req.body.firstName;
      userData.lastName = req.body.lastName || '';
    } else if (req.body.role === 'Organization') {
      userData.organizationType = req.body.organizationType || null;
      userData.organizationName = req.body.organizationName || null;
    }

    const newUser = new User(userData);
    await newUser.save();
    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (error) {
    console.error('Error adding user:', error); // Log full error
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