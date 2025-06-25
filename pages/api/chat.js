import OpenAI from 'openai';

// Configure OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Rate limiting (simple in-memory for serverless)
const requestCounts = new Map();
const RATE_LIMIT = parseInt(process.env.CHAT_RATE_LIMIT || '20'); // Lower limit for AI requests
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
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ 
        error: 'OpenAI API key not configured. Please add OPENAI_API_KEY to your environment variables.' 
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
    const { question, pageContext } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const prompt = `You are an AI assistant helping answer questions about the current webpage. 
Here is the relevant content from the page that might help answer the question:

${pageContext}

Question: ${question}

Please provide a clear, concise answer based on the page content. If the page content doesn't contain relevant information to answer the question, say so and provide a general response.`;

    // Make OpenAI API call
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { "role": "system", "content": "You are a helpful AI assistant answering questions about webpage content." },
        { "role": "user", "content": prompt }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const answer = completion.choices[0].message.content;
    
    if (!answer) {
      return res.status(500).json({ error: 'No response generated' });
    }

    // Return successful response
    return res.status(200).json({
      success: true,
      answer: answer,
      model: "gpt-3.5-turbo",
      usage: completion.usage
    });

  } catch (error) {
    console.error('OpenAI API error:', error);

    // Handle OpenAI specific errors
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;

      if (status === 401) {
        return res.status(401).json({ error: 'Invalid OpenAI API key' });
      }
      if (status === 429) {
        return res.status(429).json({ error: 'OpenAI API rate limit exceeded. Please try again later.' });
      }
      if (status === 400) {
        return res.status(400).json({ error: 'Invalid request to OpenAI API' });
      }

      return res.status(status).json({ 
        error: errorData?.error?.message || 'OpenAI API error',
        details: process.env.NODE_ENV === 'development' ? errorData : undefined
      });
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