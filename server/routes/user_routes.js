const express = require('express');
const router = express.Router();
const multer = require('multer');
const { put } = require('@vercel/blob');
const { addUser, getUserById, deleteUserById, updateUser, login, getCurrentUser} = require('../controllers/usersController');
const authenticateToken = require('../middleware/authenticateToken');

const upload = multer({ storage: multer.memoryStorage() });

// Login route (unprotected)
router.post('/login', login);

// Protected routes with `authenticateToken`
router.get('/organizations', authenticateToken);  
router.get('/', authenticateToken);
router.get('/current', authenticateToken, getCurrentUser);
router.get('/:id', authenticateToken, getUserById);
router.patch('/:id', authenticateToken, updateUser);
router.delete('/:id', authenticateToken, deleteUserById);

// Add new user with file upload (unprotected if intended to allow open registration)
router.post('/', upload.single('logo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const fileBuffer = req.file.buffer;
    const fileName = req.file.originalname;
    const blob = await put(fileName, fileBuffer, { access: 'public' });

    if (!blob || !blob.url) throw new Error('Failed to upload to Vercel Blob');

    const blobUrl = blob.url;
    const newUser = await addUser(req.body, blobUrl);
    res.status(200).json({ message: 'User added successfully', user: newUser });
  } catch (error) {
    res.status(500).json({ message: 'Error adding user', error: error.message });
  }
});

module.exports = router;
