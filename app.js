require('dotenv').config();
const express = require('express');
const cors = require('cors');
const chatRoutes = require('./routes/chat');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'Backend is running!' });
});

// Chat-related routes
app.use('/', chatRoutes);

// Catch-all error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = app;
