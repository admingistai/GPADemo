# Claude Context: GPADemo Widget Project

## Project Overview
This is a Next.js application that provides an AI-powered chat widget called "Ask Anything™" that publishers can embed on their websites. The widget allows readers to ask questions about the content and receive AI-powered answers using the Gist AI (formerly Prorata) API.

## Key Issues Resolved

### 1. Widget Display Issues
- **Problem**: Widget wasn't displaying due to `siteBranding` reference error
- **Solution**: Removed undefined variable and added error handling with default font stack

### 2. Mini Tab Implementation
- **Feature**: Added vertical sidebar tab (50x160px → 80px height) with website favicon and "Ask" text
- **Fix**: Set `sidebarHasBeenOpened = true` in `openChatWithQuestion` function to ensure tab visibility

### 3. Theme Detection
- **Problem**: Mini tab background was white on dark websites
- **Solution**: Fixed theme detection logic to properly apply dark/light backgrounds based on website theme

### 4. JSON Parsing Error
- **Problem**: "Unexpected token 'd', "data: {"ty"... is not valid JSON"
- **Root Cause**: Widget was trying to parse Server-Sent Events (SSE) as JSON
- **Solution**: Added SSE support to handle `text/event-stream` responses properly

### 5. Vercel Deployment DNS Error
- **Problem**: `getaddrinfo ENOTFOUND api.prorata.ai` error on Vercel
- **Root Cause**: Environment variable not set on Vercel, causing fallback to non-existent domain
- **Solution**: Set `PRORATA_API_BASE_URL=https://api.gist.ai/v1` in Vercel environment variables

## Important Configuration

### Environment Variables (Vercel)
```
PRORATA_API_KEY=your_api_key_here
PRORATA_API_BASE_URL=https://api.gist.ai/v1
```

### Local Development (.env.local)
```
PRORATA_API_KEY=your_api_key_here
PRORATA_API_BASE_URL=https://api.gist.ai/v1
```

## Widget Versions
- **widget.js**: V1 stable widget (now with SSE support)
- **widget-v2.js**: V2 beta widget with enhanced features

## API Endpoints
- `/api/chat`: Handles chat conversations with Gist AI
- `/api/questions`: Generates suggested questions
- `/api/analytics`: Tracks widget usage events

## Key Technical Details
1. The chat API returns Server-Sent Events (SSE) format, not JSON
2. SSE data comes in format: `data: {"type": "content", "data": "response text"}`
3. Widget must handle both SSE and JSON responses for compatibility
4. Gist AI API requires proper authentication with Bearer token

## Debugging Tips
1. Always check Vercel environment variables match local `.env.local`
2. Use browser console to verify which widget version is loading (widget.js vs widget-v2.js)
3. Check Network tab for API response format (SSE vs JSON)
4. Verify DNS resolution for API domains before deployment

## Recent Commits
- Fixed JSON parsing error by adding SSE support
- Fixed widget.js SSE parsing to use 'data' field instead of 'text'
- Added comprehensive debugging for API issues
- Implemented mini tab with proper theme detection

## Testing
- Local: `npm run dev` (runs on port 3000 or 3001)
- Test page: `/test.html` loads widget-v2.js
- Main demo: `/index-carbontide.html` for CarbonTide news site demo

This project successfully integrates Gist AI's streaming API with an embeddable chat widget that adapts to any website's theme and provides contextual AI assistance.