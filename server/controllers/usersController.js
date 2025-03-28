const User = require('../models/User');
const jwt = require('jsonwebtoken');

const createToken = (user) => {
  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is not defined");
    throw new Error("JWT_SECRET must be set in environment variables");
  }

  return jwt.sign(
    {
      _id: user._id,
      email: user.email,
      role: user.role,
      faculty: user.faculty || null,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      organizationType: user.organizationType || '',
      organizationName: user.organizationName || '',
      status: user.status || '',
      logo: user.logo || '',
      signature: user.signature || ''
    },
    process.env.JWT_SECRET,
    { expiresIn: "3d" }
  );
};




const login = async (req, res) => {
  const { email, password } = req.body;
  console.log('JWT_SECRET:', process.env.JWT_SECRET); // Check if JWT_SECRET is accessible

  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (password === user.password) {
      // Validate role-specific fields
      if (user.role === 'Admin' || user.role === 'Authority') {
        if (!user.firstName || !user.lastName || !user.signature) {
          return res.status(400).json({ message: 'First name and last name are required for Admin and Authority roles.' });
        }
      }

      if (user.role === 'Authority' && !user.faculty) {
        if (!user.signature){
          return res.status(400).json({ message: 'Faculty is required for Authority roles.' });
        }
      }

      if (user.role === 'Organization') {
        if (!user.organizationType || !user.organizationName) {
          return res.status(400).json({ message: 'Organization type and name are required for Organization roles.' });
        }
      }

      // Generate JWT token
      const token = createToken(user);
      console.log("Generated token:", token); // Log token for debugging

      res.status(200).json({
        success: true,
        token,
        data: {
          _id: user._id,
          email: user.email,
          role: user.role,
          logo: user.logo,
          firstName: user.firstName,
          lastName: user.lastName,
          organizationType: user.organizationType,
          organizationName: user.organizationName,
          faculty: user.faculty,
          status: user.status,
          signature: user.signature
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


const getCurrentUser = async (req, res) => {
  try {
    // Extract the token from the authorization header
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Verify the token and get the user ID from it
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded._id;

    // Find the user by ID
    const user = await User.findById(userId).select('-password'); // Exclude password for security
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error getting current user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};



// Add user
const addUser = async (userData, logoUrl, signatureUrl) => {
  try {
    console.log('User Data:', userData);
    console.log('Logo URL:', logoUrl);
    console.log('Signature URL:', signatureUrl);

    if (!userData.email || !userData.password) throw new Error('Email and password are required');

    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) throw new Error('Email already exists');

    const newUser = new User({
      email: userData.email,
      password: userData.password,
      role: userData.role,
      status: 'Active',
      logo: logoUrl,
      signature: signatureUrl, // NEW: Store signature URL
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
    console.error('Error in addUser:', error); // Log the error
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

const getOrganizations = async (req, res) => {
  try {
    const organizations = await User.find({ role: 'Organization' });
    res.status(200).json(organizations);
  } catch (error) {
    console.error('Error fetching organizations:', error);
    res.status(500).json({ message: 'Error fetching organizations' });
  }
};


module.exports = { getUserById, updateUser, deleteUserById, addUser, login, getCurrentUser, getOrganizations };
