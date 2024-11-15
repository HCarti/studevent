const User = require('../models/User');
const jwt = require('jsonwebtoken');

const createToken = (_id) => {
  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is not defined");
    throw new Error("JWT_SECRET must be set in environment variables");
  }
  return jwt.sign({ _id }, process.env.JWT_SECRET, { expiresIn: '3d' });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email }).lean();

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    console.log("Raw user data from MongoDB:", user);

    // Compare plain password (insecure)
    if (password !== user.password) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = createToken(user._id);
    console.log("Generated token:", token);

    const userData = {
      _id: user._id,
      email: user.email,
      role: user.role,
      logo: user.logo,
    };

    if (user.role === 'Organization') {
      userData.organizationName = user.organizationName || null;
      userData.organizationType = user.organizationType || null;
    } else if (user.role === 'Authority') {
      userData.firstName = user.firstName || null;
      userData.lastName = user.lastName || null;
      userData.faculty = user.faculty || null;
    } else if (user.role === 'Admin') {
      userData.firstName = user.firstName || null;
      userData.lastName = user.lastName || null;
    }

    res.status(200).json({
      success: true,
      token,
      data: userData,
    });
    console.log("Structured userData sent to frontend:", userData);
  } catch (error) {
    console.error('Error logging in:', error.message);
    res.status(500).json({ message: 'Error logging in' });
  }
};

// Get all organizations (protected route)
const getOrganizations = async (req, res) => {
  try {
    const organizations = await User.find({ role: 'Organization' });
    res.status(200).json({ organizations });
  } catch (error) {
    console.error('Error fetching organizations:', error.message);
    res.status(500).json({ message: 'Error fetching organizations' });
  }
};

// Get users
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error.message);
    res.status(500).json({ message: 'Error fetching users' });
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

module.exports = { getUserById, updateUser, deleteUserById, addUser, login, getUsers, getOrganizations };
