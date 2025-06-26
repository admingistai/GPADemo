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
            top: 60px !important;
            right: 20px !important;
            width: 300px !important;
            background: #ffffff !important;
            border-radius: 12px !important;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
            padding: 20px !important;
            font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
            z-index: 999998 !important;
            transition: transform 0.3s ease, width 0.3s ease !important;
          }

          #admin-sidebar.minimized {
            transform: translateX(calc(100% + 20px)) !important;
          }

          #admin-sidebar .header {
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            margin-bottom: 20px !important;
          }

          #admin-sidebar .minimize-btn {
            background: none !important;
            border: none !important;
            color: #666 !important;
            cursor: pointer !important;
            padding: 4px 8px !important;
            font-size: 20px !important;
            line-height: 1 !important;
            border-radius: 4px !important;
            transition: all 0.2s !important;
            position: absolute !important;
            left: -40px !important;
            top: 50% !important;
            transform: translateY(-50%) !important;
            background: white !important;
            box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1) !important;
            width: 30px !important;
            height: 30px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          }

          #admin-sidebar.minimized .minimize-btn {
            left: -50px !important;
            transform: translateY(-50%) rotate(180deg) !important;
          }

          #admin-sidebar .minimize-btn:hover {
            background: #f5f5f5 !important;
            color: #333 !important;
          }

          #admin-sidebar h2 {
            margin: 0 !important;
            font-size: 18px !important;
            color: #1a1a1a !important;
            font-weight: 600 !important;
          }

          .admin-section {
            margin-bottom: 24px !important;
          }

          .admin-section h3 {
            font-size: 14px !important;
            color: #666 !important;
            margin: 0 0 12px 0 !important;
            font-weight: 500 !important;
            text-transform: uppercase !important;
            letter-spacing: 0.5px !important;
          }

          .source-toggle {
            position: relative !important;
            display: flex !important;
            align-items: center !important;
            margin-bottom: 12px !important;
            cursor: pointer !important;
            user-select: none !important;
          }

          .toggle-switch {
            position: relative !important;
            width: 36px !important;
            height: 20px !important;
            background: #e4e4e4 !important;
            border-radius: 10px !important;
            padding: 2px !important;
            transition: all 0.3s ease !important;
            cursor: pointer !important;
            flex-shrink: 0 !important;
          }

          .toggle-switch::before {
            content: "" !important;
            position: absolute !important;
            width: 16px !important;
            height: 16px !important;
            border-radius: 50% !important;
            background: white !important;
            top: 2px !important;
            left: 2px !important;
            transition: all 0.3s ease !important;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
          }

          .source-toggle input:checked + .toggle-switch {
            background: #4CAF50 !important;
          }

          .source-toggle input:checked + .toggle-switch::before {
            transform: translateX(16px) !important;
          }

          .source-toggle input {
            position: absolute !important;
            opacity: 0 !important;
            cursor: pointer !important;
            height: 0 !important;
            width: 0 !important;
          }

          .source-toggle span {
            margin-left: 16px !important;
            font-size: 14px !important;
            color: #333 !important;
          }

          .size-selector {
            display: flex !important;
            gap: 8px !important;
          }

          .size-btn {
            flex: 1 !important;
            padding: 8px !important;
            border: 1px solid #e4e4e4 !important;
            border-radius: 6px !important;
            background: white !important;
            color: #666 !important;
            cursor: pointer !important;
            transition: all 0.2s !important;
            font-size: 13px !important;
          }

          .size-btn.active {
            background: #4CAF50 !important;
            color: white !important;
            border-color: #4CAF50 !important;
          }

          .size-btn:hover:not(.active) {
            background: #f5f5f5 !important;
          }

          body {
            margin-right: 340px !important;
          }

          @media (max-width: 768px) {
            #admin-sidebar {
              display: none !important;
            }
            body {
              margin-right: 0 !important;
            }
          }
        </style>

        <div id="admin-sidebar">
          <div class="header">
            <h2>Widget Admin Panel</h2>
            <button class="minimize-btn" title="Minimize panel">←</button>
          </div>
          
          <div class="admin-section">
            <h3>Source Selection</h3>
            <label class="source-toggle">
              <input type="checkbox" id="source-news">
              <div class="toggle-switch"></div>
              <span>News</span>
            </label>
            <label class="source-toggle">
              <input type="checkbox" id="source-business">
              <div class="toggle-switch"></div>
              <span>Business</span>
            </label>
            <label class="source-toggle">
              <input type="checkbox" id="source-lifestyle">
              <div class="toggle-switch"></div>
              <span>Lifestyle</span>
            </label>
            <label class="source-toggle">
              <input type="checkbox" id="source-sports">
              <div class="toggle-switch"></div>
              <span>Sports</span>
            </label>
            <label class="source-toggle">
              <input type="checkbox" id="source-books">
              <div class="toggle-switch"></div>
              <span>Books</span>
            </label>
            <label class="source-toggle">
              <input type="checkbox" id="source-academic">
              <div class="toggle-switch"></div>
              <span>Academic</span>
            </label>
            <label class="source-toggle">
              <input type="checkbox" id="source-reference">
              <div class="toggle-switch"></div>
              <span>Reference</span>
            </label>
          </div>

          <div class="admin-section">
            <h3>Widget Size</h3>
            <div class="size-selector">
              <button class="size-btn" data-size="small">Small</button>
              <button class="size-btn active" data-size="medium">Medium</button>
              <button class="size-btn" data-size="large">Large</button>
            </div>
          </div>
        </div>

        <script>
          document.addEventListener('DOMContentLoaded', function() {
            // Initialize admin panel state
            const adminPanel = {
              sources: {
                news: true,
                business: true,
                lifestyle: false,
                sports: false,
                books: false,
                academic: true,
                reference: true
              },
              widgetSize: 'medium',
              isMinimized: false
            };

            // Handle source toggles
            document.querySelectorAll('.source-toggle input[type="checkbox"]').forEach(toggle => {
              const sourceType = toggle.id.replace('source-', '');
              
              // Set initial state
              toggle.checked = adminPanel.sources[sourceType];
              
              // Add click handler to both the input and its parent label
              toggle.addEventListener('change', function(e) {
                e.stopPropagation(); // Prevent event bubbling
                adminPanel.sources[sourceType] = this.checked;
                console.log('Source updated:', sourceType, this.checked);
                
                // Dispatch custom event for widget to handle
                window.dispatchEvent(new CustomEvent('sourceToggle', {
                  detail: {
                    source: sourceType,
                    enabled: this.checked
                  }
                }));

                // Save state
                savePanelState();
              });
            });

            // Handle size buttons
            document.querySelectorAll('.size-btn').forEach(btn => {
              btn.addEventListener('click', function() {
                document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                const newSize = this.dataset.size;
                adminPanel.widgetSize = newSize;
                console.log('Widget size updated:', newSize);
                
                window.dispatchEvent(new CustomEvent('widgetSizeChange', {
                  detail: { size: newSize }
                }));
              });
            });

            // Handle panel minimization
            const sidebar = document.getElementById('admin-sidebar');
            const minimizeBtn = document.querySelector('.minimize-btn');
            
            minimizeBtn.addEventListener('click', function() {
              adminPanel.isMinimized = !adminPanel.isMinimized;
              sidebar.classList.toggle('minimized');
              
              // Update minimize button text
              this.textContent = adminPanel.isMinimized ? '→' : '←';
              this.title = adminPanel.isMinimized ? 'Expand panel' : 'Minimize panel';
              
              // Update body margin
              if (window.innerWidth > 768) {
                document.body.style.marginRight = adminPanel.isMinimized ? '0' : '340px';
              }
            });

            // Handle window resize
            window.addEventListener('resize', function() {
              if (window.innerWidth <= 768) {
                document.body.style.marginRight = '0';
              } else {
                document.body.style.marginRight = adminPanel.isMinimized ? '0' : '340px';
              }
            });

            // Store panel state in localStorage
            function savePanelState() {
              localStorage.setItem('adminPanelState', JSON.stringify(adminPanel));
            }

            // Load panel state from localStorage
            function loadPanelState() {
              const savedState = localStorage.getItem('adminPanelState');
              if (savedState) {
                const state = JSON.parse(savedState);
                
                // Restore sources
                Object.entries(state.sources).forEach(([source, enabled]) => {
                  const toggle = document.getElementById('source-' + source);
                  if (toggle) {
                    toggle.checked = enabled;
                    toggle.dispatchEvent(new Event('change'));
                  }
                });
                
                // Restore size
                const sizeBtn = document.querySelector('.size-btn[data-size="' + state.widgetSize + '"]');
                if (sizeBtn) sizeBtn.click();
                
                // Restore minimized state
                if (state.isMinimized) {
                  minimizeBtn.click();
                }
              }
            }

            // Save state when changes occur
            window.addEventListener('sourceToggle', savePanelState);
            window.addEventListener('widgetSizeChange', savePanelState);
            minimizeBtn.addEventListener('click', savePanelState);

            // Load saved state
            loadPanelState();
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