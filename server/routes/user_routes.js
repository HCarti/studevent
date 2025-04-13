const express = require('express');
const router = express.Router();
const multer = require('multer');
const { put } = require('@vercel/blob');
const usersController = require('../controllers/usersController');
const authenticateToken = require('../middleware/authenticateToken');

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 3 // logo + signature + presidentSignature
  },
  fileFilter: (req, file, cb) => {
    if (['signature', 'presidentSignature'].includes(file.fieldname)) {
      if (!file.mimetype.match(/^image\/(png|jpeg|jpg)$/)) {
        return cb(new Error('Signatures must be PNG or JPEG images'), false);
      }
    } else if (file.fieldname === 'logo') {
      if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Logo must be an image file'), false);
      }
    }
    cb(null, true);
  }
});

// Error handling middleware
const handleUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: err.message });
  } else if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
};

// Login route (unprotected)
router.post('/login', usersController.login);

// Protected routes
router.get('/organizations', authenticateToken, usersController.getOrganizations);
router.get('/current', authenticateToken, usersController.getCurrentUser);
router.get('/:id', authenticateToken, usersController.getUserById);
router.delete('/:id', authenticateToken, usersController.deleteUserById);

// User registration route with dual signature support
router.post('/', 
  upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'signature', maxCount: 1 },
    { name: 'presidentSignature', maxCount: 1 }
  ]),
  handleUploadErrors,
  async (req, res) => {
    try {
      const { role } = req.body;
      
      // Validate required files
      if (!req.files?.logo) {
        return res.status(400).json({ message: 'Logo is required' });
      }

      // Role-specific signature validation
      if (role === 'Organization') {
        if (!req.files?.presidentSignature) {
          return res.status(400).json({ message: 'President signature is required for organizations' });
        }
      } else if (role === 'Admin' || role === 'Authority') {
        if (!req.files?.signature) {
          return res.status(400).json({ message: 'Signature is required for admin/authority users' });
        }
      }

      // Upload logo
      const logoBlob = await put(
        `user-${Date.now()}-logo`,
        req.files.logo[0].buffer,
        { access: 'public' }
      );

      // Upload appropriate signature(s)
      let signatureUrl, presidentSignatureUrl;
      
      if (role === 'Organization') {
        const presidentSigBlob = await put(
          `org-${Date.now()}-presig`,
          req.files.presidentSignature[0].buffer,
          { access: 'public' }
        );
        presidentSignatureUrl = presidentSigBlob.url;
      } else {
        const sigBlob = await put(
          `user-${Date.now()}-sig`,
          req.files.signature[0].buffer,
          { access: 'public' }
        );
        signatureUrl = sigBlob.url;
      }

      // Create user
      const newUser = await usersController.addUser(
        req.body,
        logoBlob.url,
        signatureUrl,
        presidentSignatureUrl
      );

      res.status(201).json({
        message: 'User created successfully',
        user: {
          ...newUser.toObject(),
          signature: role === 'Organization' ? presidentSignatureUrl : signatureUrl
        }
      });
    } catch (error) {
      console.error('User creation error:', error);
      res.status(500).json({ 
        message: 'User creation failed',
        error: error.message 
      });
    }
  }
);

// Update user route with dual signature support
router.patch('/:id',
  authenticateToken,
  upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'signature', maxCount: 1 },
    { name: 'presidentSignature', maxCount: 1 }
  ]),
  handleUploadErrors,
  usersController.updateUser
);

module.exports = router;