# Prorata API Migration Guide

This guide documents the migration from OpenAI to Prorata API for the Ask Anything™ widget.

## Overview

The widget has been updated to use Prorata's API service, which provides enhanced features including:
- Real-time streaming responses via Server-Sent Events (SSE)
- Citation tracking and attribution
- Analytics integration
- User tracking and personalization
- Enhanced question generation

## Changes Made

### 1. Backend API Updates

#### `/pages/api/chat.js`
- Replaced OpenAI SDK with Prorata API calls
- Implemented SSE streaming for real-time responses
- Added citation and attribution fetching
- Added user ID support

#### New Endpoints Created:
- `/pages/api/questions.js` - For generating suggested questions
- `/pages/api/analytics.js` - For tracking user interactions

### 2. Widget Updates (`/public/widget-v2.js`)

- Added user ID generation and persistence
- Implemented SSE response handling
- Added analytics tracking for all user interactions
- Updated to use new question generation endpoint
- Enhanced attribution display with click tracking

### 3. Environment Variables

Update your `.env.local` file with:

```bash
# Remove or comment out:
# OPENAI_API_KEY=your_openai_key

# Add:
PRORATA_API_KEY=your_prorata_api_key_here
PRORATA_API_BASE_URL=https://api.prorata.ai/v1
PRORATA_ORGANIZATION_ID=your_organization_id_here
```

## Testing Instructions

### 1. Set Up Environment

```bash
# Copy the example environment file
cp .env.example .env.local

# Add your Prorata API credentials to .env.local
# Edit the file and add your PRORATA_API_KEY
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Development Server

```bash
npm run dev
```

### 4. Test the Widget

1. Open http://localhost:3000 in your browser
2. Look for the chat widget in the bottom right corner
3. Click to open the widget
4. Test the following features:

#### Basic Chat Functionality
- [ ] Ask a question and verify you receive a response
- [ ] Check that responses stream in real-time (character by character)
- [ ] Verify the conversation maintains context

#### User ID Persistence
- [ ] Open browser developer tools
- [ ] Go to Application > Local Storage
- [ ] Verify `prorata_user_id` is created and persists across sessions

#### Analytics Tracking
- [ ] Open Network tab in developer tools
- [ ] Interact with the widget
- [ ] Verify analytics calls to `/api/analytics` for:
  - Widget load
  - Chat open
  - Question submission
  - Answer received
  - Suggestion clicks

#### Suggested Questions
- [ ] Verify suggested questions appear when opening the widget
- [ ] Click a suggested question and verify it submits properly
- [ ] Check that new suggestions appear after receiving an answer

#### Attribution Display
- [ ] Ask a question that would generate attributions
- [ ] Verify attribution bar appears with source information
- [ ] Click on attributions and verify analytics tracking

### 5. Production Deployment

1. Ensure all environment variables are set in your production environment
2. Deploy to Vercel or your hosting platform
3. Test the widget on your production domain

## API Response Format

The new Prorata API returns SSE events in this format:

```javascript
// Metadata event
data: {"type": "metadata", "data": {...}}

// Content streaming
data: {"type": "content", "data": "streaming text..."}

// Completion with full data
data: {
  "type": "complete",
  "response": "full response text",
  "threadId": "thread_123",
  "turnId": "turn_456",
  "citations": [...],
  "attributions": {...},
  "metadata": {...}
}

// End of stream
data: [DONE]
```

## Troubleshooting

### Common Issues

1. **No responses from chat**
   - Verify PRORATA_API_KEY is set correctly
   - Check browser console for errors
   - Verify API endpoint is accessible

2. **Widget not loading**
   - Clear browser cache
   - Check for JavaScript errors in console
   - Verify widget script is loading properly

3. **Analytics not tracking**
   - Check Network tab for failed requests
   - Verify analytics endpoint is responding
   - Check for rate limiting

### Debug Mode

Enable debug logging by adding to widget initialization:

```javascript
window.WIDGET_DEBUG = true;
```

## Rollback Instructions

If you need to rollback to OpenAI:

1. Restore the original `/pages/api/chat.js` from git
2. Restore the original widget file
3. Update environment variables to use OpenAI API key
4. Remove the new API endpoints (questions.js, analytics.js)

## Support

For issues or questions about the Prorata API integration:
- Check Prorata API documentation
- Review error messages in browser console
- Check server logs for API errors