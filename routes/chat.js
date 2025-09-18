const express = require('express');
const router = express.Router();
const redisClient = require('../redisClient');
const vectorStore = require('../vectorStore');
const gemini = require('../gemini');
const { getEmbedding } = require('../embedder');

// POST /chat - handle chat message, store in Redis
router.post('/chat', async (req, res) => {
    console.log('Received /chat request:', req.body);
    const { sessionId, message } = req.body;
    if (!sessionId || !message) {
        return res.status(400).json({ error: 'sessionId and message are required' });
    }
    // Store user message in Redis list
    try {
        await redisClient.rPush(`chat:${sessionId}`, JSON.stringify({ sender: 'user', message }));
    } catch (e) {
        // Redis may not be available; ignore for now
    }
    console.log('Generating embedding...');
    let queryEmbedding;
    try {
        queryEmbedding = await getEmbedding(message);
        console.log('Embedding generated:', queryEmbedding && queryEmbedding.length ? '[vector]' : queryEmbedding);
    } catch (e) {
        console.error('Embedding error:', e);
        return res.status(500).json({ error: 'Failed to generate embedding' });
    }
    console.log('Querying Qdrant...');
    let contextArticles = [];
    try {
        contextArticles = await vectorStore.queryEmbeddings(queryEmbedding, 2);
        console.log('Context articles:', contextArticles);
    } catch (e) {
        console.error('Qdrant error:', e);
        return res.status(500).json({ error: 'Failed to query vector DB' });
    }
    const context = contextArticles.map(a => a.content).join(' ');
    console.log('Calling Gemini API...');
    let botReply;
    try {
        botReply = await gemini.getGeminiResponse(context, message);
        console.log('Bot reply:', botReply);
    } catch (e) {
        console.error('Gemini error:', e);
        return res.status(500).json({ error: 'Failed to get Gemini response' });
    }
    try {
        await redisClient.rPush(`chat:${sessionId}`, JSON.stringify({ sender: 'bot', message: botReply }));
    } catch (e) {
        // Redis may not be available; ignore for now
    }
    res.json({ reply: botReply });
});

// GET /history?sessionId=... - get chat history for a session
router.get('/history', async (req, res) => {
    const { sessionId } = req.query;
    if (!sessionId) {
        return res.status(400).json({ error: 'sessionId is required' });
    }
    let history = [];
    try {
        history = await redisClient.lRange(`chat:${sessionId}`, 0, -1);
        history = history.map(msg => JSON.parse(msg));
    } catch (e) {
        // Redis may not be available; return empty
    }
    res.json({ history });
});

// POST /reset - clear chat history for a session
router.post('/reset', async (req, res) => {
    const { sessionId } = req.body;
    if (!sessionId) {
        return res.status(400).json({ error: 'sessionId is required' });
    }
    try {
        await redisClient.del(`chat:${sessionId}`);
    } catch (e) {
        // Redis may not be available; ignore for now
    }
    res.json({ status: 'Session reset' });
});

module.exports = router;
