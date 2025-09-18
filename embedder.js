// Embedding utility using Jina Embeddings API
const axios = require('axios');

const JINA_API_URL = 'https://api.jina.ai/v1/embeddings';
const JINA_API_KEY = process.env.JINA_API_KEY;

async function getEmbedding(text) {
    if (!JINA_API_KEY) throw new Error('JINA_API_KEY not set');
    try {
        const res = await axios.post(
            JINA_API_URL,
            { input: [text], model: "jina-embeddings-v2-base-en" },
            { headers: { 'Authorization': `Bearer ${JINA_API_KEY}` } }
        );
        return res.data.data[0].embedding;
    } catch (err) {
        console.error('Jina API error:', err.response ? err.response.data : err.message);
        throw err;
    }
}

module.exports = { getEmbedding };
