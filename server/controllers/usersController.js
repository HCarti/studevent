const User = require('../models/User');
const jwt = require('jsonwebtoken');
const logSuperAdminAction = require('../utils/activityLogger');


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
      presidentName: user.presidentName || '',
      organization: user.organization || '',
      deanForOrganization: user.deanForOrganization || '',
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

    // Create the new user
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

    // Save the user first to get the _id
    await newUser.save();

    // Log the action if created by SuperAdmin
    if (userData.requestingUser && userData.requestingUser.role === 'SuperAdmin') {
      await logSuperAdminAction(
        {
          _id: userData.requestingUser._id,
          email: userData.requestingUser.email,
          role: userData.requestingUser.role
        },
        'USER_CREATED',
        {
          _id: newUser._id,
          email: newUser.email,
          role: newUser.role
        },
        {
          status: newUser.status
        }
      );
    }

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


       // Log the action if performed by SuperAdmin
       if (req.user.role === 'SuperAdmin') {
        await logSuperAdminAction(
          req.user,
          'USER_UPDATED',
           user,
          { changedFields }
        );
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
    const user = await User.findById(req.params.id)
      .select('firstName lastName email role faculty organization signature presidentSignature')
      .lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      faculty: user.faculty,
      organization: user.organization,
      signature: user.role === 'Organization' ? user.presidentSignature : user.signature
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete user by ID
const deleteUserById = async (req, res) => {
  try {
    console.log(`Attempting to soft delete user: ${req.params.id}`);
    
    const userToDelete = await User.findById(req.params.id);
    
    if (!userToDelete) {
      console.log('User not found');
      return res.status(404).json({ 
        success: false,
        message: 'User not found',
        id: req.params.id
      });
    }

    console.log('User found, proceeding with soft delete');
    
    const result = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date(),
          status: 'Inactive'
        }
      },
      { new: true }
    );

    if (!result) {
      console.log('Update operation failed');
      return res.status(500).json({ 
        success: false,
        message: 'Failed to update user status'
      });
    }

    console.log('Soft delete successful');
    
    if (req.user.role === 'SuperAdmin') {
      await logSuperAdminAction(
        req.user,
        'USER_SOFT_DELETED',
        null,
        {
          email: userToDelete.email,
          role: userToDelete.role
        }
      );
    }

    res.status(200).json({ 
      success: true,
      message: 'User moved to trash successfully',
      data: {
        id: result._id,
        email: result.email,
        isDeleted: result.isDeleted,
        deletedAt: result.deletedAt
      }
    });
  } catch (error) {
    console.error('Error in deleteUserById:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error moving user to trash',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
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
  const { email, organizationType, status, password } = req.body;

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
    
    // Update password if provided (and meets length requirement)
    if (password && password.length >= 6) {
      organization.password = password;
    } else if (password && password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    await organization.save();

    // Log the action if performed by SuperAdmin
    if (req.user.role === 'SuperAdmin') {
      const changedFields = {
        email: email,
        status: status
      };
      if (organizationType) changedFields.organizationType = organizationType;
      if (password) changedFields.password = 'updated'; // Don't log actual password

      await logSuperAdminAction(
        req.user,
        'ORGANIZATION_UPDATED',
        organization,
        changedFields
      );
    }

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
    const userId = req.user._id;
    
    // Debugging logs - critical for troubleshooting
    console.log('Request body fields:', {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email
    });
    console.log('Uploaded file:', req.file ? 'Exists' : 'None');

    // Get current user data
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create update object - use provided values or current ones
    const updateData = {
      firstName: req.body.firstName || currentUser.firstName,
      lastName: req.body.lastName || currentUser.lastName,
      email: req.body.email || currentUser.email
    };

    // Handle image upload if present
    if (req.file) {
      const imageBlob = await put(
        `user-${Date.now()}-profile`,
        req.file.buffer,
        { access: 'public' }
      );
      updateData.image = imageBlob.url;
    }

    // Perform the update
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(400).json({ message: 'Update failed' });
    }

    // Return the complete updated user data
    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ 
      message: 'Server error during update',
      error: error.message 
    });
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

// Add this new method for permanent deletion
const permanentlyDeleteUser = async (req, res) => {
  try {
    const userToDelete = await User.findById(req.params.id);
    
    if (!userToDelete) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.findByIdAndDelete(req.params.id);

    // Log the action if performed by SuperAdmin
    if (req.user.role === 'SuperAdmin') {
      await logSuperAdminAction(
        req.user,
        'USER_PERMANENTLY_DELETED',
        null,
        {
          email: userToDelete.email,
          role: userToDelete.role
        }
      );
    }

    res.status(200).json({ message: 'User permanently deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error permanently deleting user' });
  }
};

// Add this new method for restoring from trash
const restoreUser = async (req, res) => {
  try {
    console.log(`Attempting to restore user: ${req.params.id}`);
    
    const userToRestore = await User.findById(req.params.id);
    
    if (!userToRestore) {
      console.log('User not found for restoration');
      return res.status(404).json({ 
        success: false,
        message: 'User not found',
        id: req.params.id
      });
    }

    console.log('User found, proceeding with restoration');
    
    // Update the user document
    const result = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          isDeleted: false,
          deletedAt: null,
          status: 'Active' // Optionally set status back to Active
        }
      },
      { new: true }
    );

    if (!result) {
      console.log('Restoration update failed');
      return res.status(500).json({ 
        success: false,
        message: 'Failed to update user status during restoration'
      });
    }

    console.log('Restoration successful');
    
    // Log the action if performed by SuperAdmin
    if (req.user.role === 'SuperAdmin') {
      await logSuperAdminAction(
        req.user,
        'USER_RESTORED',
        result, // Use the updated document
        {
          email: result.email,
          role: result.role,
          restoredAt: new Date()
        }
      );
    }

    res.status(200).json({ 
      success: true,
      message: 'User restored successfully',
      data: {
        id: result._id,
        email: result.email,
        isDeleted: result.isDeleted,
        status: result.status
      }
    });
  } catch (error) {
    console.error('Error in restoreUser:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error restoring user',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
// Get deleted organizations (for TrashBin)
const getDeletedOrganizations = async (req, res) => {
  try {
    const organizations = await User.find({ 
      role: 'Organization',
      isDeleted: true
    }).select('organizationName organizationType presidentName presidentSignature status logo email deletedAt');
    
    res.status(200).json(organizations);
  } catch (error) {
    console.error('Error fetching deleted organizations:', error);
    res.status(500).json({ message: 'Error fetching deleted organizations' });
  }
};

// Get organizations for a specific user (dean or adviser)
const getUserOrganizations = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    let organizations = [];
    
    if (user.role === 'Adviser') {
      // Return the single organization the adviser is assigned to
      organizations = await User.find({
        organizationName: user.organization,
        role: 'Organization'
      }).select('organizationName');
    } 
    else if (user.role === 'Dean') {
      // Return all academic organizations in the dean's faculty
      organizations = await User.find({
        organizationType: 'Recognized Student Organization - Academic',
        faculty: user.faculty
      }).select('organizationName');
    }

    res.status(200).json(organizations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAcademicOrganizationsByFaculty = async (req, res) => {
  try {
    const { faculty } = req.query;
    const organizations = await User.find({
      organizationType: 'Recognized Student Organization - Academic',
      faculty: faculty
    }).select('organizationName');
    
    res.status(200).json(organizations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
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
  changePassword,
  permanentlyDeleteUser,
  restoreUser,
  getDeletedOrganizations,
  getUserOrganizations, 
  getAcademicOrganizationsByFaculty
};