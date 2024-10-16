const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/user_routes');
const formRoutes = require('./routes/formRoutes');
const Form = require('./models/Form'); // Import your Form model

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Specify extended for parsing
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb+srv://StudEvent:StudEvent2024@studevent.nvsci.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.error('MongoDB Connection Error:', err));

// Serve static files from the 'uploads' folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/forms', formRoutes);
app.get('/api/forms/submitted', async (req, res) => {
  try {
    const forms = await Form.find(); // Fetch all forms from the database
    res.json(forms); // Return the fetched forms
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching forms' });
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
