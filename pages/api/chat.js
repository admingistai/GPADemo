// GPADemo Chat API - Updated to use Gist AI API
// This endpoint handles chat requests and forwards them to the Gist AI API
// instead of the previous Prorata API. The flow remains the same:
// 1. Create a chat request
// 2. Stream the response
// 3. Fetch citations and attributions
//
// Rate limiting (simple in-memory for serverless)
const requestCounts = new Map();
const RATE_LIMIT = parseInt(process.env.CHAT_RATE_LIMIT || '20');
const RATE_WINDOW = 60 * 1000; // 1 minute

// Debug: Log environment variables on module load
console.log('🔧 Chat API module loaded');
console.log('🔧 Environment check:');
console.log('   - NODE_ENV:', process.env.NODE_ENV);
console.log('   - GIST_API_KEY exists:', !!process.env.GIST_API_KEY);
console.log('   - GIST_API_KEY length:', process.env.GIST_API_KEY?.length || 0);
console.log('   - CHAT_RATE_LIMIT:', process.env.CHAT_RATE_LIMIT || 'default(20)');
if (process.env.GIST_API_KEY) {
  console.log('   - API Key prefix:', process.env.GIST_API_KEY.substring(0, 12) + '...');
}

export default async function handler(req, res) {
  console.log('🟢 Chat API: Request received');
  console.log('📍 Method:', req.method);
  console.log('📍 URL:', req.url);
  console.log('📍 Headers:', JSON.stringify(req.headers, null, 2));
  console.log('📍 Environment check - GIST_API_KEY exists:', !!process.env.GIST_API_KEY);
  console.log('📍 Environment check - API Key prefix:', process.env.GIST_API_KEY ? process.env.GIST_API_KEY.substring(0, 8) + '...' : 'NOT SET');

  // Set CORS headers to allow cross-origin requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('🔄 Handling OPTIONS preflight request');
    return res.status(200).end();
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      console.log('❌ Method not allowed:', req.method);
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Check if API key is configured
    if (!process.env.GIST_API_KEY) {
      console.log('❌ GIST_API_KEY not configured in environment variables');
      return res.status(500).json({ 
        error: 'Gist API key not configured. Please add GIST_API_KEY to your environment variables.' 
      });
    }
    
    console.log('✅ API key is configured')

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
    console.log('📦 Request body:', JSON.stringify(req.body, null, 2));
    const { question } = req.body;

    if (!question) {
      console.log('❌ Question is required but not provided');
      return res.status(400).json({ error: 'Question is required' });
    }
    
    console.log('❓ Question received:', question);

    // Generate a unique user ID for this session
    const userId = req.headers['x-user-id'] || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log('👤 User ID:', userId);

    // Create chat request to Gist API
    const gistRequestBody = {
      user_prompt: question,
      temperature: 0.7
    };
    
    const gistRequestHeaders = {
      'Authorization': `Bearer ${process.env.GIST_API_KEY}`,
      'Content-Type': 'application/json',
      'X-User-ID': userId
    };
    
    console.log('🚀 Making request to Gist API');
    console.log('🎯 URL: https://api.gist.ai/v1/chat');
    console.log('📦 Request body:', JSON.stringify(gistRequestBody, null, 2));
    console.log('📋 Request headers:', {
      ...gistRequestHeaders,
      'Authorization': `Bearer ${process.env.GIST_API_KEY.substring(0, 8)}...` // Don't log full API key
    });
    
    const chatResponse = await fetch('https://api.gist.ai/v1/chat', {
      method: 'POST',
      headers: gistRequestHeaders,
      body: JSON.stringify(gistRequestBody)
    });

    console.log('📡 Gist API response status:', chatResponse.status);
    console.log('📡 Gist API response headers:', Object.fromEntries(chatResponse.headers.entries()));

    if (!chatResponse.ok) {
      const errorText = await chatResponse.text();
      console.error('❌ Gist API error - Status:', chatResponse.status);
      console.error('❌ Gist API error - Response:', errorText);
      console.error('❌ Gist API error - Headers:', Object.fromEntries(chatResponse.headers.entries()));
      throw new Error(`Gist API error: ${chatResponse.status} ${errorText}`);
    }

    const chatData = await chatResponse.json();
    console.log('✅ Gist chat API response successful');
    console.log('📊 Chat response data:', JSON.stringify(chatData, null, 2));
    
    if (!chatData.thread_id || !chatData.turn_id) {
      console.error('❌ Invalid response from Gist API - missing thread_id or turn_id');
      console.error('📊 Received data:', chatData);
      throw new Error('Invalid response from Gist API - missing thread_id or turn_id');
    }
    
    console.log('🆔 Thread ID:', chatData.thread_id);
    console.log('🆔 Turn ID:', chatData.turn_id);

    // Get the AI response using the streaming endpoint
    console.log('🚀 Getting streaming response from Gist API');
    const responseStream = await fetch(`https://api.gist.ai/v1/chat/response/${chatData.thread_id}/${chatData.turn_id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.GIST_API_KEY}`,
        'X-User-ID': userId
      }
    });

    console.log('📡 Gist streaming response status:', responseStream.status);

    if (!responseStream.ok) {
      const errorText = await responseStream.text();
      console.error('❌ Failed to get response stream:', responseStream.status, errorText);
      throw new Error(`Failed to get response stream: ${responseStream.status} ${errorText}`);
    }

    // Process the streaming response
    const reader = responseStream.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';
    let responseComplete = false;

    console.log('📖 Processing streaming response...');
    while (!responseComplete) {
      const { done, value } = await reader.read();
      if (done) {
        console.log('📖 Stream reading completed');
        break;
      }

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
            console.warn('Failed to parse streaming data:', line);
          }
        } else if (line.startsWith('event: complete')) {
          responseComplete = true;
          console.log('📖 Received completion event');
          break;
        }
      }
    }

    console.log('✅ Full response assembled, length:', fullResponse.length);

    // Get citations for the response
    let citations = [];
    try {
      console.log('🚀 Fetching citations...');
      const citationsResponse = await fetch(`https://api.gist.ai/v1/chat/citations/${chatData.thread_id}/${chatData.turn_id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.GIST_API_KEY}`,
          'X-User-ID': userId
        }
      });

      console.log('📡 Citations response status:', citationsResponse.status);
      if (citationsResponse.ok) {
        citations = await citationsResponse.json();
        console.log('✅ Citations fetched:', citations.length, 'items');
      } else {
        console.warn('⚠️ Citations request failed:', citationsResponse.status);
      }
    } catch (error) {
      console.warn('Failed to fetch citations:', error);
    }

    // Get attributions for the response
    let attributions = {};
    try {
      console.log('🚀 Fetching attributions...');
      const attributionsResponse = await fetch(`https://api.gist.ai/v1/chat/attributions/${chatData.thread_id}/${chatData.turn_id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.GIST_API_KEY}`,
          'X-User-ID': userId
        }
      });

      console.log('📡 Attributions response status:', attributionsResponse.status);
      if (attributionsResponse.ok) {
        attributions = await attributionsResponse.json();
        console.log('✅ Attributions fetched:', Object.keys(attributions).length, 'keys');
      } else {
        console.warn('⚠️ Attributions request failed:', attributionsResponse.status);
      }
    } catch (error) {
      console.warn('Failed to fetch attributions:', error);
    }

    if (!fullResponse) {
      console.error('❌ No response content generated');
      return res.status(500).json({ error: 'No response generated' });
    }

    console.log('✅ Returning successful response');
    // Return successful response with citations and attributions
    return res.status(200).json({
      success: true,
      answer: fullResponse,
      threadId: chatData.thread_id,
      turnId: chatData.turn_id,
      citations: citations,
      attributions: attributions,
      model: 'gist-ai',
      responseTime: chatData.response_time || 0
    });

  } catch (error) {
    console.error('❌ Chat API error:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Error code:', error.code);
    console.error('❌ Error name:', error.name);

    // Log environment info for debugging
    console.log('🔍 Environment debugging info:');
    console.log('   - NODE_ENV:', process.env.NODE_ENV);
    console.log('   - API Key exists:', !!process.env.GIST_API_KEY);
    console.log('   - API Key length:', process.env.GIST_API_KEY?.length || 0);
    console.log('   - Request method:', req.method);
    console.log('   - Request headers keys:', Object.keys(req.headers));

    // Handle specific error types
    if (error.message.includes('401')) {
      console.error('🔑 Authentication error detected');
      return res.status(401).json({ 
        error: 'Invalid Gist API key',
        debug: {
          apiKeyExists: !!process.env.GIST_API_KEY,
          apiKeyPrefix: process.env.GIST_API_KEY ? process.env.GIST_API_KEY.substring(0, 8) + '...' : 'NOT SET',
          originalError: error.message
        }
      });
    }
    if (error.message.includes('429')) {
      console.error('🚫 Rate limit error detected');
      return res.status(429).json({ error: 'Gist API rate limit exceeded. Please try again later.' });
    }
    if (error.message.includes('400')) {
      console.error('📝 Bad request error detected');
      return res.status(400).json({ error: 'Invalid request to Gist API' });
    }

    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      console.error('⏰ Timeout error detected');
      return res.status(408).json({ error: 'Request timeout' });
    }

    // Generic error
    console.error('🔥 Generic error - returning 500');
    return res.status(500).json({ 
      error: 'Error processing your request',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      debug: process.env.NODE_ENV === 'development' ? {
        errorType: error.name,
        errorCode: error.code,
        timestamp: new Date().toISOString()
      } : undefined
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