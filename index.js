require('dotenv').config();
const express = require('express');
const cors = require('cors');
const redis = require('redis');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Redis client setup
const redisClient = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});
redisClient.connect().catch(console.error);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'Backend is running!' });
});

// Placeholder for chat, history, and reset endpoints
// TODO: Implement /chat, /history, /reset

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
