const express = require('express');
const router = express.Router();
const liquidationController = require('../controllers/liquidationController');
const { blobUploadMiddleware } = require('../middleware/blobMiddleware'); // New!

// Since we're using Vercel Blob, we need a custom middleware
router.post('/submit', 
  blobUploadMiddleware.single('file'), // Custom middleware
  liquidationController.submitLiquidation
);

router.get('/', liquidationController.getLiquidations);
router.get('/:id/url', liquidationController.getFileUrl); // Changed endpoint
router.patch('/:id/status', liquidationController.updateLiquidationStatus);

module.exports = router;