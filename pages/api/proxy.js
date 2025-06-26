import axios from 'axios';
import { URL } from 'url';
import { validateUrl } from '../../utils/urlValidator';

// Simple rate limiting (in-memory for serverless)
const requestCounts = new Map();
const RATE_LIMIT = parseInt(process.env.RATE_LIMIT_REQUESTS || '100');
const RATE_WINDOW = 60 * 1000; // 1 minute

export default async function handler(req, res) {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // Only allow GET and POST requests
    if (req.method !== 'GET' && req.method !== 'POST') {
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
        
        if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
          return res.status(408).json({ 
            error: 'Website is taking too long to respond. It may be slow or have restrictions.',
            details: 'Connection timeout'
          });
        }
        
        if (error.code === 'ECONNREFUSED') {
          return res.status(503).json({ 
            error: 'Website refused the connection.',
            details: 'Connection refused'
          });
        }
        
        return res.status(400).json({ 
          error: 'Unable to reach the specified website',
          details: error.message,
          code: error.code
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

    // Basic HTML modification to fix relative URLs and inject widget
    let html = response.data;
    if (contentType.includes('text/html')) {
      // Basic URL rewriting - convert relative URLs to absolute
      const baseUrl = new URL(normalizedUrl).origin;
      
      // Fix relative links (use global replace)
      html = html.replace(/href="\/([^"]*)"/g, `href="${baseUrl}/$1"`);
      html = html.replace(/src="\/([^"]*)"/g, `src="${baseUrl}/$1"`);
      
      // Add base tag for better relative URL handling
      if (html.includes('<head>')) {
        html = html.replace('<head>', `<head><base href="${normalizedUrl}">`);
      }

      // Inject widget.js script into the HTML
      const protocol = req.headers['x-forwarded-proto'] || (req.headers['x-forwarded-for'] ? 'https' : 'http');
      const host = req.headers.host || 'localhost:3000';
      const widgetScript = `<script src="${protocol}://${host}/widget.js"></script>`;
      
      // Create demo banner
      const demoBanner = `
        <style>
          @keyframes demoScrollText {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          #demo-banner {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            width: 100% !important;
            background: #FFD700 !important;
            color: #000 !important;
            font-family: Arial, sans-serif !important;
            font-weight: bold !important;
            font-size: 16px !important;
            text-align: center !important;
            padding: 12px !important;
            z-index: 9999999 !important;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2) !important;
            overflow: hidden !important;
            white-space: nowrap !important;
          }
          #demo-banner .scrolling-container {
            animation: demoScrollText 15s linear infinite !important;
            display: inline-block !important;
            white-space: nowrap !important;
          }
            body {
            margin-top: 48px !important; 
            padding-top: 0 !important; 
          }
        </style>
        <div id="demo-banner">
          <div class="scrolling-container">
            THIS IS A DEMO, NOT A LIVE VERSION OF YOUR WEBSITE. THIS IS A DEMO, NOT A LIVE VERSION OF YOUR WEBSITE. THIS IS A DEMO, NOT A LIVE VERSION OF YOUR WEBSITE. THIS IS A DEMO, NOT A LIVE VERSION OF YOUR WEBSITE. THIS IS A DEMO, NOT A LIVE VERSION OF YOUR WEBSITE. THIS IS A DEMO, NOT A LIVE VERSION OF YOUR WEBSITE.
          </div>
        </div>
      `;
      
      // Create admin sidebar
      const adminSidebar = `
        <style>
          #admin-sidebar {
            position: fixed !important;
            top: 0 !important;
            right: 0 !important;
            width: 240px !important;
            height: 100vh !important;
            background: #f7f7f8 !important;
            border-right: none !important;
            border-left: 1px solid #e0e0e0 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            padding: 0 !important;
            font-family: 'Inter', -apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important;
            z-index: 999998 !important;
            display: flex !important;
            flex-direction: column !important;
            transition: transform 0.3s ease, width 0.3s ease !important;
            border: 2px solid transparent !important;
            background-image: linear-gradient(#f7f7f8, #f7f7f8), linear-gradient(60deg, #FF8C42, #4B9FE1, #8860D0) !important;
            background-origin: border-box !important;
            background-clip: padding-box, border-box !important;
          }
          #admin-sidebar.minimized {
            transform: translateX(100%) !important;
          }
          #admin-sidebar .sidebar-toggle-btn {
            position: absolute !important;
            left: -18px !important;
            top: 50% !important;
            transform: translateY(-50%);
            z-index: 1000001 !important;
            width: 32px !important;
            height: 32px !important;
            background: #e5e7eb !important;
            color: #666 !important;
            border: 1px solid #d1d5db !important;
            border-radius: 50% !important;
            box-shadow: 0 1px 4px rgba(0,0,0,0.04) !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            cursor: pointer !important;
            transition: background 0.2s, color 0.2s, left 0.3s !important;
            border: 2px solid transparent !important;
            background-image: linear-gradient(#e5e7eb, #e5e7eb), linear-gradient(60deg, #FF8C42, #4B9FE1, #8860D0) !important;
            background-origin: border-box !important;
            background-clip: padding-box, border-box !important;
          }
          #admin-sidebar.minimized .sidebar-toggle-btn {
            left: -18px !important;
          }
          #admin-sidebar .sidebar-toggle-btn:hover {
            background: #d1d5db !important;
            color: #333 !important;
          }
          #admin-sidebar .sidebar-toggle-btn svg {
            width: 16px !important;
            height: 16px !important;
            display: block !important;
          }
          .admin-header {
            font-size: 18px;
            font-weight: 600;
            margin: 0 0 18px 0;
            padding: 24px 24px 0 24px;
            color: #222;
            letter-spacing: 0.01em;
          }
          .collapsible-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            cursor: pointer;
            padding: 0 24px 0 24px;
            font-size: 15px;
            font-weight: 500;
            color: #333;
            margin-bottom: 18px !important;
            margin-top: 8px;
            user-select: none;
          }
          .collapsible-header svg {
            width: 18px;
            height: 18px;
            transition: transform 0.2s;
          }
          .collapsible-header.open svg {
            transform: rotate(90deg);
          }
          .collapsible-content {
            padding: 0 24px 12px 24px;
            display: none;
            margin-top: 8px !important;
          }
          .collapsible-content.open {
            display: block;
          }
          .source-toggle {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
            cursor: pointer;
            user-select: none;
            font-size: 13px;
            color: #333;
          }
          .toggle-switch {
            position: relative;
            width: 28px;
            height: 16px;
            background: #e4e4e4;
            border-radius: 8px;
            margin-right: 10px;
            transition: background 0.2s;
            flex-shrink: 0;
          }
          .toggle-switch::before {
            content: "";
            position: absolute;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: #fff;
            top: 2px;
            left: 2px;
            transition: transform 0.2s;
            box-shadow: none;
          }
          .source-toggle input:checked + .toggle-switch {
            background: #6366f1;
          }
          .source-toggle input:checked + .toggle-switch::before {
            transform: translateX(12px);
          }
          .source-toggle input {
            position: absolute;
            opacity: 0;
            cursor: pointer;
            height: 0;
            width: 0;
          }
          .source-toggle span {
            margin-left: 0;
            font-size: 13px;
            color: #333;
            font-weight: 400;
          }
          .size-section {
            padding: 0 24px 18px 24px;
            margin-bottom: 0;
          }
          .size-label {
            font-size: 15px;
            font-weight: 500;
            color: #333;
            margin-bottom: 8px;
            margin-top: 12px;
            display: block;
          }
          .size-btn-group {
            display: flex;
            gap: 8px;
          }
          .size-btn {
            flex: 1;
            padding: 8px 0;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            background: #fff;
            color: #333;
            cursor: pointer;
            font-size: 13px;
            font-weight: 500;
            transition: background 0.2s, color 0.2s, border 0.2s;
          }
          .size-btn.selected, .size-btn:active {
            background: #6366f1;
            color: #fff;
            border-color: #6366f1;
          }
          .size-btn:hover:not(.selected) {
            background: #f1f1f9;
            color: #333;
          }
          @media (max-width: 768px) {
            #admin-sidebar {
              display: none !important;
            }
          }
          #admin-sidebar {
            padding-top: 72px !important;
          }
        </style>

        <div id="admin-sidebar">
          <button class="sidebar-toggle-btn" title="Show/Hide Admin Panel">
            <svg id="sidebar-toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <div class="admin-header">Widget Admin</div>
          <div class="collapsible-header" id="sources-header">
            Sources
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>
          <div class="collapsible-content open" id="sources-content">
            ${[
              { id: 'news', label: 'News' },
              { id: 'business', label: 'Business' },
              { id: 'lifestyle', label: 'Lifestyle' },
              { id: 'sports', label: 'Sports' },
              { id: 'books', label: 'Books' },
              { id: 'academic', label: 'Academic' },
              { id: 'reference', label: 'Reference' }
            ].map(source => `
              <label class="source-toggle">
                <input type="checkbox" id="source-${source.id}">
                <div class="toggle-switch"></div>
                <span>${source.label}</span>
              </label>
            `).join('')}
          </div>
          <div class="size-section">
            <span class="size-label">Widget Size</span>
            <div class="size-btn-group">
              <button class="size-btn selected" data-size="small">Small</button>
              <button class="size-btn" data-size="medium">Medium</button>
              <button class="size-btn" data-size="large">Large</button>
            </div>
          </div>
        </div>
        <script>
          document.addEventListener('DOMContentLoaded', function() {
            const sidebar = document.getElementById('admin-sidebar');
            const toggleBtn = sidebar.querySelector('.sidebar-toggle-btn');
            const toggleIcon = document.getElementById('sidebar-toggle-icon');
            let isMinimized = false;

            function setPanelState(minimized) {
              isMinimized = minimized;
              sidebar.classList.toggle('minimized', minimized);
              // Chevron direction: right if minimized, left if expanded
              toggleIcon.innerHTML = minimized
                ? '<polyline points="9 18 15 12 9 6"></polyline>'
                : '<polyline points="15 18 9 12 15 6"></polyline>';
            }

            toggleBtn.addEventListener('click', function() {
              setPanelState(!isMinimized);
            });

            // Collapsible Sources section
            const sourcesHeader = document.getElementById('sources-header');
            const sourcesContent = document.getElementById('sources-content');
            let sourcesOpen = true;
            sourcesHeader.addEventListener('click', function() {
              sourcesOpen = !sourcesOpen;
              sourcesHeader.classList.toggle('open', sourcesOpen);
              sourcesContent.classList.toggle('open', sourcesOpen);
            });

            // Size button group
            const sizeBtns = sidebar.querySelectorAll('.size-btn');
            sizeBtns.forEach(btn => {
              btn.addEventListener('click', function() {
                sizeBtns.forEach(b => b.classList.remove('selected'));
                this.classList.add('selected');
                // (Future: trigger widget size change)
              });
            });

            // Initialize state
            setPanelState(false);
          });
        </script>
      `;
      
      console.log(`Injecting widget script: ${widgetScript}`);
      
      // More robust injection logic
      if (html.includes('</head>')) {
        // Inject before closing head tag
        html = html.replace('</head>', `${widgetScript}</head>`);
        console.log('Widget injected before </head>');
      } else if (html.includes('</body>')) {
        // Fallback: inject before closing body tag
        html = html.replace('</body>', `${widgetScript}</body>`);
        console.log('Widget injected before </body>');
      } else if (html.includes('<body')) {
        // Another fallback: inject after opening body tag
        html = html.replace(/(<body[^>]*>)/, `$1${widgetScript}`);
        console.log('Widget injected after <body>');
      } else {
        // Last resort: append to the end
        html += widgetScript;
        console.log('Widget appended to end of HTML');
      }
      
      // Inject demo banner right after opening body tag
      if (html.includes('<body')) {
        html = html.replace(/(<body[^>]*>)/, `$1${demoBanner}${adminSidebar}`);
        console.log('Demo banner and admin sidebar injected after <body>');
      } else {
        // Fallback: add at the beginning of the HTML
        html = demoBanner + adminSidebar + html;
        console.log('Demo banner and admin sidebar added at beginning of HTML');
      }
      
      // Verify injection
      if (html.includes('widget.js')) {
        console.log('✓ Widget script successfully injected into HTML');
      } else {
        console.log('✗ Widget script NOT found in final HTML');
      }
      
      if (html.includes('demo-banner')) {
        console.log('✓ Demo banner successfully injected into HTML');
      } else {
        console.log('✗ Demo banner NOT found in final HTML');
      }
    }

    // Set appropriate headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('X-Proxied-URL', normalizedUrl);
    
    // Remove headers that might prevent embedding
    res.removeHeader('X-Frame-Options');
    res.removeHeader('Content-Security-Policy');
    
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