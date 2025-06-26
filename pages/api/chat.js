// Rate limiting (simple in-memory for serverless)
const requestCounts = new Map();
const RATE_LIMIT = parseInt(process.env.CHAT_RATE_LIMIT || '20');
const RATE_WINDOW = 60 * 1000; // 1 minute

export default async function handler(req, res) {
  // Set CORS headers to allow cross-origin requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Check if API key is configured
    if (!process.env.PRORATA_API_KEY) {
      return res.status(500).json({ 
        error: 'Prorata API key not configured. Please add PRORATA_API_KEY to your environment variables.' 
      });
    }

    // Simple rate limiting
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    const clientRequests = requestCounts.get(clientIP) || { count: 0, resetTime: now + RATE_WINDOW };

    if (now > clientRequests.resetTime) {
      clientRequests.count = 0;
      clientRequests.resetTime = now + RATE_WINDOW;
    }

    clientRequests.count++;
    requestCounts.set(clientIP, clientRequests);

    if (clientRequests.count > RATE_LIMIT) {
      return res.status(429).json({ 
        error: 'Too many AI requests. Please try again later.',
        retryAfter: Math.ceil((clientRequests.resetTime - now) / 1000)
      });
    }

    // Extract request data
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    // Generate a unique user ID for this session
    const userId = req.headers['x-user-id'] || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create chat request to Prorata API
    const chatResponse = await fetch('https://api.development.prorata.ai/v1/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PRORATA_API_KEY}`,
        'Content-Type': 'application/json',
        'X-User-ID': userId
      },
      body: JSON.stringify({
        user_prompt: question,
        temperature: 0.7
      })
    });

    if (!chatResponse.ok) {
      const errorText = await chatResponse.text();
      console.error('Prorata API error:', errorText);
      throw new Error(`Prorata API error: ${chatResponse.status} ${errorText}`);
    }

    const chatData = await chatResponse.json();
    
    if (!chatData.thread_id || !chatData.turn_id) {
      throw new Error('Invalid response from Prorata API - missing thread_id or turn_id');
    }

    // Get the AI response using the streaming endpoint
    const responseStream = await fetch(`https://api.development.prorata.ai/v1/chat/response/${chatData.thread_id}/${chatData.turn_id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.PRORATA_API_KEY}`,
        'X-User-ID': userId
      }
    });

    if (!responseStream.ok) {
      throw new Error(`Failed to get response stream: ${responseStream.status}`);
    }

    // Process the streaming response
    const reader = responseStream.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';
    let responseComplete = false;

    while (!responseComplete) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.content) {
              fullResponse += data.content;
            }
          } catch (e) {
            // Skip malformed JSON
          }
        } else if (line.startsWith('event: complete')) {
          responseComplete = true;
          break;
        }
      }
    }

    // Get citations for the response
    let citations = [];
    try {
      const citationsResponse = await fetch(`https://api.development.prorata.ai/v1/chat/citations/${chatData.thread_id}/${chatData.turn_id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.PRORATA_API_KEY}`,
          'X-User-ID': userId
        }
      });

      if (citationsResponse.ok) {
        citations = await citationsResponse.json();
      }
    } catch (error) {
      console.warn('Failed to fetch citations:', error);
    }

    // Get attributions for the response
    let attributions = {};
    try {
      const attributionsResponse = await fetch(`https://api.development.prorata.ai/v1/chat/attributions/${chatData.thread_id}/${chatData.turn_id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.PRORATA_API_KEY}`,
          'X-User-ID': userId
        }
      });

      if (attributionsResponse.ok) {
        attributions = await attributionsResponse.json();
      }
    } catch (error) {
      console.warn('Failed to fetch attributions:', error);
    }

    if (!fullResponse) {
      return res.status(500).json({ error: 'No response generated' });
    }

    // Return successful response with citations and attributions
    return res.status(200).json({
      success: true,
      answer: fullResponse,
      threadId: chatData.thread_id,
      turnId: chatData.turn_id,
      citations: citations,
      attributions: attributions,
      model: 'prorata-ai',
      responseTime: chatData.response_time || 0
    });

  } catch (error) {
    console.error('Chat API error:', error);

    // Handle specific error types
    if (error.message.includes('401')) {
      return res.status(401).json({ error: 'Invalid Prorata API key' });
    }
    if (error.message.includes('429')) {
      return res.status(429).json({ error: 'Prorata API rate limit exceeded. Please try again later.' });
    }
    if (error.message.includes('400')) {
      return res.status(400).json({ error: 'Invalid request to Prorata API' });
    }

    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return res.status(408).json({ error: 'Request timeout' });
    }

    // Generic error
    return res.status(500).json({ 
      error: 'Error processing your request',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Export config for Next.js API routes
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb'
    },
    responseLimit: false
  }
}; 