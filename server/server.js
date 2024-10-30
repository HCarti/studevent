const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/user_routes');
const formRoutes = require('./routes/formRoutes');
const trackerRoutes = require('./routes/trackerRoutes');
const eventRoutes = require('./routes/eventRoutes');
const Form = require('./models/Form');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// MongoDB connection
mongoose.connect("mongodb+srv://StudEvent:StudEvent2024@studevent.nvsci.mongodb.net/", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.error('MongoDB Connection Error:', err));

// JWT Middleware to protect routes
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ message: 'No token provided' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Failed to authenticate token' });
    req.user = user; // Set the decoded user info in the request
    next();
  });
};

// Serve static files from the 'uploads' folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes); // Login route that returns JWT
app.use('/api/users',  userRoutes); // Protect /users routes with JWT
app.use('/api/forms', formRoutes);
app.use('/api/trackers', trackerRoutes);
app.use('/api', eventRoutes);

// Fetch all submitted forms
app.get('/api/forms/submitted', authenticateToken, async (req, res) => {
  try {
    const forms = await Form.find();
    res.json(forms);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching forms' });
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
