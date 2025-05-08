const express = require('express');
const router = express.Router();
const liquidationController = require('../controllers/liquidationController');
const { blobUploadMiddleware } = require('../middleware/blobMiddleware'); // New!
const Liquidation = require('../models/Liquidation'); // Assuming you have a Liquidation model
const Notification = require('../models/Notification');

// Since we're using Vercel Blob, we need a custom middleware
router.post('/submit', 
  blobUploadMiddleware.single('file'), // Custom middleware
  liquidationController.submitLiquidation
);

router.get('/', liquidationController.getLiquidations);
router.get('/:id/url', liquidationController.getFileUrl); // Changed endpoint
router.patch('/:id/status', liquidationController.updateLiquidationStatus);

// In your liquidationRoutes.js
router.get('/my-submissions', async (req, res) => {
  try {
    const liquidations = await Liquidation.find({ 
      submittedBy: req.user.id 
    }).sort({ createdAt: -1 });
    
    res.json({ 
      success: true, 
      data: liquidations 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch submissions',
      error: error.message 
    });
  }
});

// In your liquidationRoutes.js
router.post('/resubmit', authenticateToken, blobUploadMiddleware.single('file'), async (req, res) => {
  try {
    const { liquidationId, remarks, resetStatus } = req.body;
    let updateData = { 
      remarks,
      status: 'Pending', // Always set to pending on resubmit
      updatedAt: new Date()
    };
    
    // Handle file upload if present
    if (req.file) {
      const blob = await put(req.file.originalname, req.file.buffer, {
        access: 'public',
        contentType: req.file.mimetype,
      });
      updateData.fileName = req.file.originalname;
      updateData.fileUrl = blob.url;
    }

    const updatedLiquidation = await Liquidation.findByIdAndUpdate(
      liquidationId,
      updateData,
      { new: true }
    ).populate('submittedBy', 'email organizationName');

    if (!updatedLiquidation) {
      return res.status(404).json({
        success: false,
        message: 'Liquidation not found'
      });
    }

    // Create notification for admin
    await Notification.create({
      userEmail: 'nnnavarro@nu-moa.edu.ph',
      message: `Liquidation ${req.file ? 'file and ' : ''}was resubmitted by ${updatedLiquidation.submittedBy.organizationName}`,
      type: 'liquidation',
      read: false
    });

    res.json({
      success: true,
      message: 'Liquidation resubmitted successfully',
      data: updatedLiquidation
    });
  } catch (error) {
    console.error('Resubmission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resubmit liquidation',
      error: error.message
    });
  }
});

module.exports = router;