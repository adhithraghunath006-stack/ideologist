
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase } = require('./models/initDb');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const ideaRoutes = require('./routes/ideaRoutes');
const investorRoutes = require('./routes/investorRoutes');
const pitchEventRoutes = require('./routes/pitchEventRoutes');
const adminRoutes = require('./routes/adminRoutes');
const locationRoutes = require('./routes/locationRoutes');

// TEMPORARY: Admin account recovery route
const recoveryRoutes = require('./routes/recoveryRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize database schema on boot
initDatabase();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-recovery-key']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Controlled static serving for uploads if needed
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'Ideologist API',
    tagline: 'From an idea to an opportunity',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/ideas', ideaRoutes);
app.use('/api/investor', investorRoutes);
app.use('/api/pitch-events', pitchEventRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/locations', locationRoutes);

// TEMPORARY: Remove this route after successful recovery
app.use('/api/recovery', recoveryRoutes);

// 404 handler
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.originalUrl} not found.`
  });
});

// Centralized error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log('====================================================');
  console.log(`🚀 Ideologist Backend running on port ${PORT}`);
  console.log(`📊 Health Check: /api/health`);
  console.log('====================================================');
});
