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

// Set correct MIME types for CSS files
app.use('/home/home.css', (req, res, next) => {
  res.setHeader('Content-Type', 'text/css');
  next();
});

app.use('/search/search.css', (req, res, next) => {
  res.setHeader('Content-Type', 'text/css');
  next();
});

// Set correct MIME types for JS files
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

// Explicit route configuration
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

// Explicit routes for static files (fallback solution)
app.get('/home.css', (req, res) => {
  res.sendFile(path.join(rootDir, 'home', 'home.css'));
});

app.get('/home.js', (req, res) => {
  res.sendFile(path.join(rootDir, 'home', 'home.js'));
});

app.get('/app.css', (req, res) => {
  res.sendFile(path.join(rootDir, 'app.css'));
});

app.get('/app.js', (req, res) => {
  res.sendFile(path.join(rootDir, 'app.js'));
});

// 404 handler
app.use((req, res) => {
  console.log(`404 - File not found: ${req.url}`);
  res.status(404).send(`File not found: ${req.url}`);
});

// Start server
app.listen(PORT, () => {
  console.log(`🎯 Client-side server running on port ${PORT}`);
  console.log(`🏠 Homepage: http://localhost:${PORT}/`);
  console.log(`🔍 Search: http://localhost:${PORT}/search`);
  console.log(`📝 Event Details: http://localhost:${PORT}/event-details`);
});