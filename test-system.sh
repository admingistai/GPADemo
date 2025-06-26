#!/bin/bash

# Harbor RAG System Test Script
echo "🧪 Testing The Harbor RAG System"
echo "================================="

# Test backend health
echo "🔍 Testing backend health..."
HEALTH_RESPONSE=$(curl -s http://localhost:8000/health)
if [ $? -eq 0 ]; then
    echo "✅ Backend is responding"
    echo "📊 Health status: $HEALTH_RESPONSE"
else
    echo "❌ Backend is not responding"
    exit 1
fi

# Test frontend
echo ""
echo "🔍 Testing frontend..."
FRONTEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
if [ "$FRONTEND_RESPONSE" = "200" ]; then
    echo "✅ Frontend is responding"
else
    echo "❌ Frontend is not responding (HTTP $FRONTEND_RESPONSE)"
    exit 1
fi

# Test API endpoints
echo ""
echo "🔍 Testing API endpoints..."

# Test stats endpoint
echo "📊 Testing /api/stats..."
STATS_RESPONSE=$(curl -s http://localhost:8000/api/stats)
if [ $? -eq 0 ]; then
    echo "✅ Stats endpoint working"
    echo "$STATS_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$STATS_RESPONSE"
else
    echo "❌ Stats endpoint failed"
fi

# Test chat endpoint with a simple question
echo ""
echo "🤖 Testing chat endpoint with sample question..."
CHAT_RESPONSE=$(curl -s -X POST "http://localhost:8000/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"question": "What is The Harbor?"}')

if [ $? -eq 0 ]; then
    echo "✅ Chat endpoint responding"
    echo "📝 Sample response:"
    echo "$CHAT_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$CHAT_RESPONSE"
else
    echo "❌ Chat endpoint failed"
fi

echo ""
echo "🎉 System test complete!"
echo ""
echo "💡 If the chat response indicates the system needs indexing, run:"
echo "   ./index-website.sh" 