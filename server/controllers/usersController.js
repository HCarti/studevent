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
    { expiresIn: "1d" }
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
      if (user.role === 'SuperAdmin') {
        if (!user.firstName || !user.lastName) {
          return res.status(400).json({ 
            message: 'First name and last name are required for SuperAdmin.' 
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
          signature: user.signature,
          presidentSignature: user.presidentSignature
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
      
      if (userData.faculty === 'Adviser') {
        newUser.organization = userData.organization;
      }
      
      if (userData.faculty === 'Dean') {
        newUser.deanForOrganization = userData.deanForOrganization;
        newUser.organizationType = 'Recognized Student Organization - Academic';
      }
    } else if (userData.role === 'Admin') {
      newUser.firstName = userData.firstName;
      newUser.lastName = userData.lastName;
      newUser.signature = signatureUrl;
    } else if (userData.role === 'SuperAdmin') {
      newUser.firstName = userData.firstName;
      newUser.lastName = userData.lastName;
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
      .select('organizationName organizationType presidentName presidentSignature status logo email');
    res.status(200).json(organizations);
  } catch (error) {
    console.error('Error fetching organizations:', error);
    res.status(500).json({ message: 'Error fetching organizations' });
  }
};

// Get all academic organizations
const getAcademicOrganizations = async (req, res) => {
  try {
    const organizations = await User.find({ 
      role: 'Organization',
      organizationType: 'Recognized Student Organization - Academic'
    }).select('organizationName organizationType presidentName presidentSignature status logo');
    res.status(200).json(organizations);
  } catch (error) {
    console.error('Error fetching academic organizations:', error);
    res.status(500).json({ message: 'Error fetching academic organizations' });
  }
};

// Add this to usersController.js
const updateOrganization = async (req, res) => {
  const { id } = req.params;
  const { email, organizationType, status } = req.body;

  try {
    // Validate input
    if (!email || !status) {
      return res.status(400).json({ message: 'Email and status are required' });
    }

    // Find the organization
    const organization = await User.findOne({ 
      _id: id,
      role: 'Organization'
    });

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Update the organization
    organization.email = email;
    if (organizationType) organization.organizationType = organizationType;
    organization.status = status;

    await organization.save();

    res.status(200).json({
      message: 'Organization updated successfully',
      organization: {
        _id: organization._id,
        email: organization.email,
        organizationType: organization.organizationType,
        organizationName: organization.organizationName,
        status: organization.status,
        logo: organization.logo
      }
    });
  } catch (error) {
    console.error('Error updating organization:', error);
    res.status(500).json({ message: 'Error updating organization' });
  }
};

// Add this to your usersController.js
const getAllUsers = async (req, res) => {
  try {
    // Get query parameters for filtering (optional)
    const { role, status, faculty } = req.query;
    
    // Build the filter object
    const filter = {};
    if (role) filter.role = role;
    if (status) filter.status = status;
    if (faculty) filter.faculty = faculty;

    // Find users with optional filters
    const users = await User.find(filter)
      .select('-password') // Exclude passwords
      .lean(); // Convert to plain JavaScript objects

    // Transform the data to include appropriate signature based on role
    const transformedUsers = users.map(user => ({
      ...user,
      signature: user.role === 'Organization' ? user.presidentSignature : user.signature
    }));

    res.status(200).json({
      success: true,
      count: transformedUsers.length,
      data: transformedUsers
    });
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching users',
      error: error.message 
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id; // Get from authenticated token
    const { firstName, lastName, email } = req.body;

    // Basic validation
    if (!firstName || !lastName || !email) {
      return res.status(400).json({ message: 'First name, last name, and email are required' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName, email },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
};

// Change user password
const changePassword = async (req, res) => {
  try {
    const userId = req.user._id; // Get from authenticated token
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    if (currentPassword !== user.password) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Error changing password' });
  }
};

const checkAdviserAssignment = async (req, res) => {
  try {
      const { adviserId, organizationName } = req.body;
      
      const adviser = await User.findOne({
          _id: adviserId,
          role: "Authority",
          faculty: "Adviser",
          organization: organizationName,
          status: "Active"
      });

      res.status(200).json({
          isAssigned: !!adviser
      });
  } catch (error) {
      console.error("Error checking adviser assignment:", error);
      res.status(500).json({
          error: "Server error",
          details: error.message
      });
  }
};

module.exports = { 
  getUserById, 
  updateUser, 
  deleteUserById, 
  addUser, 
  login, 
  getCurrentUser, 
  getOrganizations,
  getAcademicOrganizations,
  updateOrganization,
  getAllUsers,
  updateProfile,
  checkAdviserAssignment,
  changePassword
};