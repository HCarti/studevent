const express = require('express');
const router = express.Router();
const multer = require('multer');
const { put } = require('@vercel/blob');
const { addUser, getUsers, getUserById, deleteUserById, updateUser, loginUser } = require('../controllers/usersController');

// Use memoryStorage for multer to handle file buffer
const upload = multer({ storage: multer.memoryStorage() });

// Login route
router.post('/login', loginUser);

// Get all users (protected)
router.get('/', getUsers);

// Get user by ID (protected)
router.get('/:id', getUserById);

// Add new user with file upload to Vercel Blob (protected)
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
// Update user by ID
router.patch('/:id', updateUser);

// Delete user by ID
router.delete('/:id', deleteUserById);

module.exports = router;
