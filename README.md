# Backend for News RAG Chatbot

## Tech Stack Used

- **Node.js** (JavaScript)
- **Express.js** (API server)
- **Qdrant** (Vector database for storing embeddings)
- **Redis** (Session caching and chat history)
- **Jina AI Embeddings API** (for generating text embeddings)
- **Gemini API** (Google's Gemini LLM for chat responses)
- **Axios** (HTTP client)
- **CORS** (Middleware)
- **dotenv** (Environment variable management)

## Git Repositories

- **Backend:** [RAG-Chatbot-backend](https://github.com/Lovey007/RAG-Chatbot-backend) (this repo)
- **Frontend:** [RAG-Chatbot-frontend](https://github.com/Lovey007/RAG-Chatbot-frontend)

## Code Walkthrough

### End-to-End Flow

#### 1. How Embeddings Are Created, Indexed, and Stored

- News articles are fetched from an RSS feed (e.g., NYTimes).
- For each article, the content is sent to the Jina AI Embeddings API, producing a dense vector.
- The backend uses `vectorStore.js` to:
  - **Create** a Qdrant collection (with appropriate vector size and cosine distance).
  - **Upsert** embeddings as points into Qdrant, each with an `id`, the vector, and a payload (title, content).
- When a user sends a chat message, its embedding is generated and Qdrant is queried for most similar vectors (articles).

#### 2. How Redis Caching & Session History Works

- Each chat session is tracked using a `sessionId`.
- User and bot messages are pushed to a Redis list (`chat:<sessionId>`).
- Chat history retrieval and session reset are handled via API endpoints:
  - `GET /history?sessionId=...` returns all messages for a session.
  - `POST /reset` clears the chat history for the session.
- If Redis is unavailable, the system continues without persistent session history.

#### 3. How the Frontend Calls API/Socket and Handles Responses

- The frontend communicates with the backend via REST API endpoints:
  - `POST /chat` to send messages and receive bot replies.
  - `GET /history` to fetch conversation history.
  - `POST /reset` to clear history.
- The backend handles incoming requests, processes the message, retrieves context articles, generates a response using Gemini API, and returns the reply.

#### 4. Noteworthy Design Decisions & Potential Improvements

**Design Decisions:**
- **Qdrant** is chosen for efficient vector similarity search and scalability.
- **Jina Embeddings** API allows leveraging state-of-the-art embedding models with minimal setup.
- **Redis** is used for lightweight, fast session management and chat history.
- **Separation of Concerns:** Embedding generation, vector storage, chat logic, and LLM response are modularized.

**Potential Improvements:**
- Add error handling and retry logic for API failures (Jina, Qdrant, Gemini, Redis).
- Support for more advanced session analytics and user authentication.
- Enable streaming responses or WebSocket support for real-time chat.
- Enhance ingestion to handle more diverse news sources and formats.
- Add unit/integration tests for critical backend functions.
- Improve environment variable validation and documentation.

---

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

---
