const express = require('express');
const router = express.Router();
const multer = require('multer');
const { put } = require('@vercel/blob');
const { addUser, getUsers, getUserById, deleteUserById, updateUser } = require('../controllers/usersController');

// Use memoryStorage for multer to handle file buffer
const upload = multer({ storage: multer.memoryStorage() });

// Get all users
router.get('/', getUsers);

// Get user by ID
router.get('/:id', getUserById);

// Add new user (POST request) with file upload to Vercel Blob
router.post('/', upload.single('logo'), async (req, res) => {
  try {
    // Check if file is provided
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Upload file to Vercel Blob
    const fileBuffer = req.file.buffer;
    const fileName = req.file.originalname;
    const blob = await put(fileName, fileBuffer, { access: 'public' });

    if (!blob || !blob.url) {
      throw new Error('Failed to upload to Vercel Blob');
    }

    const blobUrl = blob.url;
    console.log('File uploaded to Vercel Blob:', blobUrl);

    // Pass the request body and blob URL to addUser function
    const newUser = await addUser(req.body, blobUrl);

    res.status(200).json({ message: 'User added successfully', user: newUser });
  } catch (error) {
    console.error('Error during user creation:', error.message);
    res.status(500).json({ message: 'Error adding user', error: error.message });
  }
});

// Update user by ID
router.patch('/:id', updateUser);

// Delete user by ID
router.delete('/:id', deleteUserById);

module.exports = router;
