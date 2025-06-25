import axios from 'axios';
import { URL } from 'url';
import { validateUrl } from '../../utils/urlValidator';
import { htmlModifier } from './utils/htmlModifier';

// Simple rate limiting (in-memory for serverless)
const requestCounts = new Map();
const RATE_LIMIT = parseInt(process.env.RATE_LIMIT_REQUESTS || '100');
const RATE_WINDOW = 60 * 1000; // 1 minute

export default async function handler(req, res) {
  try {
    // Only allow GET requests
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Get URL from query parameters
    const targetUrl = req.query.url;
    const isTest = req.query.test === 'true';

    // Debug logging for widget script requests
    if (targetUrl && targetUrl.includes('widget.js')) {
      console.log('Widget script requested:', targetUrl);
    }

    // Validate URL parameter
    if (!targetUrl) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    // Use our URL validator to normalize and validate the URL
    const validation = validateUrl(targetUrl);
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.error });
    }

    const normalizedUrl = validation.normalizedUrl;

    // Security checks - block internal/private IPs
    const blockedHosts = ['localhost', '127.0.0.1', '0.0.0.0', '::1'];
    if (blockedHosts.includes(new URL(normalizedUrl).hostname)) {
      return res.status(403).json({ error: 'Access to local addresses is not allowed' });
    }

    // Check for private IP ranges (RFC 1918)
    const privateIPRegex = /^(10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|192\.168\.)/;
    if (privateIPRegex.test(new URL(normalizedUrl).hostname)) {
      return res.status(403).json({ error: 'Access to private IP addresses is not allowed' });
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
        error: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((clientRequests.resetTime - now) / 1000)
      });
    }

    // If this is just a test request, return success
    if (isTest) {
      try {
        await axios.head(normalizedUrl, { 
          timeout: 8000,
          validateStatus: status => status < 500,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
          }
        });
        return res.status(200).json({ success: true });
      } catch (error) {
        console.error('Test request failed for:', normalizedUrl, error.message);
        return res.status(400).json({ 
          error: 'Unable to reach the specified website',
          details: error.message,
          code: error.code,
          suggestion: 'Please verify the URL is correct and accessible.'
        });
      }
    }

    // Fetch the target website
    const response = await axios.get(normalizedUrl, {
      timeout: 30000,
      maxRedirects: 5,
      validateStatus: status => status < 500,
      responseType: 'text',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Upgrade-Insecure-Requests': '1'
      }
    });

    // Get content type
    const contentType = response.headers['content-type'] || 'text/html';

    // If not HTML, return the response as-is
    if (!contentType.includes('text/html')) {
      res.setHeader('Content-Type', contentType);
      return res.send(response.data);
    }

    // Get the current host for widget injection
    const currentHost = req.headers.host || process.env.VERCEL_URL || 'localhost:3000';

    // Use HTML modifier to handle all HTML modifications
    const modifiedHtml = htmlModifier.modifyHtml(response.data, normalizedUrl, currentHost);

    // Set response headers
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Content-Security-Policy', "frame-ancestors 'self'");

    // Send modified HTML
    res.send(modifiedHtml);

  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ 
      error: 'Failed to proxy the request',
      details: error.message
    });
  }
}

// Export config for Next.js API routes
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb'
    },
    responseLimit: false
  }
};