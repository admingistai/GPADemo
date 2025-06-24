import axios from 'axios';
import { URL } from 'url';
import { validateUrl } from '../../utils/urlValidator';

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
        // Do a HEAD request to check if URL is reachable
        await axios.head(normalizedUrl, { 
          timeout: 8000, // Increased timeout for slow websites
          validateStatus: status => status < 500,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
          }
        });
        return res.status(200).json({ success: true });
      } catch (error) {
        console.error('Test request failed for:', normalizedUrl, error.message);
        
        // Provide more specific error messages
        if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
          return res.status(408).json({ 
            error: 'Website is taking too long to respond. It may be slow or have restrictions.',
            details: 'Connection timeout',
            suggestion: 'Try a different website or check if the URL is correct.'
          });
        }
        
        if (error.code === 'ECONNREFUSED') {
          return res.status(503).json({ 
            error: 'Website refused the connection.',
            details: 'Connection refused',
            suggestion: 'The website may be down or blocking automated requests.'
          });
        }
        
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
      timeout: 30000, // 30 seconds for main request
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

    // Basic HTML modification to fix relative URLs and inject widget
    let html = response.data;
    if (contentType.includes('text/html')) {
      // Basic URL rewriting - convert relative URLs to absolute
      const baseUrl = new URL(normalizedUrl).origin;
      
      // Fix relative links
      html = html.replace(/href="\/([^"]*)"/, `href="${baseUrl}/$1"`);
      html = html.replace(/src="\/([^"]*)"/, `src="${baseUrl}/$1"`);
      
      // Add base tag for better relative URL handling
      if (html.includes('<head>')) {
        html = html.replace('<head>', `<head><base href="${normalizedUrl}">`);
      }

      // Inject widget.js script into the HTML with absolute URL and no defer
      const protocol = req.headers['x-forwarded-proto'] || 'http';
      const host = req.headers.host || 'localhost:3000';
      
      // Pass through any additional query parameters (like config) to the widget
      const currentUrl = new URL(`${protocol}://${host}${req.url}`);
      const widgetParams = new URLSearchParams();
      
      // Copy relevant parameters to the current page URL (for the widget to read)
      for (const [key, value] of currentUrl.searchParams.entries()) {
        if (key !== 'url' && key !== 'test') { // Exclude proxy-specific parameters
          widgetParams.set(key, value);
        }
      }
      
      // Add the parameters to the current page URL so the widget can access them
      const currentPageUrl = currentUrl.pathname + (widgetParams.toString() ? '?' + widgetParams.toString() : '');
      const updateUrlScript = widgetParams.toString() ? 
        `<script>history.replaceState({}, '', '${currentPageUrl}');</script>` : '';
      
      const widgetScript = `${updateUrlScript}
      <style>
        @keyframes widgetSpotlight {
          0% {
            opacity: 0;
            transform: scale(0.5) translateY(100px);
          }
          20% {
            opacity: 1;
            transform: scale(1.1) translateY(0);
          }
          30% {
            transform: scale(1) translateY(0);
          }
          40% {
            box-shadow: 0 0 0 0 rgba(66, 133, 244, 0.6);
          }
          60% {
            box-shadow: 0 0 0 20px rgba(66, 133, 244, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(66, 133, 244, 0);
          }
        }

        @keyframes widgetArrow {
          0% {
            opacity: 0;
            transform: translateY(-100px);
          }
          20% {
            opacity: 1;
            transform: translateY(0);
          }
          80% {
            opacity: 1;
            transform: translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateY(20px);
          }
        }

        #widget-spotlight {
          position: fixed;
          bottom: 100px;
          right: 30px;
          width: 80px;
          height: 80px;
          pointer-events: none;
          z-index: 999998;
          animation: widgetArrow 3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        #widget-spotlight::before {
          content: "👇";
          position: absolute;
          font-size: 40px;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
        }

        #gist-widget-container {
          animation: widgetSpotlight 3s cubic-bezier(0.4, 0, 0.2, 1) forwards !important;
        }
      </style>
      <script src="${protocol}://${host}/widget.js"></script>
      <script>
        // Wait for widget to be created
        function waitForWidget() {
          const checkInterval = setInterval(() => {
            const widget = document.querySelector('#gist-widget-container');
            if (widget) {
              clearInterval(checkInterval);
              
              // Add spotlight element
              const spotlight = document.createElement('div');
              spotlight.id = 'widget-spotlight';
              document.body.appendChild(spotlight);

              // Remove the spotlight after animation
              setTimeout(() => {
                spotlight.style.opacity = '0';
                setTimeout(() => spotlight.remove(), 1000);
              }, 3000);
            }
          }, 100);

          // Timeout after 10 seconds
          setTimeout(() => clearInterval(checkInterval), 10000);
        }

        // Start checking once the page is loaded
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', waitForWidget);
        } else {
          waitForWidget();
        }
      </script>`;
      
      // Add demo banner
      const demoBanner = `
        <div id="demo-banner" style="
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: #FFD700;
          color: #000;
          text-align: center;
          padding: 10px;
          font-family: Arial, sans-serif;
          font-weight: bold;
          font-size: 14px;
          letter-spacing: 1px;
          z-index: 999999;
          box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        ">
          THIS IS A DEMO, NOT A LIVE VERSION OF YOUR WEBSITE.
        </div>
        <style>
          body { margin-top: 50px !important; }
        </style>
      `;
      
      if (html.includes('</head>')) {
        // Inject before closing head tag
        html = html.replace('</head>', `${widgetScript}</head>`);
      } else if (html.includes('</body>')) {
        // Fallback: inject before closing body tag
        html = html.replace('</body>', `${widgetScript}</body>`);
      } else {
        // Last resort: append to the end
        html += widgetScript;
      }
      
      // Inject demo banner after body tag
      if (html.includes('<body')) {
        html = html.replace(/(<body[^>]*>)/, `$1${demoBanner}`);
      } else {
        // Fallback: prepend to HTML
        html = demoBanner + html;
      }
    }

    // Set appropriate headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('X-Proxied-URL', normalizedUrl);
    
    // Remove headers that might prevent embedding
    res.removeHeader('X-Frame-Options');
    res.removeHeader('Content-Security-Policy');
    
    // Add CORS headers to allow widget script loading
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Send the content
    return res.status(200).send(html);

  } catch (error) {
    console.error('Proxy error:', error.message);

    // Determine appropriate error response
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return res.status(408).json({ 
        error: 'Request timed out. The website may be slow or unavailable.' 
      });
    }

    if (error.response) {
      if (error.response.status === 404) {
        return res.status(404).json({ error: 'Website not found' });
      }
      if (error.response.status === 403) {
        return res.status(403).json({ error: 'Access forbidden by the target website' });
      }
      if (error.response.status >= 500) {
        return res.status(502).json({ error: 'Target website server error' });
      }
    }

    if (error.request) {
      return res.status(502).json({ 
        error: 'Unable to reach the website. Please check the URL.' 
      });
    }

    // Something else happened
    return res.status(500).json({ 
      error: 'An unexpected error occurred while processing your request',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
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