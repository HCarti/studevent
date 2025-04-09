const User = require('../models/User');
const jwt = require('jsonwebtoken');


// Helper function to create JWT token
const createToken = (user) => {
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
      presidentName: user.presidentName || '',
      status: user.status || 'Active',
      logo: user.logo || '',
      signature: user.signature || '',
      presidentSignature: user.presidentSignature || '',
      presidentName: user.presidentName || ''
    },
    process.env.JWT_SECRET,
    { expiresIn: "3d" }
  );
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (password === user.password) {
      // Validate role-specific fields
      if (user.role === 'Admin' || user.role === 'Authority') {
        if (!user.firstName || !user.lastName || !user.signature) {
          return res.status(400).json({ 
            message: 'First name, last name, and signature are required for Admin and Authority roles.' 
          });
        }
      }

      if (user.role === 'Authority' && !user.faculty) {
        return res.status(400).json({ message: 'Faculty is required for Authority roles.' });
      }

      if (user.role === 'Organization') {
        if (!user.organizationType || !user.organizationName || !user.presidentName || !user.presidentSignature) {
          return res.status(400).json({ 
            message: 'Organization type, name, president name, and president signature are required for Organization roles.' 
          });
        }
      }

      const token = createToken(user);
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
          presidentName: user.presidentName,
          faculty: user.faculty,
          status: user.status,
          signature: user.role === 'Organization' ? user.presidentSignature : user.signature
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
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded._id;

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      ...user.toObject(),
      signature: user.role === 'Organization' ? user.presidentSignature : user.signature
    });
  } catch (error) {
    console.error('Error getting current user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add user with dual signature handling
const addUser = async (userData, logoUrl, signatureUrl, presidentSignatureUrl) => {
  try {
    if (!userData.email || !userData.password) {
      throw new Error('Email and password are required');
    }

    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) throw new Error('Email already exists');

    const newUser = new User({
      email: userData.email,
      password: userData.password,
      role: userData.role,
      status: 'Active',
      logo: logoUrl,
    });

    // Handle role-specific fields
    if (userData.role === 'Authority') {
      newUser.firstName = userData.firstName;
      newUser.lastName = userData.lastName;
      newUser.faculty = userData.faculty;
      newUser.signature = signatureUrl;
    } else if (userData.role === 'Admin') {
      newUser.firstName = userData.firstName;
      newUser.lastName = userData.lastName;
      newUser.signature = signatureUrl;
    } else if (userData.role === 'Organization') {
      newUser.organizationType = userData.organizationType;
      newUser.organizationName = userData.organizationName;
      newUser.presidentName = userData.presidentName;
      newUser.presidentSignature = presidentSignatureUrl;
    }

    await newUser.save();
    return newUser;
  } catch (error) {
    console.error('Error in addUser:', error);
    throw error;
  }
};

// Update user with dual signature handling
const updateUser = async (req, res) => {
  const userId = req.params.id;
  const updatedData = req.body;

  try {
    // Handle file uploads if provided
    if (req.files) {
      if (req.files.logo) {
        const logoBlob = await put(
          `user-${userId}-logo-${Date.now()}`,
          req.files.logo[0].buffer,
          { access: 'public' }
        );
        updatedData.logo = logoBlob.url;
      }

      if (req.files.signature) {
        const signatureBlob = await put(
          `user-${userId}-sig-${Date.now()}`,
          req.files.signature[0].buffer,
          { access: 'public' }
        );
        updatedData.signature = signatureBlob.url;
      }

      if (req.files.presidentSignature) {
        const presidentSigBlob = await put(
          `user-${userId}-presig-${Date.now()}`,
          req.files.presidentSignature[0].buffer,
          { access: 'public' }
        );
        updatedData.presidentSignature = presidentSigBlob.url;
      }
    }

    const user = await User.findByIdAndUpdate(userId, updatedData, { 
      new: true,
      runValidators: true 
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({
      ...user.toObject(),
      signature: user.role === 'Organization' ? user.presidentSignature : user.signature
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({
      ...user.toObject(),
      signature: user.role === 'Organization' ? user.presidentSignature : user.signature
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete user by ID
const deleteUserById = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user' });
  }
};

// Get all organizations with their president signatures
const getOrganizations = async (req, res) => {
  try {
    const organizations = await User.find({ role: 'Organization' })
      .select('organizationName organizationType presidentName presidentSignature status logo');
    res.status(200).json(organizations);
  } catch (error) {
    console.error('Error fetching organizations:', error);
    res.status(500).json({ message: 'Error fetching organizations' });
  }
};

module.exports = { 
  getUserById, 
  updateUser, 
  deleteUserById, 
  addUser, 
  login, 
  getCurrentUser, 
  getOrganizations 
};