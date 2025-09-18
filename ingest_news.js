// Script to ingest news articles, generate embeddings, and upsert to Qdrant
require('dotenv').config();
const axios = require('axios');
const { getEmbedding } = require('./embedder');
const vectorStore = require('./vectorStore');

async function fetchNews() {
    // TODO: Replace with real news API fetch (e.g., GNews, NewsAPI)
    // For now, this is a placeholder for demo purposes
    return [
        { id: 1, title: 'News 1', content: 'This is the first news article.' },
        { id: 2, title: 'News 2', content: 'This is the second news article.' }
    ];
}

async function ingest() {
    const articles = await fetchNews();
    if (articles.length === 0) throw new Error('No articles to ingest');
    const testEmbedding = await getEmbedding(articles[0].content);
    console.log('Embedding size for collection:', testEmbedding.length);
    await vectorStore.deleteCollection();
    await vectorStore.createCollection(testEmbedding.length);
    const points = [];
    for (const article of articles) {
        const embedding = await getEmbedding(article.content);
        points.push({
            id: article.id,
            vector: embedding,
            payload: { title: article.title, content: article.content }
        });
    }
    await vectorStore.upsertEmbeddings(points);
    console.log('Ingested news articles into Qdrant.');
}

ingest().catch(console.error);
