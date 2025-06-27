// Prorata API Configuration
const PRORATA_CONFIG = {
  API_BASE_URL: process.env.PRORATA_API_BASE_URL || 'https://api.prorata.ai/v1',
  API_KEY: process.env.PRORATA_API_KEY,
};

// Simple in-memory rate limiting for analytics
const analyticsRequestCounts = new Map();
const ANALYTICS_RATE_LIMIT = 100; // Higher limit for analytics
const RATE_WINDOW = 60 * 1000; // 1 minute

export default async function handler(req, res) {
  // Set CORS headers
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
    if (!PRORATA_CONFIG.API_KEY) {
      return res.status(500).json({ 
        error: 'Prorata API key not configured.' 
      });
    }

    // Simple rate limiting
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    const clientRequests = analyticsRequestCounts.get(clientIP) || { count: 0, resetTime: now + RATE_WINDOW };

    if (now > clientRequests.resetTime) {
      clientRequests.count = 0;
      clientRequests.resetTime = now + RATE_WINDOW;
    }

    clientRequests.count++;
    analyticsRequestCounts.set(clientIP, clientRequests);

    if (clientRequests.count > ANALYTICS_RATE_LIMIT) {
      return res.status(429).json({ 
        error: 'Too many analytics requests. Please try again later.',
        retryAfter: Math.ceil((clientRequests.resetTime - now) / 1000)
      });
    }

    // Extract event data
    const { eventName, properties = {} } = req.body;

    // Validate request
    if (!eventName) {
      return res.status(400).json({ error: 'Event name is required' });
    }

    // Add common properties
    const enrichedProperties = {
      widgetType: 'chat',
      timestamp: new Date().toISOString(),
      pageUrl: properties.pageUrl || req.headers.referer || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
      ...properties
    };

    // For now, just log analytics locally since Gist AI might not have this endpoint
    console.log('Analytics Event:', eventName, enrichedProperties);
    
    // Return success without calling external API
    return res.status(200).json({
      success: true,
      message: 'Event tracked successfully'
    });
    
    /* Uncomment when Gist AI analytics endpoint is available
    const response = await fetch(`${PRORATA_CONFIG.API_BASE_URL}/analytics/track`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PRORATA_CONFIG.API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        eventName,
        properties: enrichedProperties
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Don't expose analytics failures to the client
      console.error('Analytics API error:', errorData);
      
      // Return success even if analytics fails (non-critical)
      return res.status(200).json({ 
        success: true,
        message: 'Event recorded locally'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Event tracked successfully'
    });
    */

  } catch (error) {
    console.error('Analytics API error:', error.message);
    
    // Return success even on error (analytics is non-critical)
    return res.status(200).json({ 
      success: true,
      message: 'Event recorded locally'
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