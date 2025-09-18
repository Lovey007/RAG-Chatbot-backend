// Qdrant vector DB integration
// Using Qdrant REST API for upsert and query

const axios = require('axios');

const QDRANT_URL = process.env.QDRANT_URL || 'http://localhost:6333';
const COLLECTION = process.env.QDRANT_COLLECTION || 'news_articles';

// Upsert embeddings into Qdrant
async function upsertEmbeddings(points) {
    // points: [{id, vector, payload}]
    const url = `${QDRANT_URL}/collections/${COLLECTION}/points?wait=true`;
    try {
        await axios.put(url, { points });
    } catch (err) {
        if (err.response) {
            console.error('Qdrant upsert error:', JSON.stringify(err.response.data, null, 2));
        } else {
            console.error('Qdrant upsert error:', err.message);
        }
        throw err;
    }
}

// Query Qdrant for top-k similar vectors
async function queryEmbeddings(queryVector, topK = 2) {
    const url = `${QDRANT_URL}/collections/${COLLECTION}/points/search`;
    const res = await axios.post(url, {
        vector: queryVector,
        top: topK,
        with_payload: true
    });
    return res.data.result.map(r => r.payload);
}

// Create Qdrant collection with vector size and distance metric
async function createCollection(vectorSize) {
    const url = `${QDRANT_URL}/collections/${COLLECTION}`;
    // Use cosine distance for embeddings
    const body = {
        vectors: {
            size: vectorSize,
            distance: "Cosine"
        }
    };
    try {
        await axios.put(url, body);
        console.log(`Qdrant collection '${COLLECTION}' created/exists.`);
    } catch (err) {
        if (err.response && err.response.status === 409) {
            // Already exists
            console.log(`Qdrant collection '${COLLECTION}' already exists.`);
        } else {
            console.error('Qdrant createCollection error:', err.response ? err.response.data : err.message);
            throw err;
        }
    }
}

// Delete Qdrant collection
async function deleteCollection() {
    const url = `${QDRANT_URL}/collections/${COLLECTION}`;
    try {
        await axios.delete(url);
        console.log(`Qdrant collection '${COLLECTION}' deleted.`);
    } catch (err) {
        if (err.response && err.response.status === 404) {
            console.log(`Qdrant collection '${COLLECTION}' did not exist.`);
        } else {
            console.error('Qdrant deleteCollection error:', err.response ? err.response.data : err.message);
            throw err;
        }
    }
}

module.exports = {
    upsertEmbeddings,
    queryEmbeddings,
    createCollection,
    deleteCollection
};
