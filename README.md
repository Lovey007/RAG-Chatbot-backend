# Backend for News RAG Chatbot

## Setup
1. Copy `.env.example` to `.env` and fill in your API keys.
2. Install dependencies:
   ```sh
   npm install
   ```
3. Run the ingestion script to load news:
   ```sh
   node ingest_news.js
   ```
4. Start the backend:
   ```sh
   node server.js
   ```

## Scripts
- `ingest_news.js`: Ingests news articles into Qdrant.
- `server.js`: Starts the Express backend.

## Environment Variables
See `.env.example` for required variables.
