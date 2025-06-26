# The Harbor - RAG-Powered News Website

A modern news website with an intelligent Q&A system powered by LlamaIndex and RAG (Retrieval-Augmented Generation).

## Architecture

This project is split into two main components:

- **Frontend** (`/frontend`): Next.js-based news website
- **Backend** (`/backend`): Python FastAPI server with LlamaIndex RAG pipeline

## Features

- 📰 Modern news website interface
- 🤖 AI-powered Q&A widget with source attribution
- 🔍 RAG-based search across all website content
- 🔗 Source tracking - see exactly which pages inform each answer
- ⚡ Real-time content indexing
- 🎨 Beautiful, responsive UI

## Quick Start

### 1. Environment Setup

Create environment files:

```bash
# Backend environment
cp backend/.env.example backend/.env
# Edit backend/.env and add your OpenAI API key
```

### 2. Backend Setup

```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Start the RAG API server
python run.py
```

The backend will start on `http://localhost:8000`

### 3. Frontend Setup

```bash
cd frontend

# Install Node.js dependencies
npm install

# Start the Next.js development server
npm run dev
```

The frontend will start on `http://localhost:3000`

### 4. Index the Website

Once both servers are running, you need to index the website content:

```bash
# Index the website content into the vector database
curl -X POST "http://localhost:8000/api/index" \
  -H "Content-Type: application/json" \
  -d '{"base_url": "http://localhost:3000"}'
```

Or visit the API documentation at `http://localhost:8000/docs` and use the interactive interface.

## How It Works

### RAG Pipeline

1. **Content Crawling**: The backend crawls your website and extracts content
2. **Vectorization**: Content is chunked and embedded using OpenAI's embeddings
3. **Storage**: Vector embeddings are stored in ChromaDB locally
4. **Query Processing**: User questions are embedded and matched against stored content
5. **Response Generation**: LLM generates responses using relevant context with source attribution

### Frontend Widget

The article widget on each page allows users to:
- Ask questions about the current article or any content on the site
- See AI-generated responses with source links
- Follow up with additional questions
- Get contextual question suggestions

## API Endpoints

- `POST /api/chat` - Submit questions and get RAG-powered responses
- `POST /api/index` - Index website content
- `GET /api/stats` - Get indexing statistics
- `GET /health` - Health check

## Environment Variables

### Backend (.env)

```
OPENAI_API_KEY=your_openai_api_key_here
FRONTEND_URL=http://localhost:3000
BACKEND_PORT=8000
CHROMA_PERSIST_DIRECTORY=./chroma_db
```

## Deployment

### Local Development
Follow the Quick Start guide above.

### Production (Vercel + External RAG Service)
For production deployment, you'll need to:

1. Deploy the frontend to Vercel
2. Host the RAG backend on a cloud service (AWS, GCP, etc.)
3. Update environment variables to point to production URLs
4. Consider using a managed vector database (Pinecone, Weaviate, etc.)

## Technologies Used

### Backend
- **FastAPI** - Web framework
- **LlamaIndex** - RAG framework
- **ChromaDB** - Vector database
- **OpenAI** - LLM and embeddings
- **BeautifulSoup** - Web scraping

### Frontend
- **Next.js** - React framework
- **Custom Web Components** - For the Q&A widget
- **Modern CSS** - Responsive design

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.