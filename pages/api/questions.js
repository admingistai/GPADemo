// Prorata API Configuration
const PRORATA_CONFIG = {
  API_BASE_URL: process.env.PRORATA_API_BASE_URL || 'https://api.prorata.ai/v1',
  API_KEY: process.env.PRORATA_API_KEY,
};

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-ID');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Check if API key is configured
    if (!PRORATA_CONFIG.API_KEY) {
      return res.status(500).json({ 
        error: 'Prorata API key not configured.' 
      });
    }

    const userId = req.headers['x-user-id'] || req.body?.userId || 'anonymous';

    // Handle GET request for recommended questions
    if (req.method === 'GET') {
      const count = parseInt(req.query.count) || 3;
      
      const response = await fetch(
        `${PRORATA_CONFIG.API_BASE_URL}/questions/recommended?count=${count}`,
        {
          headers: {
            'Authorization': `Bearer ${PRORATA_CONFIG.API_KEY}`,
            'X-User-ID': userId
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return res.status(response.status).json({ 
          error: errorData.error || 'Failed to fetch recommended questions' 
        });
      }

      const data = await response.json();
      return res.status(200).json({
        success: true,
        questions: data.questions?.recommended_queries?.questions || []
      });
    }

    // Handle POST request for related questions
    if (req.method === 'POST') {
      const { threadId, turnId, question, numQuestions = 3 } = req.body;

      // If no threadId/turnId, return recommended questions instead
      if (!threadId || !turnId) {
        const count = numQuestions || 3;
        
        const response = await fetch(
          `${PRORATA_CONFIG.API_BASE_URL}/questions/recommended?count=${count}`,
          {
            headers: {
              'Authorization': `Bearer ${PRORATA_CONFIG.API_KEY}`,
              'X-User-ID': userId
            }
          }
        );

        if (!response.ok) {
          // Return fallback questions if API fails
          return res.status(200).json({
            success: true,
            questions: [
              "What are the main topics covered here?",
              "Can you summarize the key points?",
              "What's the most important information?"
            ]
          });
        }

        const data = await response.json();
        return res.status(200).json({
          success: true,
          questions: data.questions?.recommended_queries?.questions || []
        });
      }

      const response = await fetch(
        `${PRORATA_CONFIG.API_BASE_URL}/questions/related`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${PRORATA_CONFIG.API_KEY}`,
            'X-User-ID': userId,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            thread_id: threadId,
            turn_id: turnId,
            question: question,
            num_recommended_queries: numQuestions,
            max_words_question: 14
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return res.status(response.status).json({ 
          error: errorData.error || 'Failed to fetch related questions' 
        });
      }

      const data = await response.json();
      return res.status(200).json({
        success: true,
        questions: data.questions?.recommended_queries?.questions || []
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Questions API error:', error.message);
    return res.status(500).json({ 
      error: 'An unexpected error occurred',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Export config for Next.js API routes
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb'
    }
  }
};