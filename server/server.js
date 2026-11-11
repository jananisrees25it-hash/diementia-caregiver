const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const { connectDB, getDBMode } = require('./config/db');
const { initDataService } = require('./services/dataService');

// Route handlers
const authRoutes = require('./routes/authRoutes');
const reminderRoutes = require('./routes/reminderRoutes');
const scoreRoutes = require('./routes/scoreRoutes');
const noteRoutes = require('./routes/noteRoutes');
const patientRoutes = require('./routes/patientRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for seamless development and testing
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger for debugging
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[API] ${req.method} ${req.url}`);
  }
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    appName: 'AI-Powered Cognitive Support & Caregiver Assistance',
    version: '1.0.0',
    dbMode: getDBMode(),
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/scores', scoreRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/patients', patientRoutes);

// 404 Handler for undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: 'API route not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err.stack || err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start Server and Initialize Database
const startServer = async () => {
  try {
    await connectDB();
    await initDataService();

    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(` Cognitive Support & Caregiver Assistance API Running!`);
      console.log(` Port:    http://localhost:${PORT}`);
      console.log(` Health:  http://localhost:${PORT}/api/health`);
      console.log(` DB Mode: ${getDBMode()}`);
      console.log(`=======================================================`);
    });
  } catch (error) {
    console.error('Fatal initialization error:', error);
  }
};

startServer();
