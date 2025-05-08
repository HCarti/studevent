const Liquidation = require('../models/Liquidation');
const { put } = require('@vercel/blob');
const Notification = require('../models/Notification');
const User = require('../models/User');

exports.submitLiquidation = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }

    // Upload to Vercel Blob
    const blob = await put(req.file.originalname, req.file.buffer, {
      access: 'public',
      contentType: req.file.mimetype,
    });

    // In submitLiquidation controller
    const newLiquidation = await Liquidation.create({
      organization: req.body.organization || req.body.organizationName || 'Unknown Organization',
      fileName: req.file.originalname,
      fileUrl: blob.url,
      submittedBy: req.user?.id,
    });

    // Create notification for admin
    const adminEmail = 'nnnavarro@nu-moa.edu.ph'; // Replace with actual admin email or get from DB
    const notificationMessage = `New liquidation submitted by ${req.body.organizationName || 'Unknown Organization'}`;
    
    await Notification.create({
      userEmail: adminEmail,
      message: notificationMessage,
    });

    res.status(201).json({
      success: true,
      message: 'Liquidation submitted',
      data: newLiquidation,
    });
  } catch (error) {
    console.error('Submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};
// Get all liquidations
// controllers/liquidationController.js
exports.getLiquidations = async (req, res) => {
  try {
    const liquidations = await Liquidation.find()
      .sort({ createdAt: -1 })
      .populate('submittedBy', 'name email'); // Populate user details if needed
      
    res.json({ 
      success: true, 
      count: liquidations.length,
      data: liquidations 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch liquidations',
      error: error.message 
    });
  }
};

// Get file URL (no need for download endpoint with Vercel Blob)
exports.getFileUrl = async (req, res) => {
  try {
    const liquidation = await Liquidation.findById(req.params.id);
    if (!liquidation) {
      return res.status(404).json({ 
        success: false, 
        message: 'File not found' 
      });
    }
    res.json({ 
      success: true, 
      url: liquidation.fileUrl,
      fileName: liquidation.fileName 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get file URL',
      error: error.message 
    });
  }
};

// Add this new controller method
// controllers/liquidationController.js
exports.updateLiquidationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    // 1. First get the liquidation without population to see raw data
    const rawLiquidation = await Liquidation.findById(id);
    console.log('Raw liquidation before update:', {
      _id: rawLiquidation._id,
      submittedBy: rawLiquidation.submittedBy,
      organization: rawLiquidation.organization
    });

    // 2. Update and populate
    const updatedLiquidation = await Liquidation.findByIdAndUpdate(
      id,
      { status, remarks, updatedAt: new Date() }, // Add updatedAt
      { new: true }
    ).populate('submittedBy', 'email organizationName role');

    // 3. Fallback if population fails
    let submitter = updatedLiquidation.submittedBy;
    if (!submitter && rawLiquidation.submittedBy) {
      console.log('Population failed, manually fetching user...');
      submitter = await User.findById(rawLiquidation.submittedBy);
    }

    if (!submitter) {
      console.warn('No submitter found, using organization field as fallback');
      const message = `Liquidation "${updatedLiquidation.fileName}" by ${updatedLiquidation.organization} has been ${status}.` +
                     (remarks ? `\nRemarks: ${remarks}` : '');
      
      // Find organization user by name as fallback
      const orgUser = await User.findOne({
        role: 'Organization',
        organizationName: updatedLiquidation.organization
      });

      if (orgUser) {
        await Notification.create({
          userEmail: orgUser.email,
          message: message,
          type: 'liquidation',
          read: false,
          organizationId: orgUser._id
        });
        console.log('Fallback notification created using organization name match');
      } else {
        console.error('Could not find organization user:', updatedLiquidation.organization);
      }
    } else {
      // Normal notification flow
      const recipientName = submitter.role === 'Organization' 
        ? submitter.organizationName 
        : submitter.firstName || 'User';
      
      const message = `${recipientName}, your liquidation "${updatedLiquidation.fileName}" has been ${status}.` +
                     (remarks ? `\nRemarks: ${remarks}` : '');

      await Notification.create({
        userEmail: submitter.email,
        message: message,
        type: 'liquidation',
        read: false,
        organizationId: submitter._id
      });
      console.log('Standard notification created');
    }

    // Admin notification (unchanged)
    const adminMessage = `Liquidation "${updatedLiquidation.fileName}" by ${updatedLiquidation.organization} has been ${status}`;
    await Notification.create({
      userEmail: 'nnnavarro@nu-moa.edu.ph',
      message: adminMessage,
      type: 'liquidation',
      read: false
    });

    res.json({
      success: true,
      message: 'Liquidation status updated',
      data: updatedLiquidation
    });
  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update liquidation status',
      error: error.message
    });
  }
};