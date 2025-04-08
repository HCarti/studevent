const express = require('express');
const router = express.Router();
const multer = require('multer');
const { put } = require('@vercel/blob');
const { 
  addUser, 
  getUserById, 
  deleteUserById, 
  updateUser, 
  login, 
  getCurrentUser, 
  getOrganizations 
} = require('../controllers/usersController');
const authenticateToken = require('../middleware/authenticateToken');

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for files
    files: 2 // Maximum of 2 files (logo and signature)
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'signature') {
      if (!file.mimetype.match(/^image\/(png|jpeg|jpg)$/)) {
        return cb(new Error('Signature must be a PNG or JPEG image'), false);
      }
    } else if (file.fieldname === 'logo') {
      if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Logo must be an image file'), false);
      }
    }
    cb(null, true);
  }
});

// Error handling middleware for file uploads
const handleUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: err.message });
  } else if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
};

// Login route (unprotected)
router.post('/login', login);

// Protected routes with `authenticateToken`
router.get('/organizations', authenticateToken, getOrganizations);
router.get('/current', authenticateToken, getCurrentUser);
router.get('/:id', authenticateToken, getUserById);
router.delete('/:id', authenticateToken, deleteUserById);

// Update user with file upload support
router.patch('/:id', 
  authenticateToken,
  upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'signature', maxCount: 1 }]),
  handleUploadErrors,
  async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      let logoUrl, signatureUrl;

      // Handle logo upload if provided
      if (req.files?.logo) {
        const logoBlob = await put(
          `user-${id}-logo-${Date.now()}`,
          req.files.logo[0].buffer,
          { access: 'public' }
        );
        logoUrl = logoBlob.url;
        updateData.logo = logoUrl;
      }

      // Handle signature upload if provided
      if (req.files?.signature) {
        const signatureBlob = await put(
          `user-${id}-signature-${Date.now()}`,
          req.files.signature[0].buffer,
          { access: 'public' }
        );
        signatureUrl = signatureBlob.url;
        updateData.signature = signatureUrl;
      }

      const updatedUser = await updateUser({ 
        params: { id }, 
        body: updateData,
        files: req.files 
      });
      
      res.status(200).json(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ 
        message: 'Error updating user',
        error: error.message 
      });
    }
  }
);

// Add new user with file upload
router.post('/', 
  upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'signature', maxCount: 1 }]),
  handleUploadErrors,
  async (req, res) => {
    try {
      const { role } = req.body;
      
      // Validate required files
      if (!req.files?.logo || !req.files.logo[0]) {
        return res.status(400).json({ message: 'Logo is required' });
      }

      // Signature is required for Admin, Authority, and Organization
      if (!req.files?.signature || !req.files.signature[0]) {
        return res.status(400).json({ message: 'Signature is required' });
      }

      // Upload logo to Vercel Blob
      const logoBlob = await put(
        `user-logo-${Date.now()}`,
        req.files.logo[0].buffer,
        { access: 'public' }
      );

      // Upload signature to Vercel Blob
      const signatureBlob = await put(
        `user-signature-${Date.now()}`,
        req.files.signature[0].buffer,
        { access: 'public' }
      );

      // Validate role-specific requirements
      if (role === 'Organization' && !req.body.presidentName) {
        return res.status(400).json({ message: 'President name is required for organizations' });
      }

      if ((role === 'Admin' || role === 'Authority') && (!req.body.firstName || !req.body.lastName)) {
        return res.status(400).json({ 
          message: 'First name and last name are required for Admin and Authority roles' 
        });
      }

      // Add user with logo and signature URLs
      const newUser = await addUser(
        req.body, 
        logoBlob.url, 
        signatureBlob.url
      );

      res.status(201).json({ 
        message: 'User added successfully', 
        user: newUser 
      });
    } catch (error) {
      console.error('Error adding user:', error);
      res.status(500).json({ 
        message: 'Error adding user', 
        error: error.message 
      });
    }
  }
);

module.exports = router;