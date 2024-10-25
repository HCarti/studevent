const User = require('../models/User');

// Get all users
const getUsers = async (req, res) => {
  try {
    const users = await User.find(); // Retrieve all users from the database
    res.status(200).json(users); // Return the list of users
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: `Error fetching users: ${error.message}` });
  }
};

// Add user
const addUser = async (userData, blobUrl) => {
  try {
    // Log the incoming data for debugging
    console.log('User Data:', userData);
    console.log('Blob URL:', blobUrl);

    // Validate email and password in userData
    if (!userData.email || !userData.password) {
      throw new Error('Email and password are required');
    }

    // Check if the email already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error('Email already exists');
    }

    // Create the new user object
    const newUser = new User({
      email: userData.email,
      password: userData.password,
      role: userData.role,
      status: 'Active',
      logo: blobUrl, // Use the blob URL from Vercel Blob
    });

    // Assign additional fields based on user role
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

    // Save the new user to the database
    await newUser.save();
    return newUser;
  } catch (error) {
    console.error('Error adding user:', error);
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

module.exports = { getUsers, getUserById, updateUser, deleteUserById, addUser };
