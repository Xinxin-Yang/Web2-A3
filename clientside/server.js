const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4001;

// Set root directory
const rootDir = __dirname;

// Middleware: Log all requests (for debugging)
app.use((req, res, next) => {
  console.log(`Request: ${req.method} ${req.url}`);
  next();
});

// Set correct MIME types
app.use('*.css', (req, res, next) => {
  res.setHeader('Content-Type', 'text/css');
  next();
});

app.use('*.js', (req, res, next) => {
  res.setHeader('Content-Type', 'application/javascript');
  next();
});

// Static file serving configuration
app.use(express.static(rootDir, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));

// ==================== ROUTE CONFIGURATION ====================

// Main page routes
app.get('/', (req, res) => {
  console.log('Serving home.html');
  res.sendFile(path.join(rootDir, 'home', 'home.html'));
});

app.get('/search', (req, res) => {
  console.log('Serving search.html');
  res.sendFile(path.join(rootDir, 'search', 'search.html'));
});

app.get('/event-details', (req, res) => {
  console.log('Serving event-details.html');
  res.sendFile(path.join(rootDir, 'event-details', 'event-details.html'));
});

// Registration routes
app.get('/registration', (req, res) => {
  console.log('Serving registration-selection.html');
  res.sendFile(path.join(rootDir, 'registration', 'registration-selection.html'));
});

app.get('/registration/form', (req, res) => {
  console.log('Serving registration.html');
  res.sendFile(path.join(rootDir, 'registration', 'registration.html'));
});

// ==================== STATIC FILE ROUTES ====================

// Home page static files
app.get('/home.css', (req, res) => {
  res.sendFile(path.join(rootDir, 'home', 'home.css'));
});

app.get('/home.js', (req, res) => {
  res.sendFile(path.join(rootDir, 'home', 'home.js'));
});

// Search page static files
app.get('/search.css', (req, res) => {
  res.sendFile(path.join(rootDir, 'search', 'search.css'));
});

app.get('/search.js', (req, res) => {
  res.sendFile(path.join(rootDir, 'search', 'search.js'));
});

// Event details static files
app.get('/event-details.css', (req, res) => {
  res.sendFile(path.join(rootDir, 'event-details', 'event-details.css'));
});

app.get('/event-details.js', (req, res) => {
  res.sendFile(path.join(rootDir, 'event-details', 'event-details.js'));
});

// Registration static files
app.get('/registration.css', (req, res) => {
  res.sendFile(path.join(rootDir, 'registration', 'registration.css'));
});

app.get('/registration.js', (req, res) => {
  res.sendFile(path.join(rootDir, 'registration', 'registration.js'));
});

app.get('/registration-selection.js', (req, res) => {
  res.sendFile(path.join(rootDir, 'registration', 'registration-selection.js'));
});

// Common static files
app.get('/app.css', (req, res) => {
  res.sendFile(path.join(rootDir, 'app.css'));
});

app.get('/app.js', (req, res) => {
  res.sendFile(path.join(rootDir, 'app.js'));
});

// ==================== API PROXY ROUTES (Optional) ====================

// If you need to proxy API requests to avoid CORS issues in development
app.get('/api/*', async (req, res) => {
  try {
    const apiUrl = `http://localhost:4000${req.url}`;
    console.log(`Proxying API request to: ${apiUrl}`);
    
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    res.json(data);
  } catch (error) {
    console.error('API proxy error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to proxy API request',
      error: error.message
    });
  }
});

app.post('/api/*', express.json(), async (req, res) => {
  try {
    const apiUrl = `http://localhost:4000${req.url}`;
    console.log(`Proxying POST API request to: ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body)
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('API proxy error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to proxy API request',
      error: error.message
    });
  }
});

// ==================== HEALTH CHECK ====================

app.get('/health', (req, res) => {
  res.json({
    status: 'Client server is running',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// ==================== ERROR HANDLING ====================

// 404 handler for undefined routes
app.use((req, res) => {
  console.log(`404 - File not found: ${req.url}`);
  
  // If it's an API request, return JSON error
  if (req.url.startsWith('/api/')) {
    return res.status(404).json({
      success: false,
      message: `API endpoint not found: ${req.url}`
    });
  }
  
  // Otherwise, return HTML error page
  res.status(404).send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Page Not Found - Charity Events</title>
        <style>
            body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                margin: 0; 
                padding: 2rem; 
                background: #f8f9fa; 
                text-align: center; 
            }
            .error-container { 
                max-width: 500px; 
                margin: 2rem auto; 
                padding: 2rem; 
                background: white; 
                border-radius: 15px; 
                box-shadow: 0 10px 30px rgba(0,0,0,0.1); 
            }
            h1 { color: #dc3545; margin-bottom: 1rem; }
            p { color: #666; margin-bottom: 2rem; }
            .btn { 
                display: inline-block; 
                padding: 10px 20px; 
                background: #667eea; 
                color: white; 
                text-decoration: none; 
                border-radius: 5px; 
                margin: 0 0.5rem; 
            }
            .btn:hover { background: #5a6fd8; }
        </style>
    </head>
    <body>
        <div class="error-container">
            <h1>🚫 Page Not Found</h1>
            <p>The page you're looking for doesn't exist: <strong>${req.url}</strong></p>
            <div>
                <a href="/" class="btn">Go Home</a>
                <a href="/search" class="btn">Search Events</a>
                <a href="/registration" class="btn">Register</a>
            </div>
        </div>
    </body>
    </html>
  `);
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// ==================== SERVER STARTUP ====================

// Start server
app.listen(PORT, () => {
  console.log(`
🎯 Charity Events Client Server
────────────────────────────────
✅ Server running on port: ${PORT}
✅ Homepage: http://localhost:${PORT}/
✅ Search: http://localhost:${PORT}/search
✅ Event Details: http://localhost:${PORT}/event-details
✅ Registration: http://localhost:${PORT}/registration
✅ Health Check: http://localhost:${PORT}/health
────────────────────────────────
📝 Make sure API server is running on port 4000
🔧 Environment: ${process.env.NODE_ENV || 'development'}
  `);
});

// Graceful shutdown handling
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down client server gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Client server terminated');
  process.exit(0);
});