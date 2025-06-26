// GPADemo Chat API - Placeholder Implementation
// External API functionality removed - ready for reimplementation

// Rate limiting (simple in-memory for serverless)
const requestCounts = new Map();
const RATE_LIMIT = parseInt(process.env.CHAT_RATE_LIMIT || '20');
const RATE_WINDOW = 60 * 1000; // 1 minute

// Debug: Log basic info on module load
console.log('🔧 Chat API module loaded - Placeholder mode');
console.log('🔧 Environment check:');
console.log('   - NODE_ENV:', process.env.NODE_ENV);
console.log('   - CHAT_RATE_LIMIT:', process.env.CHAT_RATE_LIMIT || 'default(20)');

export default async function handler(req, res) {
  console.log('🟢 Chat API: Request received (Placeholder mode)');
  console.log('📍 Method:', req.method);
  console.log('📍 URL:', req.url);

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

    // No external API key needed in placeholder mode
    console.log('✅ Placeholder mode - no external API required')

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
        error: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((clientRequests.resetTime - now) / 1000)
      });
    }

    // Extract request data
    console.log('📦 Request body:', JSON.stringify(req.body, null, 2));
    const { question, context } = req.body;

    if (!question) {
      console.log('❌ Question is required but not provided');
      return res.status(400).json({ error: 'Question is required' });
    }
    
    console.log('❓ Question received:', question);
    console.log('📄 Context received:', context ? 'Yes' : 'No');

    // Generate a mock response
    const mockResponse = generateMockResponse(question);
    
    console.log('✅ Generated mock response');

    // Return mock response with placeholder data
    return res.status(200).json({
      success: true,
      answer: mockResponse,
      threadId: `mock_thread_${Date.now()}`,
      turnId: 1,
      citations: [],
      attributions: {},
      model: 'placeholder',
      responseTime: Math.floor(Math.random() * 1000) + 500
    });

  } catch (error) {
    console.error('❌ Chat API error:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);

    // Generic error
    return res.status(500).json({ 
      error: 'Error processing your request',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Function to generate mock responses based on the question
function generateMockResponse(question) {
  const responses = [
    "This is a placeholder response. The AI functionality has been temporarily disabled while we implement a new chat system.",
    "I'm currently in maintenance mode. Please check back soon for full AI capabilities.",
    "Thank you for your question. The chat system is being updated and will be available shortly.",
    "The AI backend is currently being reconfigured. This is a temporary response while we work on improvements.",
    "Your question has been received, but the AI system is temporarily offline for updates."
  ];
  
  // Simple hash function to make responses somewhat consistent for the same question
  let hash = 0;
  for (let i = 0; i < question.length; i++) {
    const char = question.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  const index = Math.abs(hash) % responses.length;
  return responses[index];
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