const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const userRoutes = require('./routes/user_routes');
const formRoutes = require('./routes/formRoutes');
const emailRoutes = require('./routes/emailroutes'); // Import the email routes
const authenticateToken = require('./middleware/authenticateToken');
const notificationRoutes = require("./routes/notificationRoutes"); // Import the route
const eventTrackerRoutes = require('./routes/eventTrackerRoutes');
const calendarRoutes = require('./routes/calendarRoutes'); // Import the calendar routes
const feedbackRoutes = require('./routes/feedbackRoutes');

const app = express();

const allowedOrigins = [
  'https://www.studevent.org',
  'http://localhost:3000',
  'https://studevent-server.vercel.app',
];

console.log('JWT_SECRET:', process.env.JWT_SECRET);



// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true, // Allow cookies if needed
    allowedHeaders: ['Authorization', 'Content-Type'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  })
);

// MongoDB connection
mongoose
  .connect("mongodb+srv://StudEvent:StudEvent2024@studevent.nvsci.mongodb.net/", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.error('MongoDB Connection Error:', err));

// Serve static files from the 'uploads' folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes 
app.use('/api/users', userRoutes); // Do not apply authenticateToken here
app.use("/api", authenticateToken, notificationRoutes); // Apply it
app.use('/api/calendar', authenticateToken, calendarRoutes);
app.use('/api/tracker', authenticateToken, eventTrackerRoutes);
app.use('/api/feedback', authenticateToken, feedbackRoutes);
app.use('/api/forms', authenticateToken, formRoutes);
app.use('/api', authenticateToken, emailRoutes); // Protect specific routes

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
