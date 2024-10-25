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
    // Upload file to Vercel Blob
    const fileBuffer = req.file.buffer;
    const fileName = req.file.originalname;
    const blob = await put(fileName, fileBuffer, { access: 'public' });

    // Pass the blob URL to your controller (or save it to the database)
    const blobUrl = blob.url;
    await addUser(req.body, blobUrl);  // Assuming addUser handles the user data and blob URL

    res.status(200).json({ message: 'User added successfully', blobUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error uploading file to Vercel Blob' });
  }
});

// Update user by ID
router.patch('/:id', updateUser);

// Delete user by ID
router.delete('/:id', deleteUserById);

module.exports = router;
