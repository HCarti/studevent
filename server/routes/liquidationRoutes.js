const express = require('express');
const router = express.Router();
const liquidationController = require('../controllers/liquidationController');
const { blobUploadMiddleware } = require('../middleware/blobMiddleware'); // New!
const Liquidation = require('../models/Liquidation'); // Assuming you have a Liquidation model

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

module.exports = router;