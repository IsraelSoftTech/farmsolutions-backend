const express = require('express');
const router = express.Router();
const contentRoutes = require('./content');

// Health check route
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Content management routes
router.use('/content', contentRoutes);

module.exports = router;
