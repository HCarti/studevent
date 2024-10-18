const express = require('express');
const router = express.Router();
const multer = require('multer');
const { addUser, getUsers, getUserById, deleteUserById, updateUser } = require('../controllers/usersController');

// Set up multer for file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Destination folder
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Unique file name
  },
});
const upload = multer({ storage: storage });

// Get all users
router.get('/', getUsers);

// Get user by ID
router.get('/:id', getUserById);

// Add new user (POST request)
router.post('/', upload.single('logo'), addUser); // Use multer middleware for file upload

// Update user by ID
router.patch('/:id', updateUser);

// Delete user by ID
router.delete('/:id', deleteUserById);

module.exports = router;
