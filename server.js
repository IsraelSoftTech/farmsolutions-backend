const express = require('express');
const cors = require('cors');
require('dotenv').config();
const config = require('./config/config');

// Initialize database connection
require('./config/database');

const app = express();
const PORT = config.port;

// Middleware
app.use(cors({
  origin: config.cors.origin,
  credentials: config.cors.credentials,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically (if needed)
app.use('/uploads', express.static('uploads'));

// Import routes
const apiRoutes = require('./routes/index');

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Farmers Solutions API Server',
    version: '1.0.0',
    status: 'running',
    environment: config.nodeEnv,
    apiUrl: `${req.protocol}://${req.get('host')}${config.apiPrefix}`,
  });
});

// API Routes
app.use(config.apiPrefix, apiRoutes);

// API Routes (to be expanded)
app.get(`${config.apiPrefix}/products`, (req, res) => {
  res.json({ 
    message: 'Products endpoint - coming soon',
    products: []
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.path 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 API available at http://localhost:${PORT}`);
});
