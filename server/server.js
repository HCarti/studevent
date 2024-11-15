const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
// const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/user_routes');
const formRoutes = require('./routes/formRoutes');
const progressTrackerRoutes = require('./routes/progressTrackerRoutes');
const eventRoutes = require('./routes/eventRoutes');
const Form = require('./models/Form');
const authenticateToken = require('./middleware/authenticateToken');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: 'http://localhost:3000' })); // Update if frontend is deployed elsewhere

// MongoDB connection
mongoose.connect("mongodb+srv://StudEvent:StudEvent2024@studevent.nvsci.mongodb.net/", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.error('MongoDB Connection Error:', err));

// Serve static files from the 'uploads' folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
// app.use('/api/auth', authRoutes); // Login route (removed)
app.use('/api/users', authenticateToken, userRoutes); // Protect userRoutes with JWT
app.use('/api/forms', formRoutes);
app.use('/api/trackers', progressTrackerRoutes);
app.use('/api', eventRoutes);

// Example route without JWT protection
// app.get('/api/forms/submitted', async (req, res) => {
//   try {
//     const forms = await Form.find();
//     res.json(forms);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Error fetching forms' });
//   }
// });

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
