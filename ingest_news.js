// Script to ingest news articles, generate embeddings, and upsert to Qdrant
require('dotenv').config();
const axios = require('axios');
const { getEmbedding } = require('./embedder');
const vectorStore = require('./vectorStore');

async function fetchNews() {
    const rssFeedUrl = "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml"; 
    const url = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssFeedUrl)}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        return data.items.slice(0, 5).map((item, index) => ({
            id: index + 1,
            title: item.title,
            content: item.description || "No description available.",
            url: item.link,
            publishedAt: item.pubDate,
            source: data.feed.title
        }));
    } catch (error) {
        console.error("Error fetching RSS feed:", error);
        return [];
    }
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
