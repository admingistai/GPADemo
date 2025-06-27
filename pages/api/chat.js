import { EventSource } from 'eventsource';
import axios from 'axios';

// Prorata API Configuration
const PRORATA_CONFIG = {
  API_BASE_URL: process.env.PRORATA_API_BASE_URL || 'https://api.gist.ai/v1',
  API_KEY: process.env.PRORATA_API_KEY,
  ORGANIZATION_ID: process.env.PRORATA_ORGANIZATION_ID
};

// Rate limiting (simple in-memory for serverless)
const requestCounts = new Map();
const RATE_LIMIT = parseInt(process.env.CHAT_RATE_LIMIT || '20'); // Lower limit for AI requests
const RATE_WINDOW = 60 * 1000; // 1 minute

export default async function handler(req, res) {
  // Set CORS headers to allow cross-origin requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-ID');
  
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
    console.log('Environment check:', {
      hasApiKey: !!process.env.PRORATA_API_KEY,
      apiKeyLength: process.env.PRORATA_API_KEY?.length,
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      apiBaseUrl: PRORATA_CONFIG.API_BASE_URL
    });
    
    if (!PRORATA_CONFIG.API_KEY) {
      return res.status(500).json({ 
        error: 'Prorata API key not configured. Please add PRORATA_API_KEY to your environment variables.',
        debug: {
          hasEnvVar: !!process.env.PRORATA_API_KEY,
          envVarLength: process.env.PRORATA_API_KEY?.length
        }
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
    const { messages, userId, threadId, temperature = 0.7 } = req.body;

    // Validate request
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Invalid messages format' });
    }

    // Get user prompt from the last user message
    const userPrompt = messages[messages.length - 1]?.content || '';
    
    console.log('Prorata API Request:', {
      url: `${PRORATA_CONFIG.API_BASE_URL}/chat`,
      userPrompt: userPrompt.substring(0, 50) + '...',
      hasApiKey: !!PRORATA_CONFIG.API_KEY,
      userId: userId || 'anonymous'
    });
    
    // Step 1: Create chat to get threadId and turnId
    let chatResponse;
    try {
      chatResponse = await axios.post(
        `${PRORATA_CONFIG.API_BASE_URL}/chat`,
        {
          thread_id: threadId || '',
          user_prompt: userPrompt,
          temperature: temperature
        },
        {
          headers: {
            'Authorization': `Bearer ${PRORATA_CONFIG.API_KEY}`,
            'X-User-ID': userId || 'anonymous',
            'Content-Type': 'application/json'
          },
          timeout: 10000, // 10 second timeout
          validateStatus: () => true // Don't throw on any status code
        }
      );
    } catch (axiosError) {
      console.error('Axios error details:', {
        message: axiosError.message,
        code: axiosError.code,
        config: {
          url: axiosError.config?.url,
          method: axiosError.config?.method,
          headers: axiosError.config?.headers
        }
      });
      throw axiosError;
    }

    if (chatResponse.status !== 200) {
      const errorData = chatResponse.data || {};
      
      if (chatResponse.status === 429) {
        const resetTime = chatResponse.headers['x-ratelimit-reset'];
        return res.status(429).json({ 
          error: 'Prorata API rate limit exceeded. Please try again later.',
          retryAfter: resetTime ? parseInt(resetTime) - Math.floor(Date.now() / 1000) : 60
        });
      }
      
      return res.status(chatResponse.status).json({ 
        error: errorData.error || `Chat creation failed: ${chatResponse.status}` 
      });
    }

    const chatData = chatResponse.data;
    const { thread_id, turn_id } = chatData;

    console.log('Chat created successfully:', { thread_id, turn_id });

    // Step 2: Stream the response using axios with SSE
    const streamUrl = `${PRORATA_CONFIG.API_BASE_URL}/chat/response/${thread_id}/${turn_id}`;
    
    console.log('Connecting to stream:', streamUrl);
    
    // Set up SSE headers for streaming to client
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    try {
      // Use axios to get the SSE stream
      const streamResponse = await axios.get(streamUrl, {
        headers: {
          'Authorization': `Bearer ${PRORATA_CONFIG.API_KEY}`,
          'X-User-ID': userId || 'anonymous',
          'Accept': 'text/event-stream'
        },
        responseType: 'stream',
        validateStatus: () => true
      });

      if (streamResponse.status !== 200) {
        console.error('Stream connection failed:', streamResponse.status, streamResponse.statusText);
        res.write(`data: ${JSON.stringify({
          type: 'error',
          error: `Stream connection failed: ${streamResponse.status}`
        })}\n\n`);
        res.end();
        return;
      }

      let fullResponse = '';
      let buffer = '';

      // Process the stream
      streamResponse.data.on('data', (chunk) => {
        buffer += chunk.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.trim() === '') continue;
          
          if (line.startsWith('event:')) {
            const eventType = line.substring(6).trim();
            continue; // Event type is on its own line
          }
          
          if (line.startsWith('data:')) {
            const data = line.substring(5).trim();
            
            try {
              const parsed = JSON.parse(data);
              
              if (parsed.content) {
                fullResponse += parsed.content;
                res.write(`data: ${JSON.stringify({ type: 'content', data: parsed.content })}\n\n`);
              }
            } catch (e) {
              // Handle non-JSON data
              if (data === '[DONE]' || line.includes('complete')) {
                // Stream is complete, fetch citations and attributions
                streamResponse.data.destroy();
              }
            }
          }
        }
      });

      streamResponse.data.on('end', async () => {
        let citations = [];
        let attributions = [];
        
        // Fetch citations and attributions
        try {
          const [citationsRes, attributionsRes] = await Promise.all([
            axios.get(
              `${PRORATA_CONFIG.API_BASE_URL}/chat/citations/${thread_id}/${turn_id}`,
              {
                headers: {
                  'Authorization': `Bearer ${PRORATA_CONFIG.API_KEY}`,
                  'X-User-ID': userId || 'anonymous'
                },
                validateStatus: () => true
              }
            ),
            axios.get(
              `${PRORATA_CONFIG.API_BASE_URL}/chat/attributions/${thread_id}/${turn_id}`,
              {
                headers: {
                  'Authorization': `Bearer ${PRORATA_CONFIG.API_KEY}`,
                  'X-User-ID': userId || 'anonymous'
                },
                validateStatus: () => true
              }
            )
          ]);

          if (citationsRes.status === 200) {
            citations = citationsRes.data;
          }
          
          if (attributionsRes.status === 200) {
            // Keep the original attribution structure from Gist AI
            attributions = attributionsRes.data;
            console.log('Attributions from Gist AI:', attributions);
          }
        } catch (error) {
          console.error('Error fetching citations/attributions:', error);
        }

        // Log what we're getting from Gist AI
        console.log('Citations from Gist AI:', citations);
        console.log('Attributions from Gist AI:', attributions);
        
        // Send final response
        res.write(`data: ${JSON.stringify({
          type: 'complete',
          response: fullResponse,
          threadId: thread_id,
          turnId: turn_id,
          citations,
          attributions,
          metadata: {}
        })}\n\n`);
        
        res.write('data: [DONE]\n\n');
        res.end();
      });

      streamResponse.data.on('error', (error) => {
        console.error('Stream error:', error);
        res.write(`data: ${JSON.stringify({
          type: 'error',
          error: 'Stream processing failed'
        })}\n\n`);
        res.end();
      });

    } catch (streamError) {
      console.error('Failed to connect to stream:', streamError.message);
      res.write(`data: ${JSON.stringify({
        type: 'error',
        error: 'Failed to connect to response stream'
      })}\n\n`);
      res.end();
    }

  } catch (error) {
    console.error('Chat API error:', error.message, error.stack);

    // If headers haven't been sent yet
    if (!res.headersSent) {
      return res.status(500).json({ 
        error: 'An unexpected error occurred',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        apiUrl: PRORATA_CONFIG.API_BASE_URL,
        hasApiKey: !!PRORATA_CONFIG.API_KEY
      });
    }
    
    // If streaming has started, send error through SSE
    res.write(`data: ${JSON.stringify({
      type: 'error',
      error: error.message
    })}\n\n`);
    
    res.end();
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