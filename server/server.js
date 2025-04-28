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
const liquidationRoutes = require('./routes/liquidationRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const localOffRoutes = require('./routes/localOffRoutes'); // Import the local off-campus routes

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
    origin: allowedOrigins, // Already defined in your code
    credentials: true,
    allowedHeaders: ['Authorization', 'Content-Type'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    // Optional: Set CORS headers explicitly
    exposedHeaders: ['Content-Security-Policy', 'Strict-Transport-Security']
  })
);

// Add this right after app.use(cors(...));
app.use((req, res, next) => {
  // 🔒 Security Headers
  res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-src 'none'; object-src 'none'");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=(), payment=()");
  res.setHeader("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  
  // 🛡️ Hide server info (replace/remove 'Vercel' in raw headers)
  res.removeHeader("X-Powered-By"); // Express default
  next();
});

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
app.use('/api/liquidation', authenticateToken, liquidationRoutes);
app.use('/api/forms', authenticateToken, formRoutes);
app.use('/api/budgets',authenticateToken, budgetRoutes);
app.use('/api/local-off-campus',authenticateToken, localOffRoutes);
app.use('/api', authenticateToken, emailRoutes); // Protect specific routes

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
