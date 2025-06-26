# Project Restructuring Guide

## Overview

This Harbor RAG project has been restructured into separate frontend and backend repositories for better modularity and deployment flexibility.

## Repository Structure

### Before Restructuring
```
GPADemo/
├── backend/           # Python FastAPI + RAG
├── frontend/          # Next.js React app
├── start.sh           # Combined startup script
└── ...
```

### After Restructuring
```
GPADemo/               # Frontend repository (Next.js)
├── pages/
├── public/
├── package.json
├── start-frontend.sh
└── ...

GPADemo-backend/       # Backend repository (Python FastAPI)
├── main.py
├── rag_service.py
├── requirements.txt
├── start-backend.sh
└── ...
```

## Setup Instructions

### 1. Create Backend Repository

```bash
# From your parent directory
cd ..
mkdir GPADemo-backend
cd GPADemo-backend

# Initialize git repo
git init

# Copy backend files from original repo
cp -r ../GPADemo/backend/* .
cp ../GPADemo/backend/.env.example .env.example  # if it exists

# Create startup script (see start-backend.sh template)
# Set up requirements.txt and dependencies
```

### 2. Restructure Frontend Repository

```bash
# In your original GPADemo directory
cd GPADemo

# Move frontend files to root
mv frontend/* .
mv frontend/.* . 2>/dev/null || true
rmdir frontend

# Update package.json name if needed
```

### 3. Environment Setup

#### Backend (.env file in GPADemo-backend/)
```
OPENAI_API_KEY=your_openai_api_key_here
FRONTEND_URL=http://localhost:3000
BACKEND_PORT=8000
```

#### Frontend (environment variables)
No additional environment variables needed - connects to backend on localhost:8000

### 4. Starting the System

#### Option 1: Start Backend First
```bash
# Terminal 1: Start backend
cd GPADemo-backend
./start-backend.sh

# Terminal 2: Start frontend  
cd GPADemo
./start-frontend.sh
```

#### Option 2: Use Updated Main Script
```bash
cd GPADemo
./start.sh
# Follow the interactive prompts
```

## Benefits of This Structure

1. **Separation of Concerns**: Frontend and backend can be developed independently
2. **Different Deployment Targets**: Can deploy frontend and backend to different services
3. **Team Collaboration**: Different teams can work on frontend vs backend
4. **Technology Flexibility**: Easier to replace either component
5. **Scaling**: Can scale frontend and backend independently

## Development Workflow

1. **Backend Development**: Work in `GPADemo-backend` repository
2. **Frontend Development**: Work in `GPADemo` repository  
3. **API Changes**: Update both repositories and coordinate changes
4. **Testing**: Use `test-system.sh` to verify both services work together

## Port Configuration

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## Troubleshooting

### Backend Not Starting
- Check OPENAI_API_KEY is set
- Verify Python virtual environment is activated
- Check logs in backend directory

### Frontend Not Connecting to Backend
- Ensure backend is running on port 8000
- Check CORS settings in backend
- Verify API URLs in frontend code

### Port Conflicts
- Change ports in respective configuration files
- Update CORS settings if backend port changes
- Update API base URLs if backend port changes 