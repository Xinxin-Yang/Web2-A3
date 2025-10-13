const express = require('express');
const cors = require('cors');
const eventsRouter = require('./events');
const { connectDB } = require('./database/event_db');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Test database connection on startup
connectDB().then(success => {
  if (success) {
    console.log('Database connection established');
  } else {
    console.log('Failed to connect to database');
  }
});

// Routes
app.use('/api/events', eventsRouter);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const dbStatus = await connectDB();
    res.json({ 
      status: 'API is running', 
      database: dbStatus ? 'Connected' : 'Disconnected',
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'API error', 
      error: error.message 
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Charity Events API Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Events API: http://localhost:${PORT}/api/events`);
});