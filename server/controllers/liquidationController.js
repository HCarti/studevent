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

    // Find and update the liquidation, populating the submitter's details
   // Update this line in your controller
    const updatedLiquidation = await Liquidation.findByIdAndUpdate(
      id,
      { status, remarks },
      { new: true }
    ).populate('submittedBy', 'email organizationName role'); // Add role to the population

    if (!updatedLiquidation) {
      return res.status(404).json({
        success: false,
        message: 'Liquidation not found'
      });
    }

    // Create notification for the submitter (organization)
    if (updatedLiquidation.submittedBy) {
      let recipientEmail = updatedLiquidation.submittedBy.email;
      let recipientName = '';
      
      // Handle organization vs individual users differently
      if (updatedLiquidation.submittedBy.role === 'Organization') {
        recipientName = updatedLiquidation.submittedBy.organizationName || 'Your Organization';
      } else {
        // For other roles (Admin, Authority, etc.)
        recipientName = updatedLiquidation.submittedBy.firstName || 'User';
      }

      const message = `${recipientName}, your liquidation "${updatedLiquidation.fileName}" has been ${status}.` + 
                    (remarks ? `\nRemarks: ${remarks}` : '');

      await Notification.create({
        userEmail: recipientEmail,
        message: message,
        type: 'liquidation',
        read: false,
        organizationId: updatedLiquidation.submittedBy._id
      });

      console.log(`Notification created for ${recipientEmail}`);
    }

    // Create notification for the submitter (organization)
    if (updatedLiquidation.submittedBy) {
      const submitterEmail = updatedLiquidation.submittedBy.email;
      const message = `Your liquidation "${updatedLiquidation.fileName}" has been ${status}.` + 
                     (remarks ? `\nRemarks: ${remarks}` : '');

      await Notification.create({
        userEmail: submitterEmail,
        message: message,
        type: 'liquidation',
        read: false,
        organizationId: updatedLiquidation.submittedBy._id
      });

      console.log(`Notification created for ${submitterEmail}`);
    } else {
      console.warn('No submitter found for liquidation:', updatedLiquidation._id);
    }

    // Create notification for admin (optional)
    const adminMessage = `Liquidation "${updatedLiquidation.fileName}" by ${updatedLiquidation.organization} has been ${status}`;
    await Notification.create({
      userEmail: 'nnnavarro@nu-moa.edu.ph', // Admin email
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