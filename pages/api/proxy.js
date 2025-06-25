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
      
      const widgetScript = `${updateUrlScript}<script src="${protocol}://${host}/widget.js"></script>`;
      
      // Add demo banner and feature sidebar
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
          <a href="https://getaskanything.com/setup" style="
            margin-left: 10px;
            color: #000;
            text-decoration: underline;
            font-weight: bold;
          ">GET A REAL ONE</a>
        </div>
        
        <!-- Feature Control Sidebar -->
        <div id="feature-sidebar" style="
          position: fixed;
          top: 60px;
          right: 20px;
          width: 280px;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          font-size: 14px;
          z-index: 999998;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          max-height: calc(100vh - 100px);
          overflow-y: auto;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          transform: translateX(0);
        ">
          <div style="
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 16px;
            padding-bottom: 12px;
            border-bottom: 1px solid #f3f4f6;
          ">
            <h3 style="
              margin: 0;
              font-size: 16px;
              font-weight: 600;
              color: #111827;
            ">Widget Features</h3>
            <button id="sidebar-toggle" style="
              background: none;
              border: none;
              cursor: pointer;
              font-size: 18px;
              color: #6b7280;
              padding: 8px;
              border-radius: 6px;
              transition: all 0.2s ease;
              width: 32px;
              height: 32px;
              display: flex;
              align-items: center;
              justify-content: center;
            " onmouseover="this.style.backgroundColor='#f3f4f6'" onmouseout="this.style.backgroundColor='transparent'">−</button>
          </div>
          
          <div id="sidebar-content">
            <!-- Widget Placement Tool -->
            <div style="margin-bottom: 18px;">
              <label style="font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 6px; display: block;">Widget Placement</label>
              <div id="widget-placement-group" style="display: flex; gap: 10px; flex-wrap: wrap;">
                <label style="display: flex; align-items: center; gap: 4px; cursor: pointer; font-size: 13px;">
                  <input type="radio" name="widget-placement" value="bottom-right" checked style="accent-color: #6366f1;">BR
                </label>
                <label style="display: flex; align-items: center; gap: 4px; cursor: pointer; font-size: 13px;">
                  <input type="radio" name="widget-placement" value="bottom-left" style="accent-color: #6366f1;">BL
                </label>
                <label style="display: flex; align-items: center; gap: 4px; cursor: pointer; font-size: 13px;">
                  <input type="radio" name="widget-placement" value="top-right" style="accent-color: #6366f1;">TR
                </label>
                <label style="display: flex; align-items: center; gap: 4px; cursor: pointer; font-size: 13px;">
                  <input type="radio" name="widget-placement" value="top-left" style="accent-color: #6366f1;">TL
                </label>
              </div>
            </div>

            <!-- Features Toggle Group -->
            <div style="margin-bottom: 16px; border-radius: 8px; border: 1px solid #f3f4f6; background: #fafbfc;">
              <div id="features-toggle-header" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; cursor: pointer; border-bottom: 1px solid #f3f4f6;">
                <span style="font-size: 15px; font-weight: 600; color: #222;">Features</span>
                <span id="features-chevron" style="font-size: 18px; transition: transform 0.2s;">▼</span>
              </div>
              <div id="features-toggle-group" style="padding: 8px 12px 0 12px; display: block;">
                <!-- All feature toggles (Ask/Explore, Summarize, Listen, Basic Share) go here -->
                <label style="display: flex; align-items: center; justify-content: space-between; padding: 8px 0; cursor: pointer; color: #374151; font-weight: 500;">
                  <span>Ask/Explore</span>
                  <div style="position: relative;">
                    <input type="checkbox" id="toggle-ask" checked style="position: absolute; opacity: 0; cursor: pointer;">
                    <span style="display: inline-block; width: 44px; height: 24px; background: #10b981; border-radius: 12px; position: relative; transition: background 0.2s;">
                      <span style="position: absolute; top: 2px; left: 20px; width: 20px; height: 20px; background: white; border-radius: 50%; transition: left 0.2s;"></span>
                    </span>
                  </div>
                </label>
                <label style="display: flex; align-items: center; justify-content: space-between; padding: 8px 0; cursor: pointer; color: #374151; font-weight: 500;">
                  <span>Summarize</span>
                  <div style="position: relative;">
                    <input type="checkbox" id="toggle-summarize" checked style="position: absolute; opacity: 0; cursor: pointer;">
                    <span style="display: inline-block; width: 44px; height: 24px; background: #10b981; border-radius: 12px; position: relative; transition: background 0.2s;">
                      <span style="position: absolute; top: 2px; left: 20px; width: 20px; height: 20px; background: white; border-radius: 50%; transition: left 0.2s;"></span>
                    </span>
                  </div>
                </label>
                <label style="display: flex; align-items: center; justify-content: space-between; padding: 8px 0; cursor: pointer; color: #374151; font-weight: 500;">
                  <span>Listen</span>
                  <div style="position: relative;">
                    <input type="checkbox" id="toggle-listen" checked style="position: absolute; opacity: 0; cursor: pointer;">
                    <span style="display: inline-block; width: 44px; height: 24px; background: #10b981; border-radius: 12px; position: relative; transition: background 0.2s;">
                      <span style="position: absolute; top: 2px; left: 20px; width: 20px; height: 20px; background: white; border-radius: 50%; transition: left 0.2s;"></span>
                    </span>
                  </div>
                </label>
                <label style="display: flex; align-items: center; justify-content: space-between; padding: 8px 0; cursor: pointer; color: #374151; font-weight: 500;">
                  <span>Basic Share</span>
                  <div style="position: relative;">
                    <input type="checkbox" id="toggle-share" checked style="position: absolute; opacity: 0; cursor: pointer;">
                    <span style="display: inline-block; width: 44px; height: 24px; background: #10b981; border-radius: 12px; position: relative; transition: background 0.2s;">
                      <span style="position: absolute; top: 2px; left: 20px; width: 20px; height: 20px; background: white; border-radius: 50%; transition: left 0.2s;"></span>
                    </span>
                  </div>
                </label>
              </div>
            </div>
            
            <div style="
              border-top: 1px solid #f3f4f6;
              padding-top: 16px;
              margin-top: 16px;
            ">
              <p style="
                margin: 0 0 12px 0;
                font-size: 12px;
                color: #6b7280;
                font-weight: 500;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              ">Coming Soon</p>
              
              <label style="
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 8px 0;
                cursor: not-allowed;
                color: #9ca3af;
                font-weight: 500;
              ">
                <span>Dive Deeper*</span>
                <div style="position: relative;">
                  <input type="checkbox" id="toggle-deeper" disabled style="
                    position: absolute;
                    opacity: 0;
                    cursor: not-allowed;
                  ">
                  <span style="
                    display: inline-block;
                    width: 44px;
                    height: 24px;
                    background: #e5e7eb;
                    border-radius: 12px;
                    position: relative;
                  ">
                    <span style="
                      position: absolute;
                      top: 2px;
                      left: 2px;
                      width: 20px;
                      height: 20px;
                      background: white;
                      border-radius: 50%;
                    "></span>
                  </span>
                </div>
              </label>
              
              <label style="
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 8px 0;
                cursor: not-allowed;
                color: #9ca3af;
                font-weight: 500;
              ">
                <span>Chat/Speak*</span>
                <div style="position: relative;">
                  <input type="checkbox" id="toggle-chat" disabled style="
                    position: absolute;
                    opacity: 0;
                    cursor: not-allowed;
                  ">
                  <span style="
                    display: inline-block;
                    width: 44px;
                    height: 24px;
                    background: #e5e7eb;
                    border-radius: 12px;
                    position: relative;
                  ">
                    <span style="
                      position: absolute;
                      top: 2px;
                      left: 2px;
                      width: 20px;
                      height: 20px;
                      background: white;
                      border-radius: 50%;
                    "></span>
                  </span>
                </div>
              </label>
              
              <label style="
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 8px 0;
                cursor: not-allowed;
                color: #9ca3af;
                font-weight: 500;
              ">
                <span>Avatar*</span>
                <div style="position: relative;">
                  <input type="checkbox" id="toggle-avatar" disabled style="
                    position: absolute;
                    opacity: 0;
                    cursor: not-allowed;
                  ">
                  <span style="
                    display: inline-block;
                    width: 44px;
                    height: 24px;
                    background: #e5e7eb;
                    border-radius: 12px;
                    position: relative;
                  ">
                    <span style="
                      position: absolute;
                      top: 2px;
                      left: 2px;
                      width: 20px;
                      height: 20px;
                      background: white;
                      border-radius: 50%;
                    "></span>
                  </span>
                </div>
              </label>
              
              <label style="
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 8px 0;
                cursor: not-allowed;
                color: #9ca3af;
                font-weight: 500;
              ">
                <span>Smart Alerts*</span>
                <div style="position: relative;">
                  <input type="checkbox" id="toggle-alerts" disabled style="
                    position: absolute;
                    opacity: 0;
                    cursor: not-allowed;
                  ">
                  <span style="
                    display: inline-block;
                    width: 44px;
                    height: 24px;
                    background: #e5e7eb;
                    border-radius: 12px;
                    position: relative;
                  ">
                    <span style="
                      position: absolute;
                      top: 2px;
                      left: 2px;
                      width: 20px;
                      height: 20px;
                      background: white;
                      border-radius: 50%;
                    "></span>
                  </span>
                </div>
              </label>
              
              <label style="
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 8px 0;
                cursor: not-allowed;
                color: #9ca3af;
                font-weight: 500;
              ">
                <span>Multi-Format Sharing*</span>
                <div style="position: relative;">
                  <input type="checkbox" id="toggle-multi-share" disabled style="
                    position: absolute;
                    opacity: 0;
                    cursor: not-allowed;
                  ">
                  <span style="
                    display: inline-block;
                    width: 44px;
                    height: 24px;
                    background: #e5e7eb;
                    border-radius: 12px;
                    position: relative;
                  ">
                    <span style="
                      position: absolute;
                      top: 2px;
                      left: 2px;
                      width: 20px;
                      height: 20px;
                      background: white;
                      border-radius: 50%;
                    "></span>
                  </span>
                </div>
              </label>
              
              <label style="
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 8px 0;
                cursor: not-allowed;
                color: #9ca3af;
                font-weight: 500;
              ">
                <span>Adaptive Social Sharing*</span>
                <div style="position: relative;">
                  <input type="checkbox" id="toggle-adaptive-share" disabled style="
                    position: absolute;
                    opacity: 0;
                    cursor: not-allowed;
                  ">
                  <span style="
                    display: inline-block;
                    width: 44px;
                    height: 24px;
                    background: #e5e7eb;
                    border-radius: 12px;
                    position: relative;
                  ">
                    <span style="
                      position: absolute;
                      top: 2px;
                      left: 2px;
                      width: 20px;
                      height: 20px;
                      background: white;
                      border-radius: 50%;
                    "></span>
                  </span>
                </div>
              </label>
            </div>
            
            <div style="
              border-top: 1px solid #f3f4f6;
              padding-top: 16px;
              margin-top: 16px;
            ">
              <p style="
                margin: 0 0 12px 0;
                font-size: 12px;
                color: #6b7280;
                font-weight: 500;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              ">Widget Theme</p>
              
              <div style="margin-bottom: 16px;">
                <label style="
                  display: block;
                  margin-bottom: 8px;
                  color: #374151;
                  font-weight: 500;
                  font-size: 13px;
                ">Primary Color</label>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <input type="color" id="color-picker-primary" value="#6366f1" style="
                    width: 40px;
                    height: 32px;
                    border: 1px solid #d1d5db;
                    border-radius: 6px;
                    cursor: pointer;
                    background: none;
                  ">
                  <span id="color-value-primary" style="
                    font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
                    font-size: 12px;
                    color: #6b7280;
                    background: #f9fafb;
                    padding: 4px 8px;
                    border-radius: 4px;
                    border: 1px solid #e5e7eb;
                    min-width: 60px;
                  ">#6366f1</span>
                </div>
              </div>
              
              <div style="margin-bottom: 16px;">
                <label style="
                  display: block;
                  margin-bottom: 8px;
                  color: #374151;
                  font-weight: 500;
                  font-size: 13px;
                ">Accent Color</label>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <input type="color" id="color-picker-accent" value="#ec4899" style="
                    width: 40px;
                    height: 32px;
                    border: 1px solid #d1d5db;
                    border-radius: 6px;
                    cursor: pointer;
                    background: none;
                  ">
                  <span id="color-value-accent" style="
                    font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
                    font-size: 12px;
                    color: #6b7280;
                    background: #f9fafb;
                    padding: 4px 8px;
                    border-radius: 4px;
                    border: 1px solid #e5e7eb;
                    min-width: 60px;
                  ">#ec4899</span>
                </div>
              </div>
              
              <div style="margin-bottom: 12px;">
                <h4 style="
                  margin: 0 0 8px 0;
                  font-size: 13px;
                  color: #374151;
                  font-weight: 500;
                ">Quick Presets</h4>
                <div style="
                  display: grid;
                  grid-template-columns: repeat(4, 1fr);
                  gap: 6px;
                ">
                  <button class="color-preset" data-primary="#6366f1" data-accent="#ec4899" style="
                    width: 100%;
                    height: 32px;
                    border: 2px solid #e5e7eb;
                    border-radius: 6px;
                    cursor: pointer;
                    background: linear-gradient(135deg, #6366f1 50%, #ec4899 50%);
                    transition: border-color 0.2s ease;
                  " title="Default (Indigo/Pink)"></button>
                  
                  <button class="color-preset" data-primary="#059669" data-accent="#f59e0b" style="
                    width: 100%;
                    height: 32px;
                    border: 2px solid #e5e7eb;
                    border-radius: 6px;
                    cursor: pointer;
                    background: linear-gradient(135deg, #059669 50%, #f59e0b 50%);
                    transition: border-color 0.2s ease;
                  " title="Nature (Green/Amber)"></button>
                  
                  <button class="color-preset" data-primary="#dc2626" data-accent="#7c3aed" style="
                    width: 100%;
                    height: 32px;
                    border: 2px solid #e5e7eb;
                    border-radius: 6px;
                    cursor: pointer;
                    background: linear-gradient(135deg, #dc2626 50%, #7c3aed 50%);
                    transition: border-color 0.2s ease;
                  " title="Bold (Red/Purple)"></button>
                  
                  <button class="color-preset" data-primary="#0891b2" data-accent="#f97316" style="
                    width: 100%;
                    height: 32px;
                    border: 2px solid #e5e7eb;
                    border-radius: 6px;
                    cursor: pointer;
                    background: linear-gradient(135deg, #0891b2 50%, #f97316 50%);
                    transition: border-color 0.2s ease;
                  " title="Ocean (Cyan/Orange)"></button>
                </div>
              </div>
              
              <button id="reset-colors" style="
                width: 100%;
                padding: 8px 12px;
                background: #f9fafb;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                color: #6b7280;
                font-size: 12px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
              " onmouseover="this.style.backgroundColor='#f3f4f6'; this.style.borderColor='#9ca3af'" onmouseout="this.style.backgroundColor='#f9fafb'; this.style.borderColor='#d1d5db'">Reset to Default</button>
            </div>
          </div>
        </div>
        
        <style>
          body { 
            margin-top: 50px !important; 
            margin-right: 320px !important;
          }
          
          /* Custom toggle styles */
          #feature-sidebar input[type="checkbox"]:checked + span {
            background: #10b981 !important;
          }
          
          #feature-sidebar input[type="checkbox"]:not(:checked) + span {
            background: #e5e7eb !important;
          }
          
          #feature-sidebar input[type="checkbox"]:checked + span span {
            left: 20px !important;
          }
          
          #feature-sidebar input[type="checkbox"]:not(:checked) + span span {
            left: 2px !important;
          }
          
          /* Sidebar toggle functionality */
          #feature-sidebar.collapsed {
            width: 60px;
            height: 60px;
            padding: 15px;
            overflow: hidden;
            transform: translateX(0);
          }
          
          #feature-sidebar.collapsed #sidebar-content {
            opacity: 0;
            transform: translateY(-10px);
            transition: opacity 0.2s ease, transform 0.2s ease;
            pointer-events: none;
          }
          
          #feature-sidebar.collapsed h3 {
            opacity: 0;
            transform: translateY(-10px);
            transition: opacity 0.2s ease, transform 0.2s ease;
          }
          
          #feature-sidebar:not(.collapsed) #sidebar-content {
            opacity: 1;
            transform: translateY(0);
            transition: opacity 0.3s ease 0.1s, transform 0.3s ease 0.1s;
            pointer-events: auto;
          }
          
          #feature-sidebar:not(.collapsed) h3 {
            opacity: 1;
            transform: translateY(0);
            transition: opacity 0.3s ease 0.1s, transform 0.3s ease 0.1s;
          }
          
          /* Color preset hover effects */
          .color-preset:hover {
            border-color: #6b7280 !important;
            transform: scale(1.05);
          }
          
          .color-preset:active {
            transform: scale(0.95);
          }
          
          /* Responsive design */
          @media (max-width: 1024px) {
            body {
              margin-right: 0 !important;
            }
            
            #feature-sidebar {
              display: none !important;
            }
          }
          
          /* Ensure widgets don't overlap with sidebar */
          @media (min-width: 1025px) {
            .gist-widget, [id*="widget"], [class*="widget"] {
              margin-right: 320px !important;
            }
          }
        </style>
        
        <script>
          // Feature toggle functionality
          document.addEventListener('DOMContentLoaded', function() {
            // Sidebar toggle with smooth animation
            const sidebar = document.getElementById('feature-sidebar');
            const toggleBtn = document.getElementById('sidebar-toggle');
            
            toggleBtn.addEventListener('click', function() {
              const isCollapsed = sidebar.classList.contains('collapsed');
              
              if (isCollapsed) {
                // Expanding
                sidebar.classList.remove('collapsed');
                toggleBtn.textContent = '−';
              } else {
                // Collapsing
                sidebar.classList.add('collapsed');
                toggleBtn.textContent = '+';
              }
            });
            
            // Feature toggles
            const featureToggles = {
              'toggle-ask': { 
                feature: 'ask', 
                toolsConfigKey: 'ask',
                widgetFunction: 'toggleAskFeature'
              },
              'toggle-summarize': { 
                feature: 'summarize', 
                toolsConfigKey: 'gist',
                widgetFunction: 'toggleSummarizeFeature'
              },
              'toggle-listen': { 
                feature: 'listen', 
                toolsConfigKey: 'remix',
                widgetFunction: 'toggleListenFeature'
              },
              'toggle-share': { 
                feature: 'share', 
                toolsConfigKey: 'share',
                widgetFunction: 'toggleShareFeature'
              }
            };
            
            Object.keys(featureToggles).forEach(toggleId => {
              const toggle = document.getElementById(toggleId);
              const config = featureToggles[toggleId];
              
              toggle.addEventListener('change', function() {
                const isEnabled = this.checked;
                console.log(\`[FeatureSidebar] Toggling \${config.feature}: \${isEnabled}\`);
                
                // Update TOOLS_CONFIG in widget if it exists
                if (window.TOOLS_CONFIG && config.toolsConfigKey) {
                  window.TOOLS_CONFIG[config.toolsConfigKey] = isEnabled;
                  console.log(\`[FeatureSidebar] Updated TOOLS_CONFIG.\${config.toolsConfigKey} = \${isEnabled}\`);
                }
                
                // Call specific widget function if it exists
                if (window[config.widgetFunction] && typeof window[config.widgetFunction] === 'function') {
                  window[config.widgetFunction](isEnabled);
                } else {
                  console.log(\`[FeatureSidebar] Widget function \${config.widgetFunction} not found\`);
                }
                
                // Dispatch custom event for the widget to listen to
                window.dispatchEvent(new CustomEvent('featureToggle', {
                  detail: {
                    feature: config.feature,
                    toolsConfigKey: config.toolsConfigKey,
                    enabled: isEnabled
                  }
                }));
              });
            });
            
            // Color picker functionality
            const primaryColorPicker = document.getElementById('color-picker-primary');
            const accentColorPicker = document.getElementById('color-picker-accent');
            const primaryColorValue = document.getElementById('color-value-primary');
            const accentColorValue = document.getElementById('color-value-accent');
            const resetColorsBtn = document.getElementById('reset-colors');
            const colorPresets = document.querySelectorAll('.color-preset');
            
            // Update color value displays
            function updateColorValue(picker, valueElement) {
              valueElement.textContent = picker.value.toLowerCase();
            }
            
            // Apply colors to widget
            function applyWidgetColors(primaryColor, accentColor) {
              console.log(\`[FeatureSidebar] Applying colors - Primary: \${primaryColor}, Accent: \${accentColor}\`);
              
              // Update widget styling if it exists
              if (window.updateWidgetColors && typeof window.updateWidgetColors === 'function') {
                window.updateWidgetColors(primaryColor, accentColor);
              } else {
                // Dispatch custom event for widget to listen to
                window.dispatchEvent(new CustomEvent('colorThemeChange', {
                  detail: {
                    primaryColor: primaryColor,
                    accentColor: accentColor
                  }
                }));
              }
            }
            
            // Primary color picker handler
            primaryColorPicker.addEventListener('input', function() {
              updateColorValue(this, primaryColorValue);
              applyWidgetColors(this.value, accentColorPicker.value);
            });
            
            // Accent color picker handler
            accentColorPicker.addEventListener('input', function() {
              updateColorValue(this, accentColorValue);
              applyWidgetColors(primaryColorPicker.value, this.value);
            });
            
            // Color preset handlers
            colorPresets.forEach(preset => {
              preset.addEventListener('click', function() {
                const primaryColor = this.dataset.primary;
                const accentColor = this.dataset.accent;
                
                // Update color pickers
                primaryColorPicker.value = primaryColor;
                accentColorPicker.value = accentColor;
                
                // Update value displays
                updateColorValue(primaryColorPicker, primaryColorValue);
                updateColorValue(accentColorPicker, accentColorValue);
                
                // Apply colors
                applyWidgetColors(primaryColor, accentColor);
                
                // Visual feedback
                this.style.transform = 'scale(0.9)';
                setTimeout(() => {
                  this.style.transform = '';
                }, 150);
              });
            });
            
            // Reset colors handler
            resetColorsBtn.addEventListener('click', function() {
              const defaultPrimary = '#6366f1';
              const defaultAccent = '#ec4899';
              
              // Update color pickers
              primaryColorPicker.value = defaultPrimary;
              accentColorPicker.value = defaultAccent;
              
              // Update value displays
              updateColorValue(primaryColorPicker, primaryColorValue);
              updateColorValue(accentColorPicker, accentColorValue);
              
              // Apply colors
              applyWidgetColors(defaultPrimary, defaultAccent);
              
              // Visual feedback
              this.style.transform = 'scale(0.95)';
              setTimeout(() => {
                this.style.transform = '';
              }, 150);
            });
            
            console.log('[FeatureSidebar] Feature sidebar initialized');
          });

          // --- Features Collapse ---
          const featuresHeader = document.getElementById('features-toggle-header');
          const featuresGroup = document.getElementById('features-toggle-group');
          const chevron = document.getElementById('features-chevron');
          let featuresOpen = true;
          featuresHeader.addEventListener('click', () => {
            featuresOpen = !featuresOpen;
            featuresGroup.style.display = featuresOpen ? 'block' : 'none';
            chevron.style.transform = featuresOpen ? 'rotate(0deg)' : 'rotate(-90deg)';
          });

          // --- Widget Placement ---
          document.getElementById('widget-placement-group').addEventListener('change', (e) => {
            if (e.target.name === 'widget-placement') {
              window.dispatchEvent(new CustomEvent('widget-placement-change', { detail: { position: e.target.value } }));
            }
          });

          // --- Dynamic Color Presets ---
          window.addEventListener('gist-styling-extracted', (event) => {
            const styling = event.detail;
            const presets = document.querySelectorAll('.color-preset');
            // Use up to 4 brand colors, fallback to defaults
            const brandColors = styling.brandColors && styling.brandColors.length >= 2 ? styling.brandColors : ['#6366f1', '#ec4899', '#059669', '#f59e0b'];
            presets.forEach((btn, i) => {
              const primary = brandColors[i % brandColors.length] || '#6366f1';
              const accent = brandColors[(i+1) % brandColors.length] || '#ec4899';
              btn.setAttribute('data-primary', primary);
              btn.setAttribute('data-accent', accent);
              btn.style.background = `linear-gradient(135deg, ${primary} 50%, ${accent} 50%)`;
            });
          });
        </script>
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