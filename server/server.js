const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet'); // <-- Added Helmet
const path = require('path');
const userRoutes = require('./routes/user_routes');
const formRoutes = require('./routes/formRoutes');
const emailRoutes = require('./routes/emailroutes');
const authenticateToken = require('./middleware/authenticateToken');
const notificationRoutes = require("./routes/notificationRoutes");
const eventTrackerRoutes = require('./routes/eventTrackerRoutes');
const calendarRoutes = require('./routes/calendarRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const liquidationRoutes = require('./routes/liquidationRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const localOffRoutes = require('./routes/localOffRoutes');

const app = express();

// Allowed Origins
const allowedOrigins = [
  'https://www.studevent.org',
  'http://localhost:3000',
  'https://studevent-server.vercel.app',
];

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Added Helmet security headers ---
app.use(helmet());

// Stronger Content-Security-Policy (adjust if needed for images/scripts)
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", 'https:', "'unsafe-inline'"], 
      styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
      imgSrc: ["'self'", 'https:', 'data:'],
      connectSrc: ["'self'", 'https:'],
      fontSrc: ["'self'", 'https:'],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  })
);

// Referrer Policy
app.use(
  helmet.referrerPolicy({
    policy: 'no-referrer-when-downgrade',
  })
);

// Permissions Policy (restrict features like camera/mic etc.)
app.use(
  helmet.permissionsPolicy({
    features: {
      geolocation: ["'none'"],
      microphone: ["'none'"],
      camera: ["'none'"],
    },
  })
);

// Frameguard (prevent clickjacking)
app.use(
  helmet.frameguard({ action: 'sameorigin' })
);

// No sniffing MIME types
app.use(helmet.noSniff());

// HSTS (Strict Transport Security already applied by your SSL, helmet will ensure it too)
app.use(
  helmet.hsts({
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  })
);

// CORS settings
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
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

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes 
app.use('/api/users', userRoutes);
app.use("/api", authenticateToken, notificationRoutes);
app.use('/api/calendar', authenticateToken, calendarRoutes);
app.use('/api/tracker', authenticateToken, eventTrackerRoutes);
app.use('/api/feedback', authenticateToken, feedbackRoutes);
app.use('/api/liquidation', authenticateToken, liquidationRoutes);
app.use('/api/forms', authenticateToken, formRoutes);
app.use('/api/budgets', authenticateToken, budgetRoutes);
app.use('/api/local-off-campus', authenticateToken, localOffRoutes);
app.use('/api', authenticateToken, emailRoutes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
