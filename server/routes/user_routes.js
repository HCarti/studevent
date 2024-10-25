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

    // Log details for debugging
    console.log('Uploading file:', fileName);

    const blob = await put(fileName, fileBuffer, { access: 'public' });

    // Ensure blob URL exists
    if (!blob || !blob.url) {
      throw new Error('Failed to upload to Vercel Blob');
    }

    const blobUrl = blob.url;
    console.log('File uploaded to Vercel Blob:', blobUrl);

    // Pass the blob URL to your controller (or save it to the database)
    await addUser(req.body, blobUrl); // Assuming addUser handles the user data and blob URL

    res.status(200).json({ message: 'User added successfully', blobUrl });
  } catch (error) {
    // Detailed error logging
    console.error('Error during file upload:', error.message, error.stack);
    
    // Respond with a 500 error and the error message
    res.status(500).json({ message: 'Error uploading file to Vercel Blob', error: error.message });
  }
});

// Update user by ID
router.patch('/:id', updateUser);

// Delete user by ID
router.delete('/:id', deleteUserById);

module.exports = router;
