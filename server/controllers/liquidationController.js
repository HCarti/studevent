const Liquidation = require('../models/Liquidation');
const { put } = require('@vercel/blob');

// Submit liquidation file (Vercel Blob version)
const Liquidation = require('../models/Liquidation');
const { put } = require('@vercel/blob');

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

    // Save to database
    const newLiquidation = await Liquidation.create({
      organization: req.body.organization || 'Unknown Organization', // Provide default
      fileName: req.file.originalname,
      fileUrl: blob.url,
      submittedBy: req.user?.id,
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
exports.getLiquidations = async (req, res) => {
  try {
    const liquidations = await Liquidation.find().sort({ createdAt: -1 }); // Fixed typo
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