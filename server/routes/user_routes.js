const express = require('express');
const router = express.Router();
const multer = require('multer');
const { put } = require('@vercel/blob');
const { addUser, getUserById, deleteUserById, updateUser, login, getCurrentUser, getOrganizations } = require('../controllers/usersController');
const authenticateToken = require('../middleware/authenticateToken');

const upload = multer({ storage: multer.memoryStorage() });

// Login route (unprotected)
router.post('/login', login);

// Protected routes with `authenticateToken`
router.get('/organizations', authenticateToken, getOrganizations);
router.get('/', authenticateToken);
router.get('/current', authenticateToken, getCurrentUser);
router.get('/:id', authenticateToken, getUserById);
router.patch('/:id', authenticateToken, updateUser);
router.delete('/:id', authenticateToken, deleteUserById);

// Add new user with file upload (unprotected if intended to allow open registration)
router.post('/', upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'signature', maxCount: 1 }]), async (req, res) => {
  try {
    console.log('Request Body:', req.body); // Log the request body
    console.log('Request Files:', req.files); // Log the uploaded files

    const { logo, signature } = req.files;

    if (!logo || !logo[0]) return res.status(400).json({ message: 'Logo is required' });

    // Upload logo to Vercel Blob
    const logoBlob = await put(logo[0].originalname, logo[0].buffer, { access: 'public' });
    if (!logoBlob || !logoBlob.url) throw new Error('Failed to upload logo to Vercel Blob');

    // Upload signature to Vercel Blob (if provided)
    let signatureUrl = null;
    if (signature && signature[0]) {
      const signatureBlob = await put(signature[0].originalname, signature[0].buffer, { access: 'public' });
      if (!signatureBlob || !signatureBlob.url) throw new Error('Failed to upload signature to Vercel Blob');
      signatureUrl = signatureBlob.url;
    }

    // Add user with logo and signature URLs
    const newUser = await addUser(req.body, logoBlob.url, signatureUrl);
    res.status(200).json({ message: 'User added successfully', user: newUser });
  } catch (error) {
    console.error('Error in route:', error); // Log the full error
    res.status(500).json({ message: 'Error adding user', error: error.message });
  }
});
module.exports = router;