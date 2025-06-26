#!/bin/bash

# Harbor RAG System Startup Script
echo "🚀 Starting The Harbor RAG-Powered News System"
echo "================================================="

# Check if required files exist
if [ ! -f "backend/.env" ]; then
    echo "❌ Backend .env file not found!"
    echo "📝 Please copy backend/.env.example to backend/.env and configure it"
    echo "   Required: OPENAI_API_KEY"
    exit 1
fi

# Function to check if port is free
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        echo "❌ Port $port is already in use"
        return 1
    fi
    return 0
}

# Check if ports are available
if ! check_port 8000; then
    echo "Backend port 8000 is busy. Please stop the service or change the port."
    exit 1
fi

if ! check_port 3000; then
    echo "Frontend port 3000 is busy. Please stop the service or change the port."
    exit 1
fi

# Create log directory
mkdir -p logs

echo "🔧 Installing dependencies..."

# Install backend dependencies
echo "📦 Installing Python dependencies..."
cd backend
if [ ! -d "venv" ]; then
    echo "🐍 Creating Python virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate
pip install -r requirements.txt
cd ..

# Install frontend dependencies
echo "📦 Installing Node.js dependencies..."
cd frontend
if [ ! -d "node_modules" ]; then
    npm install
fi
cd ..

echo "🎬 Starting servers..."

# Start backend in background
echo "🐍 Starting Python RAG backend on port 8000..."
cd backend
source venv/bin/activate
python run.py > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait for backend to start and retry health check
echo "⏳ Waiting for backend to initialize (this may take 10-15 seconds)..."
for i in {1..15}; do
    sleep 1
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        echo "✅ Backend health check passed after ${i} seconds"
        break
    fi
    if [ $i -eq 15 ]; then
        echo "❌ Backend failed to start after 15 seconds. Check logs/backend.log"
        echo "Last few lines of backend log:"
        tail -n 5 logs/backend.log
        kill $BACKEND_PID 2>/dev/null
        exit 1
    fi
done

echo "✅ Backend started successfully"

# Start frontend in background
echo "⚛️  Starting Next.js frontend on port 3000..."
cd frontend
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Wait for frontend to start
sleep 5

# Check if frontend started successfully
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "❌ Frontend failed to start. Check logs/frontend.log"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 1
fi

echo "✅ Frontend started successfully"

echo ""
echo "🎉 System is now running!"
echo "================================"
echo "📰 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo ""
echo "📝 To index the website content, run:"
echo "   curl -X POST 'http://localhost:8000/api/index' -H 'Content-Type: application/json' -d '{\"base_url\": \"http://localhost:3000\"}'"
echo ""
echo "📋 Logs are available in:"
echo "   - Backend: logs/backend.log"
echo "   - Frontend: logs/frontend.log"
echo ""
echo "🛑 To stop the servers, press Ctrl+C or run: kill $BACKEND_PID $FRONTEND_PID"

# Create a PID file for easy cleanup
echo "$BACKEND_PID $FRONTEND_PID" > .pids

# Function to cleanup processes
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    if [ -f .pids ]; then
        PIDS=$(cat .pids)
        echo "Killing processes: $PIDS"
        kill $PIDS 2>/dev/null
        # Wait a moment, then force kill if needed
        sleep 2
        kill -9 $PIDS 2>/dev/null
        rm -f .pids
    fi
    
    # Also kill any processes on our ports
    echo "Cleaning up any remaining processes on ports 3000 and 8000..."
    pkill -f "next dev" 2>/dev/null || true
    pkill -f "python run.py" 2>/dev/null || true
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    lsof -ti:8000 | xargs kill -9 2>/dev/null || true
    
    echo "✅ Cleanup complete"
    exit 0
}

# Set up signal handlers for proper cleanup
trap cleanup INT TERM EXIT

# Keep script running
wait 