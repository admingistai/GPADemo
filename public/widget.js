(function() {
    'use strict';

    // ================================
    // CONFIGURATION - Add your API key here
    // ================================
    // 
    // 🚨 TO FIX THE API KEY ERROR:
    // 1. Go to https://platform.openai.com/account/api-keys
    // 2. Create a new API key
    // 3. Replace 'YOUR_OPENAI_API_KEY_HERE' below with your actual API key
    // 4. Make sure your OpenAI account has billing set up
          // ================================
    // Dynamically determine the backend URL from the widget script source
    function getBackendBaseUrl() {
        // Try to find the widget script tag to determine the backend URL
        const scripts = document.querySelectorAll('script[src*="widget.js"]');
        for (const script of scripts) {
            const src = script.src;
            if (src) {
                // Extract the base URL from the widget script source
                const url = new URL(src);
                return `${url.protocol}//${url.host}`;
            }
        }
        
        // Fallback: try to detect from current script (if available)
        if (typeof document !== 'undefined' && document.currentScript) {
            const src = document.currentScript.src;
            if (src) {
                const url = new URL(src);
                return `${url.protocol}//${url.host}`;
            }
        }
        
        // Last resort fallback - this should rarely be used
        console.warn('[GistWidget] Could not auto-detect backend URL, using fallback');
        return 'https://gpademo.vercel.app';
    }

    const BACKEND_BASE_URL = getBackendBaseUrl();
    console.log('[GistWidget] Using backend URL:', BACKEND_BASE_URL);

    const WIDGET_CONFIG = {
        // API endpoints - these will call your secure serverless functions
        CHAT_API_URL: `${BACKEND_BASE_URL}/api/chat`,
        IMAGE_API_URL: `${BACKEND_BASE_URL}/api/image`,
        MODEL: 'gpt-3.5-turbo', // You can change this to gpt-4, gpt-4-turbo, etc.
        TIMEOUT_MS: 20000, // 20 second timeout as per PRD
        DEBOUNCE_MS: 300   // 300ms debounce as per PRD
    };
    
    // ================================
    // TOOLS CONFIGURATION
    // ================================
    // Configure which tools are enabled/disabled
    // Can be modified via console: TOOLS_CONFIG.remix = false
    
    // Parse configuration from URL parameters
    function parseConfigFromUrl() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const configParam = urlParams.get('config');
            if (configParam) {
                const config = JSON.parse(decodeURIComponent(configParam));
                console.log('[GistWidget] Parsed config from URL:', config);
                return config;
            }
        } catch (error) {
            console.warn('[GistWidget] Failed to parse config from URL:', error);
        }
        return null;
    }
    
    // Get initial configuration
    const urlConfig = parseConfigFromUrl();
    const TOOLS_CONFIG = {  
        ask: true      // Always enabled - core functionality
    };
    
    console.log('[GistWidget] Applied tools configuration:', TOOLS_CONFIG);
    
    // Expose TOOLS_CONFIG globally for console access
    window.TOOLS_CONFIG = TOOLS_CONFIG;
    
    // ================================
    // WEBSITE STYLING SCRAPER SYSTEM
    // ================================
    
    // Store extracted styling information
    let websiteStyling = {
        primaryColor: '#6366f1',
        secondaryColor: '#8b5cf6',
        backgroundColor: '#ffffff',
        textColor: '#374151',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        borderRadius: '16px',
        logoUrl: null,
        faviconUrl: null,
        brandColors: [],
        shadows: 'drop-shadow(0 8px 25px rgba(0, 0, 0, 0.15))',
        accentColor: '#ec4899'
    };

    // Domain-specific customization for gpademo.vercel.app
    function applyDomainSpecificStyling() {
        const currentHost = window.location.hostname;
        const currentPath = window.location.pathname;
        
        // Apply custom styling for gpademo.vercel.app but let tiered detection find the best favicon
        if (currentHost === 'gpademo.vercel.app' || currentHost === 'localhost') {
            console.log('[GistWidget] Applying gpademo.vercel.app styling customization');
            console.log('[GistWidget] Current host:', currentHost, 'Current path:', currentPath);
            
            // Set custom styling but let the tiered favicon detection handle finding the best image
            websiteStyling = {
                ...websiteStyling,
                forceGistStyling: true,
                // Remove hardcoded faviconUrl to allow tiered detection
            };
            
            console.log('[GistWidget] Applied gpademo.vercel.app styling (favicon will be detected via tiered system)');
        } else {
            console.log('[GistWidget] Using default styling for other domains');
            console.log('[GistWidget] Current host:', currentHost, 'Current path:', currentPath);
        }
    }

    // Apply domain-specific styling immediately
    applyDomainSpecificStyling();
    
    // Extract website favicon and logo with comprehensive tiered detection
    async function extractLogosAndIcons() {
        const results = {
            favicon: null,
            logo: null,
            icons: [],
            foundImageTier: null // Track which tier found the image
        };
        
        console.log('[GistWidget] Starting tiered favicon/logo detection...');
        
        // TIER 1: DIRECT FAVICON EXTRACTION - Highest priority
        console.log('[GistWidget] TIER 1: Checking for direct favicons...');
        const faviconCandidates = [];
        
        // High-priority favicon sources with size scoring
        const faviconSelectors = [
            // Apple touch icons (usually high quality)
            { selector: 'link[rel="apple-touch-icon"][sizes="180x180"]', priority: 100, expectedSize: 180 },
            { selector: 'link[rel="apple-touch-icon"][sizes="192x192"]', priority: 95, expectedSize: 192 },
            { selector: 'link[rel="apple-touch-icon"][sizes="167x167"]', priority: 90, expectedSize: 167 },
            { selector: 'link[rel="apple-touch-icon"][sizes="152x152"]', priority: 85, expectedSize: 152 },
            { selector: 'link[rel="apple-touch-icon"][sizes="120x120"]', priority: 80, expectedSize: 120 },
            { selector: 'link[rel="apple-touch-icon"]', priority: 75, expectedSize: 180 },
            
            // Modern favicon formats
            { selector: 'link[rel="icon"][type="image/svg+xml"]', priority: 70, expectedSize: 'vector' },
            { selector: 'link[rel="icon"][sizes="192x192"]', priority: 90, expectedSize: 192 },
            { selector: 'link[rel="icon"][sizes="180x180"]', priority: 85, expectedSize: 180 },
            { selector: 'link[rel="icon"][sizes="96x96"]', priority: 65, expectedSize: 96 },
            { selector: 'link[rel="icon"][sizes="48x48"]', priority: 60, expectedSize: 48 },
            { selector: 'link[rel="icon"][sizes="32x32"]', priority: 55, expectedSize: 32 },
            { selector: 'link[rel="icon"][sizes="16x16"]', priority: 50, expectedSize: 16 },
            
            // Fallback favicon sources
            { selector: 'link[rel="icon"]', priority: 45, expectedSize: 32 },
            { selector: 'link[rel="shortcut icon"]', priority: 40, expectedSize: 32 },
            
            // Microsoft tiles
            { selector: 'meta[name="msapplication-TileImage"]', priority: 35, expectedSize: 144, isMetaContent: true },
            
            // Mask icons (Safari pinned tabs)
            { selector: 'link[rel="mask-icon"]', priority: 30, expectedSize: 'vector' }
        ];
        
        // Collect all favicon candidates with scoring
        faviconSelectors.forEach(({ selector, priority, expectedSize, isMetaContent }) => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                let url = isMetaContent ? element.content : element.href;
                
                if (url && isValidImageUrl(url)) {
                    // Convert relative URLs to absolute
                    if (url.startsWith('/')) {
                        url = window.location.origin + url;
                    } else if (url.startsWith('./') || !url.includes('://')) {
                        url = new URL(url, window.location.href).href;
                    }
                    
                    faviconCandidates.push({
                        url: url,
                        priority: priority,
                        expectedSize: expectedSize,
                        element: element,
                        selector: selector
                    });
                }
            });
        });
        
        // Add common favicon fallback locations 
             const fallbackPaths = [
                 '/favicon.ico',
                 '/favicon.png', 
                 '/favicon.svg',
                 '/assets/favicon.ico',
                 '/assets/images/favicon.ico',
                 '/images/favicon.ico',
                 '/static/favicon.ico',
                 '/public/favicon.ico'
             ];
             
             fallbackPaths.forEach((path, index) => {
                 faviconCandidates.push({
                     url: window.location.origin + path,
                     priority: 25 - index, // Decreasing priority
                     expectedSize: 32,
                     element: null,
                     selector: 'fallback-' + path.replace('/', '')
                 });
             });
         
        // Sort candidates by priority and test them
        faviconCandidates.sort((a, b) => b.priority - a.priority);
        
        // Test favicon candidates and select the first working one
        for (const candidate of faviconCandidates) {
            const isWorking = await testImageUrl(candidate.url);
            if (isWorking) {
                results.favicon = candidate.url;
                results.foundImageTier = 'TIER 1: Direct Favicon';
                console.log('[GistWidget] ✓ Found working favicon:', candidate.url, 'Priority:', candidate.priority);
                break;
            }
         }
        
        // TIER 2: META TAG LOGO EXTRACTION
        if (!results.favicon) {
            console.log('[GistWidget] TIER 2: Checking for meta tag logos...');
        const metaImageSelectors = [
            'meta[property="og:logo"]', // Explicit logo
            'meta[name="twitter:image"]', // Twitter card image
            'meta[property="twitter:image"]',
                'meta[property="og:image"]' // Facebook Open Graph image
        ];
        
        for (const selector of metaImageSelectors) {
            const meta = document.querySelector(selector);
            if (meta && meta.content && isValidImageUrl(meta.content)) {
                    const isWorking = await testImageUrl(meta.content);
                    if (isWorking) {
                const imageUrl = meta.content.toLowerCase();
                        // Prefer explicit logos, but accept any working image from meta tags
                if (imageUrl.includes('logo') || imageUrl.includes('brand') || 
                            selector === 'meta[property="og:logo"]' || !results.logo) {
                    results.logo = meta.content;
                            results.foundImageTier = 'TIER 2: Meta Tag Logo';
                            console.log('[GistWidget] ✓ Found working meta logo:', meta.content);
                    break;
                        }
                    }
                }
            }
        }
        
        // TIER 3: URL-BASED LOGO DETECTION
        if (!results.favicon && !results.logo) {
            console.log('[GistWidget] TIER 3: Checking for URL-based logos...');
            const allImages = document.querySelectorAll('img');
            const logoUrlCandidates = [];
            
            allImages.forEach(img => {
                if (img.src && isValidImageUrl(img.src)) {
                    const src = img.src.toLowerCase();
                    const rect = img.getBoundingClientRect();
                    
                    let priority = 0;
                    
                    // Highest priority: explicit logo in URL
                    if (src.includes('/logo') || src.includes('logo.') || src.includes('_logo') || src.includes('-logo')) {
                        priority = 100;
                    }
                    // High priority: brand in URL
                    else if (src.includes('/brand') || src.includes('brand.') || src.includes('_brand') || src.includes('-brand')) {
                        priority = 90;
                    }
                    // Medium priority: header images
                    else if (src.includes('/header') || src.includes('header.')) {
                        priority = 70;
                    }
                    // Lower priority: any image that might be a logo
                    else if (src.includes('/icon') || src.includes('icon.') || src.includes('symbol')) {
                        priority = 50;
                    }
                    
                    if (priority > 0) {
                        logoUrlCandidates.push({
                            src: img.src,
                            element: img,
                            priority: priority,
                            rect: rect,
                            width: img.width || rect.width,
                            height: img.height || rect.height
                        });
                    }
                }
            });
            
            // Sort by priority, position, and size
            logoUrlCandidates.sort((a, b) => {
                let aScore = a.priority;
                let bScore = b.priority;
                
                // Bonus for good position (top 150px, left 400px)
                if (a.rect.top < 150) aScore += 20;
                if (a.rect.left < 400) aScore += 10;
                if (b.rect.top < 150) bScore += 20;
                if (b.rect.left < 400) bScore += 10;
                
                // Bonus for reasonable logo size
                if (a.width > 50 && a.width < 300 && a.height > 20 && a.height < 150) aScore += 15;
                if (b.width > 50 && b.width < 300 && b.height > 20 && b.height < 150) bScore += 15;
                
                return bScore - aScore;
            });
            
            // Test URL-based logo candidates
            for (const candidate of logoUrlCandidates) {
                const isWorking = await testImageUrl(candidate.src);
                if (isWorking) {
                    results.logo = candidate.src;
                    results.foundImageTier = 'TIER 3: URL-based Logo';
                    console.log('[GistWidget] ✓ Found working URL-based logo:', candidate.src);
                    break;
                }
            }
        }
        
        // TIER 4: STRUCTURAL LOGO DETECTION
        if (!results.favicon && !results.logo) {
            console.log('[GistWidget] TIER 4: Checking for structural logos...');
            const structuralLogoSelectors = [
                // Highest confidence: explicit logo classes
                '.logo img[src]',
                '.brand img[src]',
                '.site-logo img[src]',
                '.brand-logo img[src]',
                '.company-logo img[src]',
                
                // High confidence: header/nav logo areas
                'header .logo img[src]',
                'nav .logo img[src]',
                '.header .logo img[src]',
                '.navbar .logo img[src]',
                '.navbar-brand img[src]',
                '.masthead .logo img[src]',
                
                // Medium confidence: semantic alt text
                'header img[alt*="logo" i][src]',
                'nav img[alt*="logo" i][src]',
                '.navbar img[alt*="logo" i][src]',
                
                // Lower confidence but still useful
                'img[alt*="logo" i][src]',
                '[class*="logo"] img[src]'
            ];
            
            for (const selector of structuralLogoSelectors) {
            const element = document.querySelector(selector);
                if (element && element.src && isValidImageUrl(element.src)) {
                    const rect = element.getBoundingClientRect();
                    const width = element.width || rect.width;
                    const height = element.height || rect.height;
                    
                    // Quality checks: reasonable position and size
                    const isReasonablePosition = rect.top < 400; // Not too far down the page
                    const isReasonableSize = width > 20 && width < 500 && height > 15 && height < 300;
                    const isVisible = rect.width > 0 && rect.height > 0;
                    
                    if (isReasonablePosition && isReasonableSize && isVisible) {
                        const isWorking = await testImageUrl(element.src);
                        if (isWorking) {
                results.logo = element.src;
                            results.foundImageTier = 'TIER 4: Structural Logo';
                            console.log('[GistWidget] ✓ Found working structural logo:', element.src);
                break;
                        }
                    }
                }
            }
        }
        
        // TIER 5: HIGH-QUALITY FAVICON AS LOGO
        if (!results.logo && results.favicon) {
            console.log('[GistWidget] TIER 5: Using high-quality favicon as logo...');
            const favicon = results.favicon.toLowerCase();
            if (favicon.includes('192') || favicon.includes('180') || favicon.includes('apple-touch-icon')) {
                results.logo = results.favicon;
                results.foundImageTier = 'TIER 5: High-Quality Favicon';
                console.log('[GistWidget] ✓ Using high-quality favicon as logo:', results.favicon);
            }
        }

        // TIER 6: EXPANDED IMAGE SEARCH - Look for ANY reasonable images
        if (!results.favicon && !results.logo) {
            console.log('[GistWidget] TIER 6: Checking for any reasonable images...');
            const allImages = document.querySelectorAll('img[src]');
            const reasonableImageCandidates = [];
            
            allImages.forEach(img => {
                if (img.src && isValidImageUrl(img.src)) {
                    const rect = img.getBoundingClientRect();
                    const width = img.width || rect.width;
                    const height = img.height || rect.height;
                    const alt = (img.alt || '').toLowerCase();
                    const className = (img.className || '').toLowerCase();
                    const src = img.src.toLowerCase();
                    
                    // Look for any image that could potentially represent the brand
                    let score = 0;
                    
                    // Position scoring - header area images are better
                    if (rect.top < 200) score += 30;
                    if (rect.left < 600) score += 20;
                    
                    // Size scoring - reasonable logo sizes
                    if (width > 30 && width < 400 && height > 20 && height < 200) score += 25;
                    
                    // Content scoring - look for brand-related terms
                    if (alt.includes('company') || alt.includes('brand') || alt.includes('site') || 
                        className.includes('brand') || className.includes('site') ||
                        src.includes('company') || src.includes('brand') || src.includes('site')) {
                        score += 20;
                    }
                    
                    // Avoid obvious content images
                    if (alt.includes('article') || alt.includes('post') || alt.includes('content') ||
                        src.includes('article') || src.includes('post') || src.includes('content') ||
                        width > 500 || height > 300) {
                        score -= 30;
                    }
                    
                    // Only consider images with a reasonable score
                    if (score > 20) {
                        reasonableImageCandidates.push({
                            src: img.src,
                            score: score,
                            width: width,
                            height: height,
                            alt: alt
                        });
                    }
                }
            });
            
            // Sort by score and test candidates
            reasonableImageCandidates.sort((a, b) => b.score - a.score);
            
            for (const candidate of reasonableImageCandidates.slice(0, 5)) { // Test top 5 candidates
                const isWorking = await testImageUrl(candidate.src);
                if (isWorking) {
                    results.logo = candidate.src;
                    results.foundImageTier = 'TIER 6: Expanded Image Search';
                    console.log('[GistWidget] ✓ Found working image from expanded search:', candidate.src, 'Score:', candidate.score);
                    break;
                }
            }
        }
        
        // TIER 7: CHECK FOR EXISTING GIST-LOGO.PNG ON THE WEBSITE
        if (!results.favicon && !results.logo) {
            console.log('[GistWidget] TIER 7: Checking for existing gist-logo.png on website...');
            // First check if there's already an image with gist-logo.png in the DOM
            const existingGistLogo = document.querySelector('img[src*="gist-logo.png"]');
            if (existingGistLogo && existingGistLogo.src) {
                const isWorking = await testImageUrl(existingGistLogo.src);
                if (isWorking) {
                results.logo = existingGistLogo.src;
                    results.foundImageTier = 'TIER 7: Existing Gist Logo';
                    console.log('[GistWidget] ✓ Found existing gist-logo.png in DOM:', existingGistLogo.src);
                }
            } else {
                // Check common paths for gist-logo.png
                const gistLogoPaths = [
                    '/gist-logo.png',
                    '/assets/gist-logo.png',
                    '/images/gist-logo.png',
                    '/static/gist-logo.png',
                    '/public/gist-logo.png',
                    '/uploads/gist-logo.png'
                ];
                
                for (const path of gistLogoPaths) {
                    const gistLogoUrl = window.location.origin + path;
                    const isWorking = await testImageUrl(gistLogoUrl);
                    if (isWorking) {
                        results.logo = gistLogoUrl;
                        results.foundImageTier = 'TIER 7: Website Gist Logo';
                        console.log('[GistWidget] ✓ Found gist-logo.png on website:', gistLogoUrl);
                        break;
                    }
                }
            }
        }
        
        // TIER 8: ABSOLUTE FALLBACK - Use backend gist-logo.png
        if (!results.favicon && !results.logo) {
            console.log('[GistWidget] TIER 8: Using absolute fallback gist-logo.png...');
            const backendBaseUrl = getBackendBaseUrl();
            results.logo = `${backendBaseUrl}/gist-logo.png`;
            results.foundImageTier = 'TIER 8: Absolute Fallback';
            console.log('[GistWidget] ✓ Using fallback gist-logo.png:', results.logo);
        }

        // Set favicon to logo if no favicon was found
        if (!results.favicon && results.logo) {
            results.favicon = results.logo;
        }
        
        // COLLECT ALL POTENTIAL LOGO CANDIDATES FOR REFERENCE
        const allImages = document.querySelectorAll('img[src]');
        allImages.forEach(img => {
            if (img.src && isValidImageUrl(img.src)) {
                const alt = (img.alt || '').toLowerCase();
                const className = (img.className || '').toLowerCase();
                const src = img.src.toLowerCase();
                
                // Only collect images that have clear logo indicators
                if (alt.includes('logo') || 
                    className.includes('logo') || 
                    src.includes('logo') ||
                    src.includes('brand')) {
                    
                results.icons.push({
                    src: img.src,
                        alt: img.alt || '',
                    width: img.width,
                    height: img.height
                });
                }
            }
        });
        
        console.log('[GistWidget] Final results:', {
            favicon: results.favicon,
            logo: results.logo,
            foundImageTier: results.foundImageTier,
            totalIcons: results.icons.length
        });
        
        return results;
    }
    
    // Helper function to test if an image URL actually works
    async function testImageUrl(url) {
        if (!url || typeof url !== 'string') return false;
        
        return new Promise((resolve) => {
            const img = new Image();
            const timeout = setTimeout(() => {
                resolve(false);
            }, 3000); // 3 second timeout
            
            img.onload = () => {
                clearTimeout(timeout);
                // Additional check: make sure it's not a 1x1 tracking pixel
                resolve(img.width > 1 && img.height > 1);
            };
            
            img.onerror = () => {
                clearTimeout(timeout);
                resolve(false);
            };
            
            img.src = url;
        });
    }
    
    // Helper function to validate image URLs
    function isValidImageUrl(url) {
        if (!url || typeof url !== 'string') return false;
        
        // Clean the URL
        url = url.trim();
        
        // Skip empty URLs
        if (url.length === 0) return false;
        
        // Skip data URLs (but allow SVG data URLs for favicons in some cases)
        if (url.startsWith('data:')) {
            // Allow SVG data URLs for favicons as they're common
            return url.startsWith('data:image/svg+xml');
        }
        
        // Skip suspiciously long URLs (except for legitimate image services)
        if (url.length > 2000) return false;
        
        // Allow relative URLs (they'll be converted to absolute)
        if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
            return true;
        }
        
        // Check for valid URL protocol
        if (!url.includes('://') && !url.startsWith('/')) {
            // Might be a relative URL without ./
            return true;
        }
        
        // Validate URL protocol
        if (!url.match(/^https?:\/\//i)) {
            return false;
        }
        
        // Check for common image extensions
        const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg|ico|bmp|tiff?)(\?.*)?$/i;
        
        // Check for image-serving domains and CDNs
        const imageServingDomains = /(cloudfront|cloudinary|imgix|amazonaws|googleusercontent|gravatar|imgur|flickr|unsplash|pexels|shutterstock|gettyimages|istockphoto|akamaihd|fastly|jsdelivr|unpkg|cdnjs)/i;
        
        // Check for logo/brand indicators in URL
        const logoIndicators = /(\/logo|\/brand|\/icon|favicon|apple-touch|android-chrome|mstile)/i;
        
        // Check for WordPress/CMS upload patterns
        const cmsPatterns = /(\/wp-content\/uploads|\/uploads|\/media|\/assets|\/images)/i;
        
        // Allow if it matches any of these patterns
        return imageExtensions.test(url) || 
               imageServingDomains.test(url) || 
               logoIndicators.test(url) ||
               cmsPatterns.test(url) ||
               // Allow URLs that end with image-like query parameters
               /\.(jpg|jpeg|png|gif|webp|svg|ico)$/i.test(url.split('?')[0]) ||
               // Allow common favicon paths
               url.includes('favicon') ||
               url.endsWith('/favicon.ico');
    }
    
    // Extract font families from the website
    function extractFontFamilies() {
        const fonts = new Set();
        
        // Check body font specifically first
        const bodyFont = window.getComputedStyle(document.body).fontFamily;
        if (bodyFont && bodyFont !== 'inherit') {
            fonts.add(bodyFont);
            console.log('[GistWidget] Body font detected:', bodyFont);
        }
        
        // Check other key elements
        const keyElements = document.querySelectorAll('body, h1, h2, h3, p, div');
        keyElements.forEach(element => {
            const computedStyle = window.getComputedStyle(element);
            const fontFamily = computedStyle.fontFamily;
            if (fontFamily && fontFamily !== 'inherit') {
                fonts.add(fontFamily);
            }
        });
        
        console.log('[GistWidget] All detected fonts:', Array.from(fonts));
        
        // Get most common font families
        const fontCounts = {};
        fonts.forEach(font => {
            const cleanFont = font.replace(/['"]/g, '');
            fontCounts[cleanFont] = (fontCounts[cleanFont] || 0) + 1;
        });
        
        // Return body font if available, otherwise most common font
        if (bodyFont) {
            const cleanBodyFont = bodyFont.replace(/['"]/g, '');
            console.log('[GistWidget] Using body font:', cleanBodyFont);
            return cleanBodyFont;
        }
        
        const sortedFonts = Object.entries(fontCounts).sort((a, b) => b[1] - a[1]);
        const detectedFont = sortedFonts.length > 0 ? sortedFonts[0][0] : 'inherit';
        console.log('[GistWidget] Final detected font:', detectedFont);
        return detectedFont;
    }
    
    // Extract color scheme from the website
    function extractColorScheme() {
        const colors = {
            backgrounds: new Set(),
            textColors: new Set(),
            borderColors: new Set(),
            accentColors: new Set()
        };
        
        // Sample key elements for colors
        const sampleElements = [
            ...document.querySelectorAll('header, nav, .header, .navbar'),
            ...document.querySelectorAll('button, .btn, .button'),
            ...document.querySelectorAll('a[href], .link'),
            ...document.querySelectorAll('.card, .panel, .box'),
            ...document.querySelectorAll('h1, h2, h3'),
            ...document.querySelectorAll('main, .main, .content'),
            document.body
        ];
        
        sampleElements.forEach(element => {
            if (!element) return;
            
            const style = window.getComputedStyle(element);
            
            // Extract background colors
            const bgColor = style.backgroundColor;
            if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
                colors.backgrounds.add(bgColor);
            }
            
            // Extract text colors
            const textColor = style.color;
            if (textColor && textColor !== 'rgb(0, 0, 0)') {
                colors.textColors.add(textColor);
            }
            
            // Extract border colors
            const borderColor = style.borderColor;
            if (borderColor && borderColor !== 'rgb(0, 0, 0)') {
                colors.borderColors.add(borderColor);
            }
            
            // Check for accent colors in buttons and links
            if (element.tagName === 'BUTTON' || element.tagName === 'A' || 
                element.classList.contains('btn') || element.classList.contains('button')) {
                if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)') {
                    colors.accentColors.add(bgColor);
                }
            }
        });
        
            return {
            backgrounds: Array.from(colors.backgrounds),
            textColors: Array.from(colors.textColors),
            borderColors: Array.from(colors.borderColors),
            accentColors: Array.from(colors.accentColors)
        };
    }
    
    // Convert RGB to hex
    function rgbToHex(rgb) {
        if (!rgb || rgb === 'transparent') return null;
        
        const result = rgb.match(/\d+/g);
        if (!result || result.length < 3) return null;
        
        const hex = result.slice(0, 3).map(x => {
            const hex = parseInt(x).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
        
        return '#' + hex;
    }
    
    // Analyze and extract border radius patterns
    function extractBorderRadius() {
        const radiusValues = new Set();
        const elements = document.querySelectorAll('button, .btn, .card, .panel, input, .input');
        
        elements.forEach(element => {
            const style = window.getComputedStyle(element);
            const borderRadius = style.borderRadius;
            if (borderRadius && borderRadius !== '0px') {
                radiusValues.add(borderRadius);
            }
        });
        
        // Return most common border radius
        const radiusArray = Array.from(radiusValues);
        return radiusArray.length > 0 ? radiusArray[0] : '16px';
    }
    
    // Main function to analyze website styling
    async function analyzeWebsiteStyling() {
        log('info', 'Starting website styling analysis...');
        
        try {
            // Extract logos and icons
            const logos = await extractLogosAndIcons();
            
            // Extract font family
            const fontFamily = extractFontFamilies();
            console.log('[GistWidget] Detected font family:', fontFamily);
            
            // Extract color scheme
            const colorScheme = extractColorScheme();
            
            // Extract border radius
            const borderRadius = extractBorderRadius();
            
                        // Process and assign colors
            let primaryColor = colorScheme.accentColors.length > 0 ? 
                rgbToHex(colorScheme.accentColors[0]) : '#6366f1';
            
            // Enhanced color detection - check header background specifically
            const headerElement = document.querySelector('header, .header');
            console.log('[GistWidget] Header element found:', headerElement);
            
            if (headerElement) {
                const headerStyle = window.getComputedStyle(headerElement);
                const headerBg = headerStyle.backgroundColor;
                const headerBgImage = headerStyle.backgroundImage;
                
                console.log('[GistWidget] Header color detection:', {
                    headerElement: headerElement,
                    headerBg: headerBg,
                    headerBgImage: headerBgImage,
                    converted: rgbToHex(headerBg)
                });
                
                // For gradient backgrounds, extract color from CSS if backgroundColor is transparent
                if (headerBgImage && headerBgImage.includes('gradient') && 
                    (headerBg === 'rgba(0, 0, 0, 0)' || headerBg === 'transparent')) {
                    // Try to extract a color from the gradient
                    const gradientMatch = headerBgImage.match(/rgba?\([^)]+\)|#[a-fA-F0-9]{6}|#[a-fA-F0-9]{3}/);
                    if (gradientMatch) {
                        const extractedColor = rgbToHex(gradientMatch[0]) || gradientMatch[0];
                        if (extractedColor && extractedColor !== '#ffffff' && extractedColor !== '#000000') {
                            primaryColor = extractedColor;
                            console.log('[GistWidget] Using gradient color as primary:', extractedColor);
                        }
                    }
                } else if (headerBg && !headerBg.includes('rgba(0, 0, 0, 0)') && headerBg !== 'transparent') {
                    const headerColor = rgbToHex(headerBg);
                    if (headerColor && headerColor !== '#ffffff' && headerColor !== '#000000') {
                        primaryColor = headerColor;
                        console.log('[GistWidget] Using header color as primary:', headerColor);
                    }
                }
                
                // If still no color detected, check the computed styles for any green colors
                if (primaryColor === '#6366f1' || (colorScheme.accentColors.length === 0 && primaryColor === colorScheme.accentColors[0])) {
                    // Check if we can find green colors in the header's CSS rules
                    const headerClasses = headerElement.className;
                    const headerStyles = document.styleSheets;
                    
                    // Manual check for green colors since this is a green-themed page
                    for (let sheet of headerStyles) {
                        try {
                            for (let rule of sheet.cssRules || sheet.rules || []) {
                                if (rule.selectorText && rule.selectorText.includes('header')) {
                                    const bg = rule.style.background || rule.style.backgroundColor;
                                    if (bg && (bg.includes('#14532d') || bg.includes('#166534') || bg.includes('green'))) {
                                        primaryColor = '#14532d'; // Use the dark green from the gradient
                                        console.log('[GistWidget] Found green color in CSS rules:', primaryColor);
                                        break;
                                    }
                                }
                            }
                        } catch (e) {
                            // Skip inaccessible stylesheets
                        }
                    }
                }
            }
            
            // Fallback: if no custom color detected, check for common theme colors
            if (primaryColor === '#6366f1') {
                // Check for green theme colors in the page
                const allElements = document.querySelectorAll('*');
                for (let element of allElements) {
                    const style = window.getComputedStyle(element);
                    const bg = style.backgroundColor;
                    const borderColor = style.borderColor;
                    
                    // Check for green colors
                    const greenHex = rgbToHex(bg);
                    if (greenHex && (greenHex.includes('14532d') || greenHex.includes('166534') || greenHex.includes('16a34a'))) {
                        primaryColor = greenHex;
                        console.log('[GistWidget] Found green theme color:', greenHex);
                        break;
                    }
                    
                    const borderHex = rgbToHex(borderColor);
                    if (borderHex && (borderHex.includes('14532d') || borderHex.includes('166534') || borderHex.includes('16a34a'))) {
                        primaryColor = borderHex;
                        console.log('[GistWidget] Found green border color:', borderHex);
                        break;
                    }
                }
                
                // If still no green detected, force green theme for this page
                if (primaryColor === '#6366f1' && (document.body.style.background.includes('green') || 
                    document.querySelector('h1')?.style.color.includes('green') ||
                    window.location.href.includes('science_article'))) {
                    primaryColor = '#14532d';
                    console.log('[GistWidget] Applied fallback green theme');
                }
            }

            const backgroundColor = colorScheme.backgrounds.length > 0 ? 
                rgbToHex(colorScheme.backgrounds.find(bg => 
                    !bg.includes('rgba(0, 0, 0, 0)') && bg !== 'transparent'
                )) : '#ffffff';
            
            const textColor = colorScheme.textColors.length > 0 ? 
                rgbToHex(colorScheme.textColors[0]) : '#374151';
            
            // Generate harmonious color variations when custom theme is detected
            function generateColorVariations(baseColor) {
                if (!baseColor || baseColor === '#6366f1') {
                    return {
                        secondary: '#8b5cf6',
                        accent: '#ec4899',
                        brand: '#f59e0b',
                        rgba40: 'rgba(99, 102, 241, 0.4)',
                        rgba0: 'rgba(99, 102, 241, 0)'
                    };
                }
                
                // Extract RGB values
                const hex = baseColor.replace('#', '');
                const r = parseInt(hex.substr(0, 2), 16);
                const g = parseInt(hex.substr(2, 2), 16);
                const b = parseInt(hex.substr(4, 2), 16);
                
                // Generate darker variation for secondary
                const secondaryR = Math.max(0, Math.floor(r * 0.8));
                const secondaryG = Math.max(0, Math.floor(g * 0.8));
                const secondaryB = Math.max(0, Math.floor(b * 0.8));
                
                // Generate lighter variation for accent
                const accentR = Math.min(255, Math.floor(r * 1.2));
                const accentG = Math.min(255, Math.floor(g * 1.2));
                const accentB = Math.min(255, Math.floor(b * 1.2));
                
                // Generate complementary variation for brand
                const brandR = Math.min(255, Math.floor(r * 0.9 + 30));
                const brandG = Math.min(255, Math.floor(g * 0.9 + 20));
                const brandB = Math.min(255, Math.floor(b * 0.9 + 10));
                
                return {
                    secondary: `#${secondaryR.toString(16).padStart(2, '0')}${secondaryG.toString(16).padStart(2, '0')}${secondaryB.toString(16).padStart(2, '0')}`,
                    accent: `#${accentR.toString(16).padStart(2, '0')}${accentG.toString(16).padStart(2, '0')}${accentB.toString(16).padStart(2, '0')}`,
                    brand: `#${brandR.toString(16).padStart(2, '0')}${brandG.toString(16).padStart(2, '0')}${brandB.toString(16).padStart(2, '0')}`,
                    rgba40: `rgba(${r}, ${g}, ${b}, 0.4)`,
                    rgba0: `rgba(${r}, ${g}, ${b}, 0)`
                };
            }
            
            const colorVariations = generateColorVariations(primaryColor);
            
            // Regenerate color variations with the final primary color
            const finalColorVariations = generateColorVariations(primaryColor);
            
            // Update website styling object, preserving domain-specific customizations
            const existingCustomizations = {
                logoUrl: websiteStyling.logoUrl,
                faviconUrl: websiteStyling.faviconUrl,
                primaryColor: websiteStyling.primaryColor,
                secondaryColor: websiteStyling.secondaryColor,
                accentColor: websiteStyling.accentColor,
                forceDefaultFavicon: websiteStyling.forceDefaultFavicon,
    
                forceGistStyling: websiteStyling.forceGistStyling
            };
            
            // If forceGistStyling is true, preserve custom styling but use detected favicon/logo
            if (existingCustomizations.forceGistStyling) {
                websiteStyling = {
                    ...websiteStyling,
                    primaryColor: existingCustomizations.primaryColor || primaryColor || '#6366f1',
                    secondaryColor: existingCustomizations.secondaryColor || finalColorVariations.secondary,
                    accentColor: existingCustomizations.accentColor || finalColorVariations.accent,
                    backgroundColor: backgroundColor || '#ffffff',
                    textColor: textColor || '#374151',
                    fontFamily: fontFamily || '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    borderRadius: borderRadius || '16px',
                    logoUrl: existingCustomizations.logoUrl || logos.logo, // Use detected logo
                    faviconUrl: existingCustomizations.faviconUrl || logos.favicon, // Use detected favicon
                    brandColors: [
                        existingCustomizations.primaryColor || primaryColor, 
                        existingCustomizations.secondaryColor || finalColorVariations.secondary, 
                        existingCustomizations.accentColor || finalColorVariations.accent
                    ].filter(Boolean),
                    shadows: 'drop-shadow(0 8px 25px rgba(0, 0, 0, 0.15))',
                    rawColorScheme: colorScheme,
                    availableIcons: logos.icons,
                    forceDefaultFavicon: existingCustomizations.forceDefaultFavicon,
    
                    forceGistStyling: existingCustomizations.forceGistStyling
                };
            } else {
                websiteStyling = {
                    primaryColor: primaryColor || '#6366f1',
                    secondaryColor: finalColorVariations.secondary,
                    backgroundColor: backgroundColor || '#ffffff',
                    textColor: textColor || '#374151',
                    fontFamily: fontFamily || '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    borderRadius: borderRadius || '16px',
                    logoUrl: existingCustomizations.logoUrl || logos.logo,
                    faviconUrl: existingCustomizations.faviconUrl || logos.favicon,
                    brandColors: [primaryColor, finalColorVariations.secondary, finalColorVariations.accent, finalColorVariations.brand].filter(Boolean),
                    shadows: 'drop-shadow(0 8px 25px rgba(0, 0, 0, 0.15))',
                    accentColor: finalColorVariations.accent,
                    rawColorScheme: colorScheme,
                    availableIcons: logos.icons,
                    forceDefaultFavicon: existingCustomizations.forceDefaultFavicon,
    
                };
            }
            
            log('info', 'Website styling analysis complete', websiteStyling);
            
            // Debug: Log animation decision
            const shouldDisableAnimation = (websiteStyling.primaryColor && websiteStyling.primaryColor !== '#6366f1') || 
                                          (websiteStyling.brandColors && websiteStyling.brandColors.length > 0) || 
                                          (websiteStyling.rawColorScheme && websiteStyling.rawColorScheme.accentColors.length > 0);
            console.log('[GistWidget] Animation decision:', {
                primaryColor: websiteStyling.primaryColor,
                brandColors: websiteStyling.brandColors,
                accentColorsFound: websiteStyling.rawColorScheme.accentColors.length,
                shouldDisableAnimation,
                detectedColors: websiteStyling.rawColorScheme
            });
            
            // Debug: Log final color values that will be applied
            console.log('[GistWidget] Final color scheme:', {
                primaryColor: websiteStyling.primaryColor,
                secondaryColor: websiteStyling.secondaryColor,
                accentColor: websiteStyling.accentColor,
                brandColors: websiteStyling.brandColors
            });
            
            // Dispatch event with extracted styling
            window.dispatchEvent(new CustomEvent('gist-styling-extracted', {
                detail: websiteStyling
            }));
            
            return websiteStyling;
            } catch (error) {
            log('error', 'Failed to analyze website styling', { error: error.message });
            return websiteStyling; // Return defaults
        }
    }
    
    // Generate dynamic CSS based on extracted styling
    function generateDynamicStyles(styling) {
        console.log('[GistWidget] Generating CSS with colors:', {
            primary: styling.primaryColor,
            secondary: styling.secondaryColor,
            accent: styling.accentColor,
            brand: styling.brandColors[0],

        });
        
        // Handle rainbow gradients for gpademo.vercel.app
        let primaryColor = styling.primaryColor || '#6366f1';
        let rgba40, rgba0;
        
        if (styling.isRainbowMode) {
            // For rainbow mode, use a single color for rgba calculations
            rgba40 = 'rgba(255, 107, 53, 0.4)'; // Orange-ish with transparency
            rgba0 = 'rgba(255, 107, 53, 0)';
        } else {
            // Extract RGB values for rgba variations (normal mode)
            const hex = primaryColor.replace('#', '');
            const r = parseInt(hex.substr(0, 2), 16);
            const g = parseInt(hex.substr(2, 2), 16);
            const b = parseInt(hex.substr(4, 2), 16);
            rgba40 = `rgba(${r}, ${g}, ${b}, 0.4)`;
            rgba0 = `rgba(${r}, ${g}, ${b}, 0)`;
        }
        
        // Ensure we have a font family - fallback to Comic Sans if detection failed
        const widgetFont = styling.fontFamily || '"Comic Sans MS", cursive';
        console.log('[GistWidget] Widget font being applied:', widgetFont);
        
        return `
            :host {
                all: initial;
                font-family: ${widgetFont};
                --widget-primary-color: ${styling.primaryColor || '#6366f1'};
                --widget-secondary-color: ${styling.secondaryColor || '#8b5cf6'};
                --widget-accent-color: ${styling.accentColor || '#ec4899'};
                --widget-brand-color: ${styling.brandColors[0] || '#f59e0b'};
                --widget-primary-color-40: ${rgba40};
                --widget-primary-color-0: ${rgba0};
                --widget-animation: ${(styling.primaryColor && styling.primaryColor !== '#6366f1') ? 'none' : 'rainbowShimmer 6s ease-in-out infinite'};
            }
            
            .gist-widget {
        position: fixed;
                bottom: 24px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 10000;
                pointer-events: none;
                opacity: 0;
                transform: translateX(-50%) translateY(10px);
                transition: opacity 250ms cubic-bezier(0.4, 0.0, 0.2, 1), 
                            transform 250ms cubic-bezier(0.4, 0.0, 0.2, 1),
                            filter 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                            left 300ms cubic-bezier(0.4, 0.0, 0.2, 1),
                            right 300ms cubic-bezier(0.4, 0.0, 0.2, 1),
                            width 300ms cubic-bezier(0.4, 0.0, 0.2, 1);
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 6px;
                filter: drop-shadow(0 0 0 rgba(0, 0, 0, 0));
                font-family: ${widgetFont};
                --widget-primary-color: ${styling.primaryColor || '#6366f1'};
                --widget-secondary-color: ${styling.secondaryColor || '#8b5cf6'};
                --widget-accent-color: ${styling.accentColor || '#ec4899'};
                --widget-brand-color: ${styling.brandColors[0] || '#f59e0b'};
                --widget-primary-color-40: ${rgba40};
                --widget-primary-color-0: ${rgba0};
            }
            

            
            .gist-pill {
                background: ${styling.backgroundColor};
                border: 1px solid ${styling.primaryColor}20;
                border-radius: ${styling.borderRadius};
                padding: 8px 6px 8px 12px;
                display: flex;
                align-items: center;
                gap: 12px;
                box-shadow: ${styling.shadows};
                backdrop-filter: blur(8px);
                cursor: pointer;
                position: relative;
                overflow: hidden;
                transition: transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1), opacity 0.3s cubic-bezier(0.4, 0.0, 0.2, 1), box-shadow 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
                order: 2;
                z-index: 1;
                font-family: ${widgetFont};
            }
            
            .gist-pill-input {
                border: none;
                outline: none;
                background: transparent;
                font-size: 14px;
                color: ${styling.textColor};
                width: 300px;
                font-family: ${widgetFont};
            }
            
            .gist-pill-input::placeholder {
                color: ${styling.textColor}60;
            }
            
            .gist-pill-submit {
                background: ${styling.primaryColor};
                border: none;
                border-radius: ${styling.borderRadius === '16px' ? '10px' : styling.borderRadius};
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.2s ease;
                color: white;
            }
            
            .gist-pill-submit:hover {
                background: ${styling.secondaryColor};
                transform: scale(1.05);
            }
            
            ${styling.logoUrl ? `
            .gist-pill-logo {
                width: 24px;
                height: 24px;
                background-image: url('${styling.logoUrl}');
                background-size: contain;
                background-repeat: no-repeat;
                background-position: center;
                opacity: 1;
                transform: scale(1) translateX(0);
                transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);

            }

            ` : `
            .gist-pill-logo {
                width: 24px;
                height: 24px;
                color: ${styling.primaryColor};
                opacity: 1;
                transform: scale(1) translateX(0);
                transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            }
            `}
            
            .gist-toolbox {
                display: none; /* Hide the toolbox completely */
            }
            
            .gist-toolbox-tab {
                padding: 8px 16px;
                border-radius: calc(${styling.borderRadius} - 4px);
        font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
                color: ${styling.textColor}80;
                background: transparent;
                border: none;
                font-family: ${widgetFont};
            }
            
            .gist-toolbox-tab:hover {
                background: ${styling.primaryColor}10;
                color: ${styling.textColor};
            }
            
            .gist-toolbox-tab.active {
                background: ${styling.primaryColor};
                color: white;
            }
            
            /* Apply font to all widget text elements */
            .gist-widget * {
                font-family: ${widgetFont} !important;
            }
            
            .gist-answer-container,
            .gist-answer-content,
            .gist-answer-text,
            .gist-suggested-questions,
            .gist-suggested-question,
            .gist-loading-text,
            .gist-questions-loading-text,
            .gist-questions-loading-simple,
            .gist-content-entering,
            .gist-content-entered,
            button,
            input,
            div,
            span,
            p,
            h1, h2, h3, h4, h5, h6 {
                font-family: ${widgetFont} !important;
            }
                 `;
     }
     
     // Function to apply styling themes for different website types
     function detectWebsiteType() {
         const bodyClass = document.body.className.toLowerCase();
         const metaGenerator = document.querySelector('meta[name="generator"]');
         const generator = metaGenerator ? metaGenerator.content.toLowerCase() : '';
         
         // Detect common platforms
         if (generator.includes('wordpress') || bodyClass.includes('wordpress')) {
             return 'wordpress';
         } else if (generator.includes('shopify') || bodyClass.includes('shopify')) {
             return 'ecommerce';
         } else if (generator.includes('squarespace') || bodyClass.includes('squarespace')) {
             return 'portfolio';
         } else if (bodyClass.includes('blog') || document.querySelector('.blog, .post, article')) {
             return 'blog';
         } else if (document.querySelector('.news, .article, .press')) {
             return 'news';
         } else if (document.querySelector('.product, .shop, .cart, .checkout')) {
             return 'ecommerce';
         } else {
             return 'general';
         }
     }
     
     // Function to enhance styling based on website type
     function getEnhancedStylingForType(baseStyling, websiteType) {
         const enhancements = {
             wordpress: {
                 borderRadius: '8px',
                 shadows: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1))'
             },
             ecommerce: {
                 borderRadius: '12px',
                 shadows: 'drop-shadow(0 6px 20px rgba(0, 0, 0, 0.12))'
             },
             portfolio: {
                 borderRadius: '20px',
                 shadows: 'drop-shadow(0 8px 30px rgba(0, 0, 0, 0.15))'
             },
             blog: {
                 borderRadius: '16px',
                 shadows: 'drop-shadow(0 4px 15px rgba(0, 0, 0, 0.1))'
             },
             news: {
                 borderRadius: '6px',
                 shadows: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.08))'
             },
             general: {
                 borderRadius: '16px',
                 shadows: 'drop-shadow(0 8px 25px rgba(0, 0, 0, 0.15))'
             }
         };
         
         return {
             ...baseStyling,
             ...enhancements[websiteType]
         };
     }
     
     // Function to create a live styling update system (DISABLED to prevent widget issues)
     function createStyleObserver(shadowRoot) {
         // Return a mock observer that doesn't actually observe anything
         // This prevents issues with complex websites where the observer can interfere
         return {
             observe: () => {},
             disconnect: () => {},
             takeRecords: () => []
         };
     }
     
     // Function to update widget styling dynamically
     async function updateWidgetStyling(shadowRoot) {
         try {
             const newStyling = await analyzeWebsiteStyling();
             const websiteType = detectWebsiteType();
             const enhancedStyling = getEnhancedStylingForType(newStyling, websiteType);
             
             // Update existing style element
             const existingStyle = shadowRoot.querySelector('style');
             if (existingStyle) {
                 const newDynamicStyles = generateDynamicStyles(enhancedStyling);
                 existingStyle.textContent = newDynamicStyles + existingStyle.textContent.split('/* ORIGINAL STYLES */')[1] || '';
             }
             
             log('info', 'Widget styling updated dynamically', { websiteType, styling: enhancedStyling });
         } catch (error) {
             log('error', 'Failed to update widget styling', { error: error.message });
         }
     }

    // Prevent multiple widget instances
    if (window.__gistWidgetLoaded) {
        return;
    }
    window.__gistWidgetLoaded = true;

    // Create shadow DOM container to avoid style conflicts
    async function createWidget() {
        const widgetContainer = document.createElement('div');
        widgetContainer.id = 'gist-widget-container';
        
        // Create shadow root for style isolation
        const shadowRoot = widgetContainer.attachShadow({ mode: 'closed' });
        
        // Analyze website styling first
        const extractedStyling = await analyzeWebsiteStyling();
        
        // Detect website type and enhance styling
        const websiteType = detectWebsiteType();
        const enhancedStyling = getEnhancedStylingForType(extractedStyling, websiteType);
        
        // Generate dynamic styles based on website
        const dynamicStyles = generateDynamicStyles(enhancedStyling);
        
        // Widget styles - now using extracted styling
        const styles = `
            <style>
                ${dynamicStyles}
                
                .gist-widget {
                    position: fixed;
                    bottom: 24px;
                    left: 50%;
                    transform: translateX(-50%);
                    z-index: 10000;
                    pointer-events: none;
                    opacity: 0;
                    transform: translateX(-50%) translateY(10px);
                    transition: opacity 250ms cubic-bezier(0.4, 0.0, 0.2, 1), 
                                transform 2s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                                filter 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                                left 2s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                                right 2s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                                width 2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        display: flex;
                    flex-direction: column;
        align-items: center;
                    gap: 6px;
                    filter: drop-shadow(0 0 0 rgba(0, 0, 0, 0));
                }
                
                .gist-widget.loaded {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                    pointer-events: auto;
                }
                
                /* Active state with subtle blur effect */
                .gist-widget.active {
                    filter: drop-shadow(0 8px 25px rgba(0, 0, 0, 0.15)) 
                            drop-shadow(0 4px 10px rgba(0, 0, 0, 0.1));
                }
                
                /* Enhanced blur when expanded and interacting */
                .gist-widget.active:not(.minimized) {
                    filter: drop-shadow(0 12px 35px rgba(0, 0, 0, 0.18)) 
                            drop-shadow(0 6px 15px rgba(0, 0, 0, 0.12))
                            drop-shadow(0 2px 6px rgba(0, 0, 0, 0.08));
                }
                
                /* Minimized state - start collapsed */
                .gist-widget.minimized {
                    gap: 0;
                    transition: gap 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                }
                
                .gist-widget.minimized .gist-answer-container {
                    opacity: 0;
                    transform: translateY(10px) scale(0.98);
                    pointer-events: none;
                    transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
                    max-height: 0;
                    overflow: hidden;
                }
                

                
                .gist-widget.minimized .gist-pill {
                    width: 155px;
                    transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
                }
                
                .gist-widget.minimized .gist-pill-submit {
                    opacity: 0;
                    transform: scale(0) translateX(8px);
                    pointer-events: none;
                    transition: all 0.45s cubic-bezier(0.16, 1, 0.3, 1);
                }
                
                .gist-widget.minimized .gist-pill-logo {
                    opacity: 1 !important;
                    transform: scale(1) translateX(0) !important;
                    display: block !important;
                    visibility: visible !important;
                    transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
                }
                
                .gist-widget.minimized .gist-pill-input {
                    pointer-events: none;
                    text-align: left;
                    color: #6b7280;
                    margin-left: 6px;
                    transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
                    width: calc(100% - 22px);
                    min-width: 95px;
                }
                
                .gist-widget.minimized .gist-pill-content {
                    width: 155px;
                    justify-content: flex-start;
                    padding-left: 30px;
                    transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
                }
                
                /* Expanded state - smooth transitions back */
                .gist-widget:not(.minimized) {
                    gap: 6px;
                    transition: gap 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.08s;
                }
                
                .gist-widget:not(.minimized) .gist-answer-container {
                    transition: all 0.55s cubic-bezier(0.16, 1, 0.3, 1) 0.15s;
                }
                
                .gist-widget:not(.minimized) .gist-pill {
                    transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
                }
                
                .gist-widget:not(.minimized) .gist-pill-submit {
                    opacity: 1;
                    transform: scale(1) translateX(0);
                    pointer-events: auto;
                    transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.2s;
                }
                
                .gist-widget:not(.minimized) .gist-pill-logo {
                    transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
                }
                
                .gist-widget:not(.minimized) .gist-pill-input {
                    text-align: left;
                    color: #374151;
                    margin-left: 0;
                    width: auto;
                    transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
                }
                
                .gist-widget:not(.minimized) .gist-pill-content {
                    width: 380px;
        justify-content: space-between;
                    padding-left: 4px;
                    transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
                }
                

                
                .gist-answer-container {
                    width: 400px;
                    max-height: 300px;
                    position: relative;
                    border-radius: 16px;
                    padding: 1.5px;
                    opacity: 0;
                    transform: translateY(20px) scale(0.95);
                    transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), max-height 300ms cubic-bezier(0.4, 0.0, 0.2, 1);
                    pointer-events: none;
                    order: 1;
                    display: flex;
                    flex-direction: column;
                }
                

                

                
                /* Compact version for Remix tool */
                .gist-answer-container.remix-compact {
                    width: 400px;
                    max-height: 350px; /* Increased from 300px to accommodate TTS interface */
                    transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                }
                
                .gist-answer-container.remix-compact.collapsed {
                    max-height: 40px;
                }
                
                .gist-answer-container::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: conic-gradient(
                        from 0deg,
                        var(--widget-primary-color, #6366f1) 0deg,
                        var(--widget-secondary-color, #8b5cf6) 90deg,
                        var(--widget-accent-color, #ec4899) 180deg,
                        var(--widget-brand-color, #f59e0b) 270deg,
                        var(--widget-primary-color, #6366f1) 360deg
                    );
                    border-radius: 16px;
                    animation: var(--widget-animation, rainbowShimmer 6s ease-in-out infinite);
                    z-index: -1;
                }
                
                .gist-answer-container.visible {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                    pointer-events: auto;
                }
                

                
                .gist-answer-content {
                    background: white;
                    border-radius: 14.5px 14.5px 0 0; /* Remove bottom radius since footer has it */
                    padding: 20px 16px 20px 20px; /* Normal padding since button is outside */
                    flex: 1;
                    overflow-y: auto;
                    position: relative;
                    z-index: 1;
                    max-height: calc(300px - 40px); /* Account for footer height (~32px + border) */
                    box-sizing: border-box;
                    transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), max-height 300ms cubic-bezier(0.4, 0.0, 0.2, 1);
                }
                
                /* Compact version for Remix tool */
                .gist-answer-container.remix-compact .gist-answer-content {
                    max-height: calc(350px - 40px); /* Account for footer height with increased container */
                    padding: 12px;
                    overflow-y: auto; /* Enable scrolling if content is too tall */
                    overflow-x: hidden;
                }
                
                /* Custom scrollbar styling */
                .gist-answer-content::-webkit-scrollbar {
                    width: 8px;
                }
                
                .gist-answer-content::-webkit-scrollbar-track {
                    background: #f1f5f9;
                    border-radius: 4px;
                    margin: 16px 4px; /* Top/bottom margin to prevent cutoff */
                }
                
                .gist-answer-content::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 4px;
                    border: 1px solid #f1f5f9;
                    margin: 2px 0; /* Additional margin for thumb */
                }
                
                .gist-answer-content::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
                
                .gist-answer-content::-webkit-scrollbar-corner {
                    background: transparent;
                }
                
                .gist-answer-placeholder {
                    color: #9ca3af;
                    font-size: 14px;
                    text-align: center;
                    padding: 40px 20px;
                    font-style: italic;
                    min-height: 80px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transform: translateY(10px);
                    animation: fadeInUp 0.4s ease-out 0.2s forwards;
                }
                
                .gist-loading {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 40px 20px;
                    min-height: 120px;
                    opacity: 1;
                    transition: opacity 0.3s ease-out;
                }
                
                .gist-loading.fade-out {
                    opacity: 0;
                }
                
                .gist-loading-spinner {
                    width: 24px;
                    height: 24px;
                    border: 3px solid #f3f4f6;
                    border-top: 3px solid var(--widget-primary-color, #6366f1);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin-bottom: 12px;
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                .gist-loading-text {
                    color: #6b7280;
                    font-size: 14px;
                    font-style: italic;
                }
                
                .gist-answer-text {
                    color: #374151;
                    font-size: 14px;
                    line-height: 1.6;
                    margin: 0;
                    padding-bottom: 8px;
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                    opacity: 0;
                    transform: translateY(10px);
                    animation: fadeInUp 0.6s ease-out forwards;
                }
                
                @keyframes fadeInUp {
                    to {
                        opacity: 1;
          transform: translateY(0);
        }
      }

                .gist-answer-text.animate-in {
                    animation: fadeInUp 0.6s ease-out forwards;
                }
                
                .gist-content-entering {
                    opacity: 0;
                    transform: translateY(10px);
                }
                
                .gist-content-entered {
                    opacity: 1;
                    transform: translateY(0);
                    transition: all 0.6s ease-out;
                }
                
                /* Text reveal animation */
                @keyframes textReveal {
                    0% {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .gist-text-reveal {
                    opacity: 0;
                    transform: translateY(20px);
                    animation: textReveal 0.8s ease-out forwards;
                }
                
                .gist-text-reveal-delay-1 { animation-delay: 0.1s; }
                .gist-text-reveal-delay-2 { animation-delay: 0.2s; }
                .gist-text-reveal-delay-3 { animation-delay: 0.3s; }
                .gist-text-reveal-delay-4 { animation-delay: 0.4s; }
                .gist-text-reveal-delay-5 { animation-delay: 0.5s; }
                .gist-text-reveal-delay-6 { animation-delay: 0.6s; }
                .gist-text-reveal-delay-7 { animation-delay: 0.7s; }
                .gist-text-reveal-delay-8 { animation-delay: 0.8s; }
                .gist-text-reveal-delay-9 { animation-delay: 0.9s; }
                .gist-text-reveal-delay-10 { animation-delay: 1.0s; }
                
                .gist-stagger-1 {
                    transition-delay: 0.1s;
                }
                
                .gist-stagger-2 {
                    transition-delay: 0.3s;
                }
                
                .gist-stagger-3 {
                    transition-delay: 0.5s;
                }
                
                .gist-attributions {
                    border-top: 1px solid #e5e7eb;
                    padding-top: 16px;
                    margin-top: 16px;
                    opacity: 0;
                    transform: translateY(10px);
                    animation: fadeInUp 0.6s ease-out 0.3s forwards;
                }
                
                .gist-attributions-title {
                    font-size: 12px;
                    font-weight: 600;
                    color: #6b7280;
                    margin-bottom: 8px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                
                .gist-attribution-bar {
                    height: 6px;
                    background: #f3f4f6;
                    border-radius: 3px;
                    overflow: hidden;
                    display: flex;
                    margin-bottom: 8px;
                }
                
                .gist-attribution-segment {
                    height: 100%;
                    cursor: pointer;
                    transition: opacity 0.2s ease;
                }
                
                .gist-attribution-segment:hover {
                    opacity: 0.8;
                }
                
                .gist-attribution-sources {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    margin-top: 8px;
                }
                
                .gist-attribution-source {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 11px;
                    color: #6b7280;
                }
                
                .gist-attribution-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    flex-shrink: 0;
                }
                
                .gist-source-previews {
                    margin-top: 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                
                .gist-source-preview {
                    background: #f8fafc;
                    border-radius: 8px;
                    padding: 12px;
                    display: flex;
                    gap: 12px;
                    border-left: 3px solid var(--source-color);
                    transition: background-color 0.2s ease, transform 0.2s ease;
                    cursor: pointer;
                    position: relative;
                }
                
                .gist-source-preview:hover {
                    background: #f1f5f9;
                    transform: translateY(-1px);
                }
                
                .gist-source-preview-image {
                    width: 48px;
                    height: 48px;
                    border-radius: 6px;
                    object-fit: cover;
                    flex-shrink: 0;
                    background: #e2e8f0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .gist-source-preview-icon {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    background: var(--source-color);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    font-weight: bold;
                    text-transform: uppercase;
                }
                
                .gist-source-preview-content {
                    flex: 1;
                    min-width: 0;
                }
                
                .gist-source-preview-header {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 4px;
                }
                
                .gist-source-preview-source {
                    font-size: 12px;
                    font-weight: 600;
                    color: #374151;
                }
                
                .gist-source-preview-date {
                    font-size: 11px;
                    color: #6b7280;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }
                
                .gist-source-preview-date::before {
                    content: "🌐";
                    font-size: 10px;
                }
                
                .gist-source-preview-title {
                    font-size: 13px;
                    font-weight: 600;
                    color: #1f2937;
                    margin-bottom: 4px;
                    line-height: 1.3;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                
                .gist-source-preview-description {
                    font-size: 12px;
                    color: #4b5563;
                    line-height: 1.4;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                
                .gist-source-preview-percentage {
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    background: var(--source-color);
                    color: white;
                    padding: 2px 6px;
                    border-radius: 10px;
                    font-size: 10px;
                    font-weight: 600;
                }
                


                
                .gist-powered-by {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 16px;
                    padding-top: 8px;
                    color: #9ca3af;
                    font-size: 10px;
                    font-weight: 500;
                    opacity: 0.7;
                }
                
                .gist-add-to-site {
                    color: #374151;
                    text-decoration: none;
                    transition: color 0.2s ease;
                    pointer-events: auto;
                }
                
                .gist-add-to-site:hover {
                    color: #6366f1;
                    text-decoration: underline;
                }
                
                .gist-powered-text {
                    pointer-events: none;
                    color: #374151;
                }
                
                /* Fixed footer for answer container */
                .gist-answer-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 8px 16px;
                    border-top: 1px solid #e5e7eb;
                    border-radius: 0 0 14.5px 14.5px;
                    color: #d1d5db;
                    font-size: 10px;
                    font-weight: 500;
                    opacity: 0.8;
                    position: relative;
                    z-index: 2;
                    flex-shrink: 0;
                }
                
                .gist-powered-section {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                
                .gist-footer-logo {
                    width: 14px;
                    height: 14px;
                    object-fit: contain;
                    opacity: 0.8;
                }

                
                .gist-error {
                    color: #dc2626;
                    font-size: 14px;
                    text-align: center;
                    padding: 20px;
                    background: #fef2f2;
                    border-radius: 8px;
                    margin: 0;
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                }
                
                .gist-pill {
                    width: 400px;
                    height: 48px;
                    border-radius: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
                    cursor: pointer;
                    position: relative;
                    overflow: hidden;
                    padding: 1.5px;
                    transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
                    order: 3;
                }
                
                .gist-pill::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: conic-gradient(
                        from 0deg,
                        var(--widget-primary-color, #6366f1) 0deg,
                        var(--widget-secondary-color, #8b5cf6) 90deg,
                        var(--widget-accent-color, #ec4899) 180deg,
                        var(--widget-brand-color, #f59e0b) 270deg,
                        var(--widget-primary-color, #6366f1) 360deg
                    );
                    border-radius: 24px;
                    animation: var(--widget-animation, rainbowShimmer 6s ease-in-out infinite);
                    z-index: -1;
                }
                
                .gist-pill::before {
                    content: '';
                    position: absolute;
                    inset: 1.5px;
                    border-radius: 22.5px;
                    background: white;
                    z-index: 0;
                }
                
                @keyframes rainbowShimmer {
                    0%, 100% {
                        filter: hue-rotate(0deg) saturate(0.8);
                    }
                    50% {
                        filter: hue-rotate(180deg) saturate(1);
                    }
                }
                
                /* Rainbow animation is now isolated to pseudo-elements only */
                
                .gist-pill-content {
                    position: relative;
                    z-index: 1;
        display: flex;
        align-items: center;
        gap: 10px;
                    color: #374151;
                    font-size: 14px;
                    font-weight: 400;
                    letter-spacing: -0.01em;
                    white-space: nowrap;
                    width: 380px;
                    padding: 0 4px;
                }
                
                .gist-pill-logo {
        width: 20px;
        height: 20px;
                    border-radius: 4px;
                    object-fit: contain;
                    flex-shrink: 0;
                    display: block !important;
                    opacity: 1 !important;
                    visibility: visible !important;
                }
                
                .gist-pill-input {
                    flex: 1;
                    border: none;
                    background: transparent;
                    font-size: 14px;
                    font-weight: 400;
                    color: #374151;
                    outline: none;
                    font-family: inherit;
                    letter-spacing: -0.01em;
                    min-width: 0;
                }
                
                .gist-pill-input::placeholder {
                    color: #9ca3af;
                }
                
                .gist-pill-submit {
                    width: 18px;
                    height: 18px;
                    background: #000000;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
                    color: white;
                    font-size: 10px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    border: none;
                    flex-shrink: 0;
                }
                
                .gist-pill-submit:hover {
                    transform: scale(1.05);
                    background: #333333;
                }
                
                .gist-pill-submit:active {
                    transform: scale(0.95);
                }
                
                .gist-desktop-mode-btn {
                    width: 18px;
                    height: 18px;
                    background: #6b7280;
                    border-radius: 4px;
        display: flex;
        align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 10px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    border: none;
                    flex-shrink: 0;
                    display: none;
                }
                
                .gist-desktop-mode-btn:hover {
                    transform: scale(1.05);
                    background: #4b5563;
                }
                
                .gist-desktop-mode-btn:active {
                    transform: scale(0.95);
                }
                
                /* Show desktop mode button only when widget is expanded */
                .gist-widget:not(.minimized) .gist-desktop-mode-btn {
                    display: flex;
                }
                
                /* Close button styling */
                .gist-close-btn {
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    background: rgba(107, 114, 128, 0.1);
                    border: none;
                    color: #6b7280;
                    font-size: 16px;
                    font-weight: 400;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                    z-index: 10;
                    line-height: 1;
                }
                
                .gist-close-btn:hover {
                    background: rgba(107, 114, 128, 0.2);
                    color: #374151;
                    transform: scale(1.1);
                }
                
                .gist-close-btn:active {
                    transform: scale(0.95);
                }
                
                /* Secret settings button styling */
                .gist-secret-settings-btn {
                    position: absolute;
                    top: 8px;
                    left: 8px;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    background: rgba(107, 114, 128, 0.05);
                    border: none;
                    color: #9ca3af;
                    font-size: 12px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                    z-index: 10;
                    line-height: 1;
                    opacity: 0;
                }
                
                .gist-secret-settings-btn:hover {
                    background: rgba(107, 114, 128, 0.15);
                    color: #6b7280;
                    transform: scale(1.1) rotate(90deg);
                    opacity: 1;
                }
                
                .gist-secret-settings-btn:active {
                    transform: scale(0.95) rotate(90deg);
                }
                
                /* Settings menu styling */
                .gist-settings-menu {
                    padding: 16px;
                    background: white;
                    border-radius: 14.5px;
                    font-family: inherit;
                }
                
                .gist-settings-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 20px;
                    padding-bottom: 12px;
                    border-bottom: 1px solid #e2e8f0;
                }
                
                .gist-settings-title {
                    font-size: 16px;
                    font-weight: 600;
                    color: #374151;
                    margin: 0;
                }
                
                .gist-settings-close {
                    background: none;
                    border: none;
                    color: #9ca3af;
                    font-size: 14px;
                    cursor: pointer;
                    padding: 4px;
                }
                
                .gist-settings-close:hover {
                    color: #6b7280;
                }
                
                .gist-settings-section {
                    margin-bottom: 20px;
                }
                
                .gist-settings-section:last-child {
                    margin-bottom: 0;
                }
                
                .gist-settings-section-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: #374151;
                    margin-bottom: 12px;
                }
                
                .gist-settings-option {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 8px 0;
                    border-bottom: 1px solid #f1f5f9;
                }
                
                .gist-settings-option:last-child {
                    border-bottom: none;
                }
                
                .gist-settings-option-label {
                    font-size: 13px;
                    color: #374151;
                    flex: 1;
                }
                
                .gist-settings-toggle {
                    width: 36px;
                    height: 20px;
                    background: #e2e8f0;
                    border-radius: 10px;
                    border: none;
                    position: relative;
                    cursor: pointer;
                    transition: background-color 0.2s ease;
                }
                
                .gist-settings-toggle.enabled {
                    background: #22c55e;
                }
                
                .gist-settings-toggle::after {
                    content: '';
                    position: absolute;
                    top: 2px;
                    left: 2px;
                    width: 16px;
                    height: 16px;
                    background: white;
                    border-radius: 50%;
                    transition: transform 0.2s ease;
                }
                
                .gist-settings-toggle.enabled::after {
                    transform: translateX(16px);
                }
                
                .gist-color-picker {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                    margin-top: 8px;
                }
                
                .gist-color-option {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    border: 2px solid transparent;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                
                .gist-color-option:hover {
                    transform: scale(1.1);
                }
                
                .gist-color-option.selected {
                    border-color: #374151;
                    transform: scale(1.1);
                }

                
                /* Desktop mode styles */
                .gist-widget.desktop-mode {
                    right: 20px !important;
                    left: auto !important;
                    width: 450px !important;
                    transform: translateX(0) translateY(0) !important;
                    transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) !important;
                }
                
                .gist-widget.desktop-mode.loaded {
                    transform: translateX(0) translateY(0);
                    transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                }
                
                .gist-widget.desktop-mode.active {
                    transform: translateX(0) translateY(0);
                    transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                }
                
                .gist-widget.desktop-mode:not(.minimized) {
                    transform: translateX(0) translateY(0);
                    transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                }
                
                .gist-widget.desktop-mode .gist-answer-container {
                    max-height: 600px !important;
                }
                
                .gist-widget.desktop-mode .gist-answer-content {
                    max-height: 540px !important;
                }
                
                /* Desktop mode when minimized should stay in position */
                .gist-widget.desktop-mode.minimized {
                    right: 20px;
                    left: auto;
                    transform: translateX(0) translateY(0);
                    transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                }
                
                .gist-pill:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
                    animation-duration: 3s;
                }
                
                .gist-pill:active {
                    transform: translateY(0px);
                    transition-duration: 0.1s;
                }
                
                .gist-toolbox {
                    display: none; /* Hide the toolbox completely */
                }
                

                
                .gist-toolbox-tabs {
                    display: flex;
                    gap: 2px;
                    justify-content: center;
                }
                
                .gist-toolbox-tab {
                    flex: 1;
                    padding: 8px 16px;
                    border-radius: 8px;
                    font-size: 13px;
                    font-weight: 500;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    color: #64748b;
                    background: transparent;
                    border: none;
                    font-family: inherit;
                    min-width: fit-content;
                    box-sizing: border-box;
                }
                
                .gist-toolbox-tab:hover {
                    color: #334155;
                    background: rgba(100, 116, 139, 0.1);
                }
                
                .gist-toolbox-tab.active {
                    background: white;
                    color: #1e293b;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                    font-weight: 600;
                }
                
                .gist-toolbox-tab.active:hover {
                    background: white;
                    color: #1e293b;
                }
                
                .gist-remix-interface {
                    padding: 16px;
                    background: white;
                    border-radius: 14.5px;
                }
                
                .gist-remix-prompt {
                    margin-bottom: 20px;
                }
                
                .gist-remix-prompt-input {
                    width: 100%;
                    padding: 12px 16px;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    font-size: 14px;
                    font-family: inherit;
                    background: #f8fafc;
                    color: #374151;
                    resize: none;
                    outline: none;
                    transition: border-color 0.2s ease, background-color 0.2s ease;
                    box-sizing: border-box;
                }
                
                .gist-remix-prompt-input:focus {
                    border-color: #6366f1;
                    background: white;
                }
                
                .gist-remix-prompt-input::placeholder {
                    color: #9ca3af;
                }
                
                .gist-remix-section {
                    margin-bottom: 24px;
                }
                
                .gist-remix-section:last-child {
                    margin-bottom: 0;
                }
                
                .gist-remix-section-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: #374151;
                    margin-bottom: 12px;
                }
                
                .gist-remix-options {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                }
                
                .gist-remix-option {
                    padding: 8px 16px;
                    border: 1px solid #e2e8f0;
                    border-radius: 20px;
                    font-size: 13px;
                    font-weight: 500;
                    color: #64748b;
                    background: #f8fafc;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    white-space: nowrap;
                }
                
                .gist-remix-option:hover {
                    border-color: #cbd5e1;
                    background: #f1f5f9;
                    color: #475569;
                }
                
                .gist-remix-option.selected {
                    border-color: #6366f1;
                    background: #6366f1;
                    color: white;
                }
                
                .gist-remix-option.selected:hover {
                    background: #5b5fc7;
                    border-color: #5b5fc7;
                }
                
                .gist-remix-option-icon {
                    font-size: 16px;
                    line-height: 1;
                }
                
                /* Mock Ads Styles */
                .gist-mock-ads {
                    margin-bottom: 16px;
                    opacity: 0;
                    transform: translateY(10px);
                    transition: all 0.4s ease-out;
                }
                
                .gist-mock-ads.visible {
                    opacity: 1;
                    transform: translateY(0);
                }
                
                .gist-mock-ads-header {
                    font-size: 10px;
                    color: #9ca3af;
                    text-align: center;
                    margin-bottom: 8px;
                    font-weight: 500;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                
                .gist-mock-ads-container {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }
                
                .gist-mock-ad {
                    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    padding: 8px 12px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    position: relative;
                    overflow: hidden;
                }
                
                .gist-mock-ad:hover {
                    background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
                    border-color: #cbd5e1;
                    transform: translateY(-1px);
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                }
                
                /* Summer Reading Ad Theme */
                .summer-reading-ad {
                    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fed7aa 100%);
                    border: 1px solid #f59e0b;
                    border-radius: 12px;
                    padding: 12px 16px;
                    box-shadow: 0 4px 16px rgba(245, 158, 11, 0.2);
                }
                
                .summer-reading-ad:hover {
                    background: linear-gradient(135deg, #fde68a 0%, #fcd34d 50%, #f59e0b 100%);
                    border-color: #d97706;
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(245, 158, 11, 0.3);
                }
                
                .gist-mock-ad::before {
                    content: 'Ad';
                    position: absolute;
                    top: 2px;
                    right: 4px;
                    font-size: 8px;
                    color: #9ca3af;
                    background: #f3f4f6;
                    padding: 1px 4px;
                    border-radius: 3px;
                    font-weight: 500;
                }
                
                .summer-reading-ad::before {
                    content: 'Ad by ProRata';
                    color: #92400e;
                    background: rgba(255, 255, 255, 0.8);
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-size: 8px;
                }
                
                /* Contextual Ad Theme */
                .contextual-ad {
                    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    padding: 12px 16px;
                    box-shadow: 0 4px 16px rgba(59, 130, 246, 0.1);
                    transition: all 0.3s ease;
                }
                
                .contextual-ad:hover {
                    background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
                    border-color: #cbd5e1;
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.15);
                }
                
                .contextual-ad::before {
                    content: 'Contextual Ad';
                    color: #6b7280;
                    background: rgba(255, 255, 255, 0.9);
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-size: 8px;
                    font-weight: 500;
                }
                

                
                .gist-mock-ad-icon {
                    width: 24px;
                    height: 24px;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
        font-size: 12px;
                    font-weight: 600;
                    color: white;
                    flex-shrink: 0;
                }
                
                .gist-mock-ad-content {
                    flex: 1;
                    min-width: 0;
                }
                
                .gist-mock-ad-title {
                    font-size: 12px;
                    font-weight: 600;
                    color: #1f2937;
                    margin-bottom: 2px;
                    line-height: 1.3;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                
                .gist-mock-ad-description {
                    font-size: 10px;
                    color: #6b7280;
                    line-height: 1.3;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                
                .gist-mock-ad-brand {
                    font-size: 9px;
                    font-weight: 600;
                    margin-top: 3px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                
                .gist-mock-ad-cta {
                    background: #3b82f6;
                    color: white;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 10px;
                    font-weight: 500;
        border: none;
                    cursor: pointer;
                    transition: background 0.2s ease;
                    flex-shrink: 0;
                }
                
                .gist-mock-ad-cta:hover {
                    background: #2563eb;
                }
                
                .gist-remix-button {
                    width: 100%;
                    padding: 12px 24px;
                    background: linear-gradient(135deg, var(--widget-primary-color, #6366f1) 0%, var(--widget-secondary-color, #8b5cf6) 100%);
        color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 600;
        cursor: pointer;
                    transition: all 0.2s ease;
                    margin-top: 20px;
                    font-family: inherit;
                }
                
                .gist-remix-button:hover {
                    background: linear-gradient(135deg, var(--widget-primary-color, #6366f1) 0%, var(--widget-secondary-color, #8b5cf6) 100%);
                    transform: translateY(-1px);
                }
                
                .gist-remix-button:active {
                    transform: translateY(0);
                }
                
                .gist-remix-button:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    transform: none;
                }
                
                .gist-remix-button:disabled:hover {
                    transform: none;
                }
                
                /* Modern TTS Interface */
                .gist-tts-section {
                    padding: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 100%;
                }
                
                .gist-tts-card {
                    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
                    border-radius: 16px;
                    padding: 16px;
                    text-align: center;
                    width: 100%;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                    border: 1px solid #e2e8f0;
                }
                
                .gist-tts-icon-large {
                    font-size: 32px;
                    margin-bottom: 8px;
                    filter: grayscale(0.3);
                }
                
                .gist-tts-card h3 {
                    margin: 0 0 12px 0;
                    font-size: 16px;
                    font-weight: 600;
                    color: #1e293b;
                }
                
                .gist-voice-row {
                    display: flex;
                    gap: 6px;
                    margin-bottom: 12px;
                    align-items: center;
                }
                
                .gist-voice-select-modern {
                    flex: 1;
                    padding: 8px 12px;
                    border: 2px solid #e2e8f0;
                    border-radius: 10px;
                    background: white;
                    font-size: 13px;
                    color: #374151;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    appearance: none;
                    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
                    background-position: right 10px center;
                    background-repeat: no-repeat;
                    background-size: 14px;
                    padding-right: 32px;
                }
                
                .gist-voice-select-modern:focus {
                    outline: none;
                    border-color: #6366f1;
                    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
                }
                
                .gist-voice-test {
                    width: 36px;
                    height: 36px;
                    border: 2px solid #e2e8f0;
                    border-radius: 10px;
                    background: white;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .gist-voice-test:hover {
                    border-color: #6366f1;
                    background: #f8fafc;
                    transform: scale(1.05);
                }
                
                .gist-voice-test:active {
                    transform: scale(0.95);
                }
                
                .gist-play-button {
                    width: 100%;
                    padding: 12px 20px;
                    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-size: 15px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    margin-bottom: 10px;
                    box-shadow: 0 3px 8px rgba(99, 102, 241, 0.2);
                }
                
                .gist-play-button:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 5px 12px rgba(99, 102, 241, 0.3);
                }
                
                .gist-play-button:active {
                    transform: translateY(0);
                }
                
                .gist-play-icon {
                    width: 20px;
                    height: 20px;
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 10px;
                }
                
                .gist-audio-controls {
                    display: flex;
                    gap: 6px;
                    justify-content: center;
                    margin-bottom: 8px;
                }
                
                .gist-control-btn {
                    width: 32px;
                    height: 32px;
                    border: 2px solid #e2e8f0;
                    border-radius: 50%;
                    background: white;
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .gist-control-btn:hover {
                    border-color: #6366f1;
                    background: #f8fafc;
                    transform: scale(1.05);
                }
                
                .gist-tts-status {
                    font-size: 11px;
                    color: #64748b;
                    font-style: italic;
                    min-height: 14px;
                    line-height: 1.3;
                }
                
                /* Text highlighting for TTS */
                .gist-tts-highlight {
                    background-color: #fef3c7 !important;
                    color: #92400e !important;
                    transition: all 0.3s ease;
                    border-radius: 2px;
                    padding: 1px 2px;
                }
                

                
                /* Suggested Questions Styles */
                .gist-suggested-questions {
                    padding: 0;
        opacity: 0;
                    transform: translateY(10px);
                    transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
      }

                .gist-suggested-questions.gist-content-entered {
        opacity: 1;
                    transform: translateY(0);
                }
                
                .gist-suggested-questions-header {
                    text-align: center;
                    margin-bottom: 20px;
                    padding-bottom: 15px;
                    border-bottom: 1px solid #e5e7eb;
                }
                
                .gist-suggested-questions-header h3 {
                    margin: 0 0 8px 0;
                    font-size: 18px;
                    font-weight: 600;
                    color: #1f2937;
                }
                
                .gist-suggested-questions-subtitle {
                    margin: 0;
                    font-size: 14px;
                    color: #6b7280;
                    line-height: 1.4;
                }
                
                .gist-suggested-questions-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    margin-bottom: 20px;
                }
                
                .gist-suggested-question {
                    display: flex;
                    align-items: flex-start;
                    padding: 16px;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    font-family: inherit;
                    text-align: left;
                    width: 100%;
                    position: relative;
                    overflow: hidden;
                }
                
                .gist-suggested-question::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 2px;
                    background: linear-gradient(90deg, var(--widget-primary-color, #6366f1), var(--widget-secondary-color, #8b5cf6), var(--widget-accent-color, #ec4899));
                    transform: translateX(-100%);
                    transition: transform 0.3s ease;
                }
                
                .gist-suggested-question:hover {
                    background: #f1f5f9;
                    border-color: #cbd5e1;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                }
                
                .gist-suggested-question:hover::before {
                    transform: translateX(0);
                }
                
                .gist-suggested-question:active {
                    transform: translateY(0);
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
                }
                
                .gist-suggested-question-icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 24px;
                    height: 24px;
                    background: linear-gradient(135deg, var(--widget-primary-color, #6366f1), var(--widget-secondary-color, #8b5cf6));
                    color: white;
                    border-radius: 50%;
                    font-size: 12px;
                    font-weight: 600;
                    margin-right: 12px;
                    flex-shrink: 0;
                    margin-top: 2px;
                }
                
                .gist-suggested-question-text {
                    flex: 1;
                    font-size: 14px;
                    font-weight: 500;
                    color: #374151;
                    line-height: 1.5;
                }
                
                .gist-suggested-questions-footer {
                    text-align: center;
                    padding-top: 15px;
                    border-top: 1px solid #e5e7eb;
                }
                
                .gist-suggested-questions-footer p {
                    margin: 0;
                    font-size: 12px;
                    color: #6b7280;
                    line-height: 1.4;
                }
                
                /* Follow-up Questions Styles */
                .gist-follow-up-section {
                    margin-top: 20px;
                    padding-top: 20px;
                    border-top: 1px solid #e5e7eb;
                }
                
                .gist-follow-up-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 16px;
                }
                
                .gist-follow-up-header h4 {
                    margin: 0;
                        font-size: 16px;
                    font-weight: 600;
                    color: #1f2937;
                }
                
                .gist-follow-up-questions {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                
                .gist-follow-up-question {
                    display: flex;
                    align-items: flex-start;
                    padding: 12px 14px;
                    background: #fafbfc;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    font-family: inherit;
                    text-align: left;
                    width: 100%;
                    font-size: 13px;
                }
                
                .gist-follow-up-question:hover {
                    background: #f3f4f6;
                    border-color: #d1d5db;
                    transform: translateY(-1px);
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
                }
                
                .gist-follow-up-question:active {
                    transform: translateY(0);
                    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
                }
                
                .gist-follow-up-question-icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 18px;
                    height: 18px;
                    background: #e5e7eb;
                    color: #6b7280;
                    border-radius: 4px;
                    font-size: 10px;
                    font-weight: 600;
                    margin-right: 10px;
                    flex-shrink: 0;
                    margin-top: 1px;
                }
                
                .gist-follow-up-question-text {
                    flex: 1;
                    font-weight: 500;
                    color: #374151;
                    line-height: 1.4;
                }
                
                /* Loading dots animation for questions */
                .gist-loading-dots {
                    display: flex;
                    gap: 4px;
                }
                
                .gist-loading-dots span {
                    width: 6px;
                    height: 6px;
                    background: #cbd5e1;
                    border-radius: 50%;
                    animation: loadingDots 1.4s infinite ease-in-out;
                }
                
                .gist-loading-dots span:nth-child(1) { animation-delay: -0.32s; }
                .gist-loading-dots span:nth-child(2) { animation-delay: -0.16s; }
                .gist-loading-dots span:nth-child(3) { animation-delay: 0s; }
                
                @keyframes loadingDots {
                    0%, 80%, 100% {
                        transform: scale(0.8);
                        opacity: 0.5;
                    }
                    40% {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
                
                /* Questions Loading Styles */
                .gist-questions-loading {
                    padding: 0;
                    opacity: 0;
                    transform: translateY(10px);
                    transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
                }
                
                .gist-questions-loading.gist-content-entered {
                    opacity: 1;
                    transform: translateY(0);
                }
                
                .gist-questions-loading-header {
                    text-align: center;
                    margin-bottom: 32px;
                    padding-bottom: 20px;
                    border-bottom: 1px solid #e5e7eb;
                }
                
                .gist-questions-loading-icon {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 48px;
                    height: 48px;
                    background: linear-gradient(135deg, var(--widget-primary-color, #6366f1), var(--widget-secondary-color, #8b5cf6));
                    border-radius: 12px;
                    color: white;
                    margin-bottom: 16px;
                    animation: pulseIcon 2s ease-in-out infinite;
                }
                
                .gist-questions-loading-header h3 {
                    margin: 0 0 8px 0;
                    font-size: 20px;
                    font-weight: 600;
                    color: #1f2937;
                }
                
                .gist-questions-loading-subtitle {
                    margin: 0;
                        font-size: 14px;
                    color: #6b7280;
                    line-height: 1.5;
                }
                
                .gist-questions-loading-steps {
                    margin-bottom: 24px;
                }
                
                .gist-questions-loading-step {
                    display: flex;
                    align-items: flex-start;
                    padding: 16px 0;
                    transition: all 0.3s ease;
                    opacity: 0.4;
                }
                
                .gist-questions-loading-step.active {
                    opacity: 1;
                }
                
                .gist-questions-loading-step.completed {
                    opacity: 0.7;
                }
                
                .gist-questions-loading-step-icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 32px;
                    height: 32px;
                    margin-right: 16px;
                    flex-shrink: 0;
                    margin-top: 2px;
                }
                
                .gist-questions-loading-step-number {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 32px;
                    height: 32px;
                    background: #e5e7eb;
                    color: #6b7280;
                    border-radius: 50%;
                    font-size: 14px;
                    font-weight: 600;
                    transition: all 0.3s ease;
                }
                
                .gist-questions-loading-step.active .gist-questions-loading-step-number {
                    background: linear-gradient(135deg, var(--widget-primary-color, #6366f1), var(--widget-secondary-color, #8b5cf6));
                    color: white;
                    animation: pulseStep 1.5s ease-in-out infinite;
                }
                
                .gist-questions-loading-step.completed .gist-questions-loading-step-number {
                    background: #10b981;
                    color: white;
                }
                
                .gist-questions-loading-step.completed .gist-questions-loading-step-number::before {
                    content: '✓';
                    font-size: 12px;
                }
                
                .gist-questions-loading-step.completed .gist-questions-loading-step-number {
                    font-size: 0; /* Hide the number when completed */
                }
                
                .gist-questions-loading-step-content {
                    flex: 1;
                }
                
                .gist-questions-loading-step-title {
                    font-size: 15px;
                    font-weight: 600;
                    color: #1f2937;
                    margin-bottom: 4px;
                    line-height: 1.4;
                }
                
                .gist-questions-loading-step-description {
                    font-size: 13px;
                    color: #6b7280;
                    line-height: 1.4;
                }
                
                .gist-questions-loading-step.active .gist-questions-loading-step-title {
                    color: #6366f1;
                }
                
                .gist-questions-loading-progress {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    padding: 20px;
                    text-align: center;
                }
                
                .gist-questions-loading-progress-bar {
                    width: 100%;
                    height: 6px;
                    background: #e5e7eb;
                    border-radius: 3px;
                    overflow: hidden;
                    margin-bottom: 12px;
                }
                
                .gist-questions-loading-progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, var(--widget-primary-color, #6366f1), var(--widget-secondary-color, #8b5cf6), var(--widget-accent-color, #ec4899));
                    border-radius: 3px;
                    width: 33.33%;
                    transition: width 0.5s ease;
                    position: relative;
                    overflow: hidden;
                }
                
                .gist-questions-loading-progress-fill::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
                    animation: progressShimmer 1.5s ease-in-out infinite;
                }
                
                .gist-questions-loading-progress-text {
                    font-size: 14px;
                    font-weight: 500;
                    color: #6b7280;
                    margin: 0;
                }
                
                /* Simplified Loading Styles */
                .gist-questions-loading-simple {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 40px 20px;
                    text-align: center;
                }
                
                .gist-questions-loading-text {
                    font-size: 16px;
                    font-weight: 500;
                    color: #6b7280;
                    margin-bottom: 20px;
                }
                
                .gist-questions-loading-simple .gist-questions-loading-progress {
                    background: transparent;
                    border: none;
                    padding: 0;
                    width: 200px;
                }
                
                .gist-questions-loading-simple .gist-questions-loading-progress-bar {
                    width: 100%;
                    height: 4px;
                    background: #e5e7eb;
                    border-radius: 2px;
                    overflow: hidden;
                }
                
                .gist-questions-loading-simple .gist-questions-loading-progress-fill {
                    height: 100%;
                    background: var(--widget-primary-color, #6366f1);
                    border-radius: 2px;
                    width: 0%;
                    transition: width 2s ease-out;
                    position: relative;
                }
                
                @keyframes pulseIcon {
                    0%, 100% {
                        transform: scale(1);
                        box-shadow: 0 0 0 0 var(--widget-primary-color-40, rgba(99, 102, 241, 0.4));
                    }
                    50% {
                        transform: scale(1.05);
                        box-shadow: 0 0 0 8px var(--widget-primary-color-0, rgba(99, 102, 241, 0));
                    }
                }
                
                @keyframes pulseStep {
                    0%, 100% {
                        transform: scale(1);
                        box-shadow: 0 0 0 0 var(--widget-primary-color-40, rgba(99, 102, 241, 0.4));
                    }
                    50% {
                        transform: scale(1.1);
                        box-shadow: 0 0 0 6px var(--widget-primary-color-0, rgba(99, 102, 241, 0));
                    }
                }
                
                @keyframes progressShimmer {
                    0% {
                        transform: translateX(-100%);
                    }
                    100% {
                        transform: translateX(100%);
                    }
                }
                

            </style>
        `;
        
        // Widget HTML structure
        const widgetHTML = `
            ${styles}
                                <div class="gist-widget minimized" id="gist-widget">
                <div class="gist-pill" id="gist-pill">
                    <div class="gist-pill-content">
                        ${enhancedStyling.logoUrl ? 
                `<img src="${enhancedStyling.logoUrl}" class="gist-pill-logo" alt="Website Logo" onerror="this.src='${BACKEND_BASE_URL}/gist-logo.png'; this.alt='Gist Logo';">` :
                            enhancedStyling.faviconUrl ?
                `<img src="${enhancedStyling.faviconUrl}" class="gist-pill-logo" alt="Website Icon" onerror="this.src='${BACKEND_BASE_URL}/gist-logo.png'; this.alt='Gist Logo';">` :
                `<img src="${BACKEND_BASE_URL}/gist-logo.png" class="gist-pill-logo" alt="Gist Logo">`
                        }
                        <input type="text" class="gist-pill-input" placeholder="Ask Anything" id="gist-input">
                        <button class="gist-desktop-mode-btn" id="gist-desktop-mode-btn" title="Desktop Mode">⊞</button>
                        <button class="gist-pill-submit" id="gist-submit">➤</button>
                    </div>
                </div>
                <div class="gist-toolbox" id="gist-toolbox">
                    <div class="gist-toolbox-tabs" id="gist-toolbox-tabs">
                        <!-- Tabs will be generated dynamically based on TOOLS_CONFIG -->
                    </div>
                </div>

                <div class="gist-answer-container" id="gist-answer-container">
                    <button class="gist-close-btn" id="gist-close-btn" title="Minimize">×</button>
                    <button class="gist-secret-settings-btn" id="gist-secret-settings-btn" title="Widget Settings">⚙️</button>
                    <div class="gist-answer-content">
                        <div class="gist-answer-placeholder">
                            Ask a question to see the answer here!
                        </div>
                    </div>
                    <div class="gist-answer-footer">
                        <div class="gist-powered-section">
                            <img src="${BACKEND_BASE_URL}/gist-logo.png" alt="Gist Logo" class="gist-footer-logo">
                            <span class="gist-powered-text">Powered by Gist Answers</span>
                        </div>
                        <a href="https://getaskanything.com" target="_blank" class="gist-add-to-site">Add to your site</a>
                    </div>
                </div>
            </div>
        `;
        
        shadowRoot.innerHTML = widgetHTML;
        document.body.appendChild(widgetContainer);
        
        // Initialize currentTool that will be used by generateToolboxTabs
        let currentTool = 'ask'; // Track current active tool
        
        // Generate toolbox tabs dynamically based on TOOLS_CONFIG
        function generateToolboxTabs() {
            const toolboxTabsContainer = shadowRoot.getElementById('gist-toolbox-tabs');
            const toolLabels = {
                ask: 'Explore'
            };
            
            // Clear existing tabs
            toolboxTabsContainer.innerHTML = '';
            
            // Get enabled tools in the desired order
            const toolOrder = ['ask'];
            const enabledTools = toolOrder.filter(tool => TOOLS_CONFIG[tool]);
            
            // Generate tabs for enabled tools
            enabledTools.forEach((tool, index) => {
                const button = document.createElement('button');
                button.className = 'gist-toolbox-tab';
                button.setAttribute('data-tool', tool);
                button.textContent = toolLabels[tool];
                
                // Make first enabled tool active by default
                if (index === 0) {
                    button.classList.add('active');
                    currentTool = tool; // Set the current tool to the first enabled tool
                }
                
                toolboxTabsContainer.appendChild(button);
            });
            
            console.log('[GistWidget] Generated tabs for enabled tools:', enabledTools);
        }
        
        // Generate the tabs - disabled since toolbox is hidden
        // generateToolboxTabs();
        
        // Get elements for event handling
        const pill = shadowRoot.getElementById('gist-pill');
        const input = shadowRoot.getElementById('gist-input');
        const submitBtn = shadowRoot.getElementById('gist-submit');
        const desktopModeBtn = shadowRoot.getElementById('gist-desktop-mode-btn');
        const closeBtn = shadowRoot.getElementById('gist-close-btn');
        const settingsBtn = shadowRoot.getElementById('gist-secret-settings-btn');
        const answerContainer = shadowRoot.getElementById('gist-answer-container');
        const answerContent = answerContainer.querySelector('.gist-answer-content');
        const widget = shadowRoot.getElementById('gist-widget');
        const toolbox = shadowRoot.getElementById('gist-toolbox');
        let toolboxTabs = toolbox.querySelectorAll('.gist-toolbox-tab'); // Use let since it will be updated

        
        // Dynamic toolbox sizing system
        function optimizeToolboxAlignment() {
            const toolboxContainer = shadowRoot.querySelector('.gist-toolbox-tabs');
            // Refresh toolboxTabs since they are generated dynamically
            toolboxTabs = toolbox.querySelectorAll('.gist-toolbox-tab');
            const tabs = Array.from(toolboxTabs);
            
            if (!toolboxContainer || tabs.length === 0) return;
            
            // Get container width (400px - 8px padding = 392px available)
            const containerWidth = 392;
            const gap = 2; // 2px gap between tabs
            const totalGapWidth = (tabs.length - 1) * gap;
            const availableWidth = containerWidth - totalGapWidth;
            
            // Calculate optimal width per tab
            const tabWidth = Math.floor(availableWidth / tabs.length);
            
            // Get text lengths to determine optimal font size
            const textLengths = tabs.map(tab => tab.textContent.trim().length);
            const maxTextLength = Math.max(...textLengths);
            const avgTextLength = textLengths.reduce((a, b) => a + b, 0) / textLengths.length;
            
            // Create a temporary element to measure actual text width
            const measureElement = document.createElement('span');
            measureElement.style.position = 'absolute';
            measureElement.style.visibility = 'hidden';
            measureElement.style.whiteSpace = 'nowrap';
            measureElement.style.fontFamily = 'inherit';
            measureElement.style.fontWeight = '500';
            shadowRoot.appendChild(measureElement);
            
            // Find the optimal font size that fits all text
            let optimalFontSize = 13; // Start with default
            let allTextsFit = false;
            
            for (let fontSize = 14; fontSize >= 10; fontSize--) {
                measureElement.style.fontSize = `${fontSize}px`;
                let maxMeasuredWidth = 0;
                
                // Check if all tab texts fit at this font size
                tabs.forEach(tab => {
                    measureElement.textContent = tab.textContent.trim();
                    const measuredWidth = measureElement.offsetWidth;
                    maxMeasuredWidth = Math.max(maxMeasuredWidth, measuredWidth);
                });
                
                // Add padding space (16px on each side = 32px total)
                const requiredWidth = maxMeasuredWidth + 32;
                
                if (requiredWidth <= tabWidth) {
                    optimalFontSize = fontSize;
                    allTextsFit = true;
                    break;
                }
            }
            
            // Clean up measurement element
            shadowRoot.removeChild(measureElement);
            
            // Calculate padding based on remaining space
            const horizontalPadding = Math.max(8, Math.floor((tabWidth - (maxTextLength * optimalFontSize * 0.6)) / 2));
            
            // Apply dynamic styles
            tabs.forEach(tab => {
                tab.style.fontSize = `${optimalFontSize}px`;
                tab.style.padding = `8px ${horizontalPadding}px`;
                tab.style.minWidth = `${tabWidth}px`;
                tab.style.maxWidth = `${tabWidth}px`;
                tab.style.flex = 'none'; // Override flex: 1
                tab.style.whiteSpace = 'nowrap';
                tab.style.overflow = 'visible'; // Allow text to be fully visible
            });
            
            // Ensure perfect centering
            toolboxContainer.style.justifyContent = 'center';
            toolboxContainer.style.width = '100%';
            
            console.log('[GistWidget] Toolbox optimized:', {
                containerWidth,
                tabWidth,
                optimalFontSize,
                horizontalPadding,
                textLengths,
                avgTextLength
            });
        }
        
        // Toolbox optimization disabled since toolbox is hidden
        // setTimeout(optimizeToolboxAlignment, 100);
        
        // Resize observer disabled since toolbox is hidden
        // if (window.ResizeObserver) {
        //     const resizeObserver = new ResizeObserver(() => {
        //         clearTimeout(window.toolboxOptimizationTimeout);
        //         window.toolboxOptimizationTimeout = setTimeout(optimizeToolboxAlignment, 150);
        //     });
        //     resizeObserver.observe(toolbox);
        // }
        
        let isActive = false;
        let hasAnswer = false;
        let hasAskAnswer = false;
        let currentQuestion = null; // Track if we have an answer specifically from Ask tool
        let submitTimeout = null;
        let conversationHistory = []; // Store conversation history for Gist
        let pageContext = null; // Store extracted page content for context
        // currentTool already declared above
        let isMinimized = true; // Track minimized state
        let hoverTimeout = null; // Timeout for hover delay
        let userIsInteracting = false; // Track if user is actively interacting
        let isDesktopMode = false; // Track desktop mode state
        let hasAutoSwitchedToDesktop = false; // Track if we've already auto-switched to prevent repeated switching

        // Function to detect if user is on a desktop device
        function isDesktopDevice() {
            // Check for touch capability and screen size
            const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
            const screenWidth = window.innerWidth || document.documentElement.clientWidth;
            const screenHeight = window.innerHeight || document.documentElement.clientHeight;
            
            // Consider it desktop if:
            // 1. No touch capability, OR
            // 2. Large screen size (even if touch-capable, like touch laptops)
            const isLargeScreen = screenWidth >= 1024 && screenHeight >= 768;
            
            return !hasTouch || isLargeScreen;
        }

        
        // Toolbox functionality
        function switchTool(tool) {
            // Check if tool is enabled
            if (!TOOLS_CONFIG[tool]) {
                console.warn(`[GistWidget] Tool '${tool}' is disabled and cannot be switched to`);
      return;
    }

            currentTool = tool;
            window.gistCurrentTool = currentTool; // Keep window reference in sync
            
            // Refresh toolboxTabs since they are generated dynamically
            toolboxTabs = toolbox.querySelectorAll('.gist-toolbox-tab');
            
            // Update active tab
            toolboxTabs.forEach(tab => {
                tab.classList.remove('active');
                if (tab.dataset.tool === tool) {
                    tab.classList.add('active');
                }
            });
            
            // Handle compact mode for Remix tool
            if (tool === 'remix') {
                answerContainer.classList.add('remix-compact');
            } else {
                answerContainer.classList.remove('remix-compact');
            }
            

            
            // Hide ads when switching to tools that don't show ads

            
            // Update content based on tool
            updateContentForTool(tool);
            
            // Show answer container and toolbox for all tools
            answerContainer.classList.add('visible');
            toolbox.classList.add('visible');
            
            log('info', 'Tool switched', { tool });
        }
        
        function updateContentForTool(tool) {
            switch (tool) {
                case 'ask':
                    // If we have an Ask-specific answer, keep it. Otherwise show suggested questions
                    if (hasAskAnswer) {
                        // Keep current Ask answer content
                        return;
                    } else {
                        // Clear any previous answers from other tools and show suggested questions
                        hasAnswer = false;
                        showSuggestedQuestions();
                    }
                    break;



                default:
                    showPlaceholderForTool('ask');
            }
        }
        
        function showPlaceholderForTool(tool) {
            let placeholderText = '';
            
            switch (tool) {
                case 'ask':
                    const context = extractPageContext();
                    const hasContext = context && context.content && context.content.length > 50;
                    placeholderText = hasContext ? 
                        'Ask anything about this article or any other topic!' : 
                        'Ask a question to see the answer here!';
                    break;



                default:
                    placeholderText = 'Select a tool to get started!';
            }
            
            if (placeholderText) {
            answerContent.innerHTML = `
                <div class="gist-answer-placeholder gist-content-entering">
                    ${placeholderText}
        </div>
            `;
            } else {
                // For empty tools like remix, just clear the content
                answerContent.innerHTML = '';
            }
            
            // Trigger animation
            setTimeout(() => {
                const elements = answerContent.querySelectorAll('.gist-content-entering');
                elements.forEach(el => {
                    el.classList.remove('gist-content-entering');
                    el.classList.add('gist-content-entered');
                });
            }, 50);
            

        }
        
        // Show loading state for question generation
        function showQuestionsLoading(previousQuestion = null, previousAnswer = null) {
            const isFollowUp = previousQuestion && previousAnswer;
            const loadingText = isFollowUp ? "Generating..." : "Analyzing...";
            
            answerContent.innerHTML = `
                <div class="gist-questions-loading gist-content-entering">
                    <div class="gist-questions-loading-simple">
                        <div class="gist-questions-loading-text">${loadingText}</div>
                        <div class="gist-questions-loading-progress">
                            <div class="gist-questions-loading-progress-bar">
                                <div class="gist-questions-loading-progress-fill"></div>
      </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Start the loading animation sequence
            setTimeout(() => {
                const elements = answerContent.querySelectorAll('.gist-content-entering');
                elements.forEach(el => {
                    el.classList.remove('gist-content-entering');
                    el.classList.add('gist-content-entered');
                });
                
                // Start simple progress animation
                const progressFill = answerContent.querySelector('.gist-questions-loading-progress-fill');
                if (progressFill) {
                    // Start at 0% and animate to 100%
                    progressFill.style.width = '0%';
                    setTimeout(() => {
                        progressFill.style.width = '100%';
                    }, 100);
                }
            }, 50);
        }
        

        
        // Generate and show suggested questions for the Ask tool
        async function showSuggestedQuestions(previousQuestion = null, previousAnswer = null) {
            try {
                // Show comprehensive loading state while generating questions
                showQuestionsLoading(previousQuestion, previousAnswer);
                
                // Ensure answer container and toolbox are visible
                answerContainer.classList.add('visible');
                toolbox.classList.add('visible');
                
                // Generate questions
                const questions = await generateSuggestedQuestions(previousQuestion, previousAnswer);
                
                // Only show questions if user is still on ask tool
                if (currentTool !== 'ask') return;
                
                let html = `
                    <div class="gist-suggested-questions gist-content-entering">
                        <div class="gist-suggested-questions-header">
                            <h3>Suggested Questions</h3>
                            <p class="gist-suggested-questions-subtitle">Explore this article with AI-generated questions</p>
                        </div>
                        <div class="gist-suggested-questions-list">
                `;
                
                questions.forEach((question, index) => {
                    html += `
                        <button class="gist-suggested-question" data-question="${question.replace(/"/g, '&quot;')}">
                            <span class="gist-suggested-question-icon">${index + 1}</span>
                            <span class="gist-suggested-question-text">${question}</span>
                        </button>
                    `;
                });
                
                html += `
                        </div>
                        <div class="gist-suggested-questions-footer">
                            <p>Click a question to explore, or type your own below</p>
                        </div>
                    </div>
                `;
                
                answerContent.innerHTML = html;
                hasAnswer = false;
                hasAskAnswer = false; // Clear Ask-specific answer flag when showing suggested questions
                
                // Add click handlers for suggested questions
                const questionButtons = answerContent.querySelectorAll('.gist-suggested-question');
                questionButtons.forEach(button => {
                    button.addEventListener('click', () => {
                        const question = button.dataset.question;
                        askSuggestedQuestion(question);
                    });
                });
                
                // Trigger animation
                setTimeout(() => {
                    const elements = answerContent.querySelectorAll('.gist-content-entering');
                    elements.forEach(el => {
                        el.classList.remove('gist-content-entering');
                        el.classList.add('gist-content-entered');
                    });
                }, 50);
                
            } catch (error) {
                log('error', 'Failed to generate suggested questions', { error: error.message });
                
                // Fallback to regular placeholder if questions fail
                answerContent.innerHTML = `
                    <div class="gist-answer-placeholder gist-content-entering">
                        Ask anything about this article or any other topic!
                    </div>
                `;
                
                setTimeout(() => {
                    const elements = answerContent.querySelectorAll('.gist-content-entering');
                    elements.forEach(el => {
                        el.classList.remove('gist-content-entering');
                        el.classList.add('gist-content-entered');
                    });
                }, 50);
            }
        }
        
        // Generate suggested questions using Gist
        async function generateSuggestedQuestions(previousQuestion = null, previousAnswer = null) {
            const context = extractPageContext();
            
            if (!context || !context.content || context.content.length < 50) {
                // Return generic questions if no article context
                return [
                    "What are the main themes of this page?",
                    "Can you explain the key concepts?",
                    "What should I know about this topic?"
                ];
            }
            
            let prompt;
            if (previousQuestion && previousAnswer) {
                // Generate follow-up questions based on previous Q&A
                prompt = `Based on this article and our previous conversation, generate exactly 3 thought-provoking follow-up questions that would help someone explore the topic deeper.

Article Title: ${context.title}
Article Content: ${context.content.substring(0, 1500)}...

Previous Question: ${previousQuestion}
Previous Answer: ${previousAnswer.substring(0, 500)}...

Generate 3 questions that:
1. Build on what was previously discussed
2. Explore different angles or implications
3. Encourage deeper understanding

Return only the 3 questions, one per line, without numbers or bullets.`;
            } else {
                // Generate initial questions about the article
                prompt = `Based on this article, generate exactly 3 engaging questions that would help someone understand and explore the key concepts. Make the questions thought-provoking and specific to the content.

Article Title: ${context.title}
Article Content: ${context.content.substring(0, 1500)}...

Generate 3 questions that:
1. Address the main findings or concepts
2. Explore implications or applications
3. Encourage critical thinking about the topic

Return only the 3 questions, one per line, without numbers or bullets.`;
            }
            
            const response = await createChatCompletionForGist(prompt);
            const questions = response.response
                .split('\n')
                .filter(q => q.trim() && !q.match(/^\d+[.)]/)) // Remove empty lines and numbered lines
                .map(q => q.trim().replace(/^[-•]\s*/, '')) // Remove bullet points
                .slice(0, 3); // Ensure we only get 3 questions
            
            // Return fallback questions if parsing failed
            if (questions.length === 0) {
                return [
                    "What are the main findings of this research?",
                    "How might this impact the field?",
                    "What questions does this raise for future study?"
                ];
            }
            
            return questions;
        }
        
        // Handle clicking on a suggested question
        async function askSuggestedQuestion(question) {
            try {
                // Set the input field to show the question
                input.value = question;
                
                // Show loading state
                showLoading();
                
                // Get answer from OpenAI
                const startTime = Date.now();
                const chatResponse = await createChatCompletion(question);
                const responseTime = Date.now() - startTime;
                
                // Display the answer only if user is still on ask tool
                if (currentTool === 'ask') {
                    showAnswerWithFollowUps(chatResponse.response, question);
                }
                
                // Clear input
                input.value = '';
                
                // Emit analytics event
                window.dispatchEvent(new CustomEvent('gist-suggested-question', {
                    detail: {
                        question: question,
                        response: chatResponse.response,
                        responseTime: responseTime,
                        usage: chatResponse.usage
                    }
                }));
                
            } catch (error) {
                log('error', 'Failed to process suggested question', { error: error.message });
                if (currentTool === 'ask') {
                    showError(error.message);
                }
            }
        }
        
        // Show answer with follow-up questions
        function showAnswerWithFollowUps(answer, question) {
            const mockAttributions = generateMockAttributions();
            
            let html = `
                <div class="gist-answer-text gist-content-entering">
                    <strong>DEMO ANSWER:</strong> ${answer.replace(/\n/g, '<br>')}
                </div>
            `;
            
            // Add attribution section
            html += `
                <div class="gist-attributions gist-content-entering gist-stagger-2">
                    <div class="gist-attributions-title">Sources</div>
                    <div class="gist-attribution-bar">
            `;
            
            // Add attribution segments
            for (const attribution of mockAttributions) {
                const width = attribution.percentage * 100;
                html += `
                    <div class="gist-attribution-segment" 
                         style="width: ${width}%; background-color: ${attribution.color};"
                         title="${attribution.source}: ${(attribution.percentage * 100).toFixed(1)}%">
                    </div>
                `;
            }
            
            html += `
                    </div>
                    <div class="gist-attribution-sources">
            `;
            
            // Add source labels
            for (const attribution of mockAttributions) {
                html += `
                    <div class="gist-attribution-source">
                        <div class="gist-attribution-dot" style="background-color: ${attribution.color};"></div>
                        <span>${attribution.source} (${(attribution.percentage * 100).toFixed(1)}%)</span>
                </div>
                `;
            }
            
            html += `
                </div>
                </div>
            `;
            
            // Add follow-up questions section
            html += `
                <div class="gist-follow-up-section gist-content-entering gist-stagger-3">
                    <div class="gist-follow-up-header">
                        <h4>Explore Further</h4>
                        <div class="gist-loading-dots">
                            <span></span><span></span><span></span>
                </div>
                    </div>
                </div>
            `;
            
            answerContent.innerHTML = html;
            hasAnswer = true;
            hasAskAnswer = true; // Mark that we have an Ask-specific answer
            
            // Trigger animations
            setTimeout(() => {
                const elements = answerContent.querySelectorAll('.gist-content-entering');
                elements.forEach(el => {
                    el.classList.remove('gist-content-entering');
                    el.classList.add('gist-content-entered');
                });
                
                // Apply text reveal animation to answer
                const answerText = answerContent.querySelector('.gist-answer-text');
                if (answerText) {
                    applyTextRevealAnimation(answerText);
                }
                
                // Show external ads with question context
                setTimeout(() => {
    
                }, 200);
            }, 50);
            
            // Generate follow-up questions
            generateFollowUpQuestions(question, answer);
        }
        
        // Generate and show follow-up questions
        async function generateFollowUpQuestions(question, answer) {
            try {
                const followUpQuestions = await generateSuggestedQuestions(question, answer);
                
                // Only update if user is still on ask tool and has this answer visible
                if (currentTool !== 'ask' || !hasAnswer) return;
                
                const followUpSection = answerContent.querySelector('.gist-follow-up-section');
                if (!followUpSection) return;
                
                let followUpHTML = `
                    <div class="gist-follow-up-header">
                        <h4>Explore Further</h4>
                    </div>
                    <div class="gist-follow-up-questions">
                `;
                
                followUpQuestions.forEach((followUpQuestion, index) => {
                    followUpHTML += `
                        <button class="gist-follow-up-question" data-question="${followUpQuestion.replace(/"/g, '&quot;')}">
                            <span class="gist-follow-up-question-icon">${index + 1}</span>
                            <span class="gist-follow-up-question-text">${followUpQuestion}</span>
                        </button>
                    `;
                });
                
                followUpHTML += `</div>`;
                
                followUpSection.innerHTML = followUpHTML;
                
                // Add click handlers for follow-up questions
                const followUpButtons = followUpSection.querySelectorAll('.gist-follow-up-question');
                followUpButtons.forEach(button => {
                    button.addEventListener('click', () => {
                        const followUpQuestion = button.dataset.question;
                        askSuggestedQuestion(followUpQuestion);
                    });
                });
                
            } catch (error) {
                log('error', 'Failed to generate follow-up questions', { error: error.message });
                
                // Hide the follow-up section if it failed
                const followUpSection = answerContent.querySelector('.gist-follow-up-section');
                if (followUpSection) {
                    followUpSection.style.display = 'none';
                }
            }
        }
        
        // Add event listeners for toolbox tabs using delegation
        toolbox.addEventListener('click', (e) => {
            // Check if clicked element is a toolbox tab
            if (e.target.classList.contains('gist-toolbox-tab')) {
                e.stopPropagation(); // Prevent event from bubbling up
                const tool = e.target.dataset.tool;
                
                // Only switch tool if it's enabled
                if (TOOLS_CONFIG[tool]) {
                    switchTool(tool);
                    userIsInteracting = true; // User clicked, keep expanded
                    isActive = true;
                }
            }
        });
        
        // Minimization/expansion functions
        function expandWidget() {
            if (!isMinimized) return;
            
            isMinimized = false;
            widget.classList.remove('minimized');
            widget.classList.add('active');
            
            // Update placeholder immediately for desktop mode responsiveness
            input.placeholder = 'Ask Anything';
            
            // Show toolbox if not already visible
            if (!toolbox.classList.contains('visible')) {
                toolbox.classList.add('visible');
            }
            
            log('debug', 'Widget expanded');
        }
        
        function minimizeWidget() {
            if (isMinimized) return;
            
            isMinimized = true;
            
            // Change placeholder immediately for smooth transition
                            input.placeholder = 'Ask Anything';
            input.blur(); // Remove focus
            
            // Hide answer container and toolbox immediately
            answerContainer.classList.remove('visible');
            toolbox.classList.remove('visible');
            

            
            // Start the minimization animation
            setTimeout(() => {
                widget.classList.add('minimized');
            }, 50);
            
            // Remove active class (blur) after a delay to sync with animation
            setTimeout(() => {
                widget.classList.remove('active');
            }, 150);
            
            log('debug', 'Widget minimized');
        }
        
        // Desktop mode functionality
        function toggleDesktopMode() {
            isDesktopMode = !isDesktopMode;
            
            if (isDesktopMode) {
                enableDesktopMode();
            } else {
                disableDesktopMode();
            }
            
            log('debug', `Desktop mode ${isDesktopMode ? 'enabled' : 'disabled'}`);
        }
        
        function enableDesktopMode() {
            widget.classList.add('desktop-mode');
            
            // Ensure widget is expanded and active initially
            expandWidget();
            isActive = true;
            userIsInteracting = true;
            
            // Update button appearance
            desktopModeBtn.style.background = '#4b5563';
            desktopModeBtn.title = 'Exit Desktop Mode';
            
            log('debug', 'Desktop mode enabled - widget moved to side with expanded view');
        }
        
        function disableDesktopMode() {
            widget.classList.remove('desktop-mode');
            
            // Reset button appearance
            desktopModeBtn.style.background = '#6b7280';
            desktopModeBtn.title = 'Desktop Mode';
            
            // Explicitly reset positioning to center the widget
            widget.style.right = '';
            widget.style.left = '';
            widget.style.width = '';
            widget.style.transform = '';
            
            // Re-enable normal widget behavior
            userIsInteracting = false;
            
            log('debug', 'Desktop mode disabled - widget returned to normal position');
        }
        
        // Widget hover handlers
        widget.addEventListener('mouseenter', () => {
            clearTimeout(hoverTimeout);
            widget.classList.add('active');
            expandWidget();
        });
        
        widget.addEventListener('mouseleave', () => {
            clearTimeout(hoverTimeout);
            // Allow auto-minimize in both normal and desktop mode
            hoverTimeout = setTimeout(() => {
                if (!userIsInteracting && !isActive) {
                    minimizeWidget();
                }
            }, 300); // 300ms delay before minimizing
        });
        
        // Track user interaction
        input.addEventListener('focus', () => {
            userIsInteracting = true;
            widget.classList.add('active');
            expandWidget();
        });
        
        input.addEventListener('blur', () => {
            // Delay to check if user clicked elsewhere
            setTimeout(() => {
                if (!input.value.trim()) {
                    userIsInteracting = false;
                    // Try to minimize if not hovering (works in both normal and desktop mode)
                    if (!widget.matches(':hover')) {
                        minimizeWidget();
                    }
                }
            }, 100);
        });
        
        input.addEventListener('input', () => {
            userIsInteracting = true;
            widget.classList.add('active');
            expandWidget();
        });
        
        // Note: Click outside handling moved to the main handler below to avoid conflicts
        
        // Function to apply text reveal animation
        function applyTextRevealAnimation(textElement) {
            const originalHTML = textElement.innerHTML;
            
            // Split text by sentences and bullet points for natural reading flow
            // This regex splits on sentence endings, bullet points, or explicit breaks
            const chunks = originalHTML.split(/([.!?]\s+|<br\s*\/?>\s*|•\s*)/);
            
            // Filter out empty chunks and combine meaningful text with punctuation
            const meaningfulChunks = [];
            let currentChunk = '';
            
            chunks.forEach(chunk => {
                if (chunk.trim()) {
                    currentChunk += chunk;
                    // If this chunk ends a sentence or is a break, add it as a complete chunk
                    if (chunk.match(/[.!?]\s+$/) || chunk.match(/<br\s*\/?>\s*/) || chunk.match(/•\s*/)) {
                        meaningfulChunks.push(currentChunk);
                        currentChunk = '';
                    }
                }
            });
            
            // Add any remaining text
            if (currentChunk.trim()) {
                meaningfulChunks.push(currentChunk);
            }
            
            // If we couldn't split meaningfully, split by words as fallback
            if (meaningfulChunks.length === 1 && meaningfulChunks[0].length > 100) {
                const words = originalHTML.split(/(\s+)/);
                meaningfulChunks.length = 0;
                for (let i = 0; i < words.length; i += 8) { // Group every 8 words
                    meaningfulChunks.push(words.slice(i, i + 8).join(''));
                }
            }
            
            // Clear the original content
            textElement.innerHTML = '';
            
            // Create spans for each chunk with staggered animation
            meaningfulChunks.forEach((chunk, index) => {
                if (chunk.trim()) {
                    const span = document.createElement('span');
                    span.innerHTML = chunk;
                    span.className = `gist-text-reveal gist-text-reveal-delay-${Math.min(index + 1, 10)}`;
                    textElement.appendChild(span);
                }
            });
        }
        

        

        

        

        

        

        
        // Settings functionality
        function showSettingsMenu() {
            // Mock current settings state
            const mockSettings = {
                tools: {
                    ask: true
                },
                appearance: {
                    selectedColor: '#6366f1'
                }
            };
            
            const colorOptions = [
                { name: 'Blue', value: '#6366f1' },
                { name: 'Purple', value: '#8b5cf6' },
                { name: 'Pink', value: '#ec4899' },
                { name: 'Green', value: '#22c55e' },
                { name: 'Orange', value: '#f59e0b' },
                { name: 'Red', value: '#ef4444' }
            ];
            
            let html = `
                <div class="gist-settings-menu gist-content-entering">
                    <div class="gist-settings-header">
                        <h3 class="gist-settings-title">Widget Settings</h3>
                        <button class="gist-settings-close" id="settings-close">✕</button>
                    </div>
                    
                    <div class="gist-settings-section">
                        <div class="gist-settings-section-title">Tools</div>
                        
                        <div class="gist-settings-option">
                            <span class="gist-settings-option-label">Ask Anything™ (Always Enabled)</span>
                            <button class="gist-settings-toggle enabled" disabled>
                            </button>
                        </div>
                        

                        

                        

                    </div>
                    
                    <div class="gist-settings-section">
                        <div class="gist-settings-section-title">Widget Color Theme</div>
                        <div class="gist-color-picker">
            `;
            
            colorOptions.forEach(color => {
                const isSelected = color.value === mockSettings.appearance.selectedColor;
                html += `
                    <div class="gist-color-option ${isSelected ? 'selected' : ''}" 
                         data-color="${color.value}" 
                         style="background-color: ${color.value};"
                         title="${color.name}">
                    </div>
                `;
            });
            
            html += `
                        </div>
                    </div>
                    
                    <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #9ca3af; font-style: italic;">
                        🚧 Demo Mode - Changes won't be saved
                    </div>
                </div>
            `;
            
            answerContent.innerHTML = html;
            hasAnswer = false;
            
            // Add event listeners for mock functionality
            const closeButton = answerContent.querySelector('#settings-close');
            const toggleButtons = answerContent.querySelectorAll('.gist-settings-toggle[data-tool]');
            const colorElements = answerContent.querySelectorAll('.gist-color-option');
            
            // Close settings menu
            closeButton.addEventListener('click', () => {
                // Return to the previous tool's content
                updateContentForTool(currentTool);
            });
            
            // Mock toggle functionality (visual only)
            toggleButtons.forEach(toggle => {
                if (!toggle.disabled) {
                    toggle.addEventListener('click', () => {
                        toggle.classList.toggle('enabled');
                        const toolName = toggle.dataset.tool;
                        const isEnabled = toggle.classList.contains('enabled');
                        
                        // Show feedback (but don't actually change anything)
                        console.log(`[Mock Settings] ${toolName} would be ${isEnabled ? 'enabled' : 'disabled'}`);
                        
                        // Add visual feedback
                        toggle.style.transform = 'scale(0.9)';
                        setTimeout(() => {
                            toggle.style.transform = '';
                        }, 150);
                    });
                }
            });
            
            // Mock color selection (visual only)
            colorElements.forEach(colorElement => {
                colorElement.addEventListener('click', () => {
                    // Remove selected from all options
                    colorElements.forEach(opt => opt.classList.remove('selected'));
                    // Add selected to clicked option
                    colorElement.classList.add('selected');
                    
                    const color = colorElement.dataset.color;
                    console.log(`[Mock Settings] Widget color would change to ${color}`);
                    
                    // Add visual feedback
                    colorElement.style.transform = 'scale(1.2)';
                    setTimeout(() => {
                        colorElement.style.transform = '';
                    }, 200);
                });
            });
            
            // Trigger animation
            setTimeout(() => {
                const elements = answerContent.querySelectorAll('.gist-content-entering');
                elements.forEach(el => {
                    el.classList.remove('gist-content-entering');
                    el.classList.add('gist-content-entered');
                });
            }, 50);
            
            // Show answer container
            answerContainer.classList.add('visible');
        }
        

        

        

        

        

        

        

        

        

        

        

        



        
        // Extract page content for context
        function extractPageContext() {
            if (pageContext) return pageContext; // Return cached context
            
            // Try to extract main content from the page
            let content = '';
            
            // Look for common content containers
            const selectors = [
                'article',
                '.article', 
                '#article',
                'main',
                '.content',
                '#content',
                '.post',
                '.entry-content',
                '[role="main"]'
            ];
            
            let contentElement = null;
            for (const selector of selectors) {
                contentElement = document.querySelector(selector);
                if (contentElement) break;
            }
            
            // If no specific content container found, try to get the body
            if (!contentElement) {
                contentElement = document.body;
            }
            
            if (contentElement) {
                // Clone the element to avoid modifying the original
                const clone = contentElement.cloneNode(true);
                
                // Remove script tags, style tags, and other non-content elements
                const elementsToRemove = clone.querySelectorAll('script, style, nav, header, footer, aside, .widget, #gist-widget-container, #gist-widget-container');
                elementsToRemove.forEach(el => el.remove());
                
                // Get text content and clean it up
                content = clone.textContent || clone.innerText || '';
                
                // Clean up whitespace and normalize
                content = content
                    .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
                    .replace(/\n\s*\n/g, '\n') // Remove empty lines
                    .trim();
                
                // Limit content length to avoid hitting API limits
                if (content.length > 3000) {
                    content = content.substring(0, 3000) + '...';
                }
            }
            
            // Get page title
            const title = document.title || '';
            
            // Cache the context
            pageContext = {
                title: title,
                content: content,
                url: window.location.href
            };
            
            // Log context extraction for debugging
            log('debug', 'Page context extracted', { 
                titleLength: title.length, 
                contentLength: content.length,
                hasContent: content.length > 50
            });
            
            return pageContext;
        }
        
        // Initialize conversation with page context
        function initializeConversationWithContext() {
            if (conversationHistory.length === 0) {
                const context = extractPageContext();
                if (context.content) {
                    const systemMessage = {
                        role: 'system',
                        content: `You are a helpful AI assistant. You have access to the content of the current webpage the user is viewing. Use this context to provide relevant and accurate answers about the content, but you can also answer general questions beyond the page content.

Page Title: ${context.title}

Page Content:
${context.content}

Instructions:
- When users ask questions related to the page content, reference it directly
- For questions about specific details in the article, cite the relevant information
- You can also answer general questions that go beyond the page content
- Keep responses concise but informative
- If asked about sources or citations, explain that you're drawing from the current webpage content`
                    };
                    
                    conversationHistory.push(systemMessage);
                }
            }
        }
        
        // API Integration Functions
        async function createChatCompletion(userPrompt) {
            // Initialize conversation with page context (only on first message)
            initializeConversationWithContext();
            
            // Add user message to conversation history
            conversationHistory.push({ role: 'user', content: userPrompt });
            
            const requestBody = {
                model: WIDGET_CONFIG.MODEL,
                messages: conversationHistory,
                max_tokens: 500
            };
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), WIDGET_CONFIG.TIMEOUT_MS);
            
            try {
                const response = await fetch(WIDGET_CONFIG.CHAT_API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestBody),
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
                }
                
                const data = await response.json();
                
                // Handle both OpenAI direct format and our backend format
                let assistantMessage;
                if (data.response) {
                    // Our backend format
                    assistantMessage = data.response;
                } else if (data.choices && data.choices[0] && data.choices[0].message) {
                    // Direct OpenAI format
                    assistantMessage = data.choices[0].message.content;
                } else {
                    throw new Error('Invalid response format from API');
                }
                
                // Add assistant response to conversation history
                conversationHistory.push({ role: 'assistant', content: assistantMessage });
                
                // Keep conversation history manageable (preserve system message + last 20 messages)
                if (conversationHistory.length > 21) {
                    // Keep the system message (index 0) and the last 20 messages
                    const systemMessage = conversationHistory[0];
                    const recentMessages = conversationHistory.slice(-20);
                    conversationHistory = [systemMessage, ...recentMessages];
                }
                
                return {
                    response: assistantMessage,
                    usage: data.usage
                };
            } catch (error) {
                clearTimeout(timeoutId);
                if (error.name === 'AbortError') {
                    throw new Error('Request timed out. Please try again.');
                }
                throw error;
            }
        }

        function showLoading() {
            // Ensure answer container and toolbox are visible
            answerContainer.classList.add('visible');
            toolbox.classList.add('visible');
            
            answerContent.innerHTML = `
                <div class="gist-loading">
                    <div class="gist-loading-spinner"></div>
                    <div class="gist-loading-text">Thinking...</div>
                </div>
            `;
        }
        
        function showError(errorMessage) {
            // Ensure answer container and toolbox are visible
            answerContainer.classList.add('visible');
            toolbox.classList.add('visible');
            
            // First, fade out loading if it exists
            const existingLoading = answerContent.querySelector('.gist-loading');
            if (existingLoading) {
                existingLoading.classList.add('fade-out');
                setTimeout(() => {
                    showErrorContent(errorMessage);
                }, 300);
            } else {
                showErrorContent(errorMessage);
            }
        }
        
        function showErrorContent(errorMessage) {
            // Check if we're in Ask or Gist tool to show ads
            const shouldShowAds = currentTool === 'ask' || currentTool === 'gist';
            
            let html = `
                <div class="gist-error gist-content-entering">
                    <strong>Error:</strong> ${errorMessage}
                </div>
            `;
            
            answerContent.innerHTML = html;
            
            // Trigger animation
            setTimeout(() => {
                const errorElement = answerContent.querySelector('.gist-error');
                if (errorElement) {
                    errorElement.classList.remove('gist-content-entering');
                    errorElement.classList.add('gist-content-entered');
                }
                
                // Show external ads with delay if appropriate
                if (shouldShowAds) {
                    setTimeout(() => {
        
                    }, 200);
                }
            }, 50);
        }
        
        function showAnswer(answer, question = null) {
            // Mark that we have an Ask-specific answer
            hasAskAnswer = true;
            
            // Store the current question for ad generation
            if (question) {
                currentQuestion = question;
            }
            
            // Ensure answer container and toolbox are visible
            answerContainer.classList.add('visible');
            toolbox.classList.add('visible');
            
            // First, fade out loading if it exists
            const existingLoading = answerContent.querySelector('.gist-loading');
            if (existingLoading) {
                existingLoading.classList.add('fade-out');
                setTimeout(() => {
                    showAnswerContent(answer, question);
                }, 300); // Wait for fade out to complete
            } else {
                showAnswerContent(answer, question);
            }
        }
        
        function showAnswerContent(answer, question = null) {
            // Format the answer with line breaks for better readability
            const formattedAnswer = answer.replace(/\n/g, '<br>');
            
            // Store the current question for ad generation
            if (question) {
                currentQuestion = question;
            }
            
            // Generate mock attribution data
            const mockAttributions = generateMockAttributions();
            
            // Build HTML without ads (ads will be shown externally)
            let html = `<div class="gist-answer-text gist-content-entering"><strong>DEMO ANSWER:</strong> ${formattedAnswer}</div>`;
            
            // Add attribution section
            html += `
                <div class="gist-attributions gist-content-entering gist-stagger-2">
                    <div class="gist-attributions-title">Sources</div>
                    <div class="gist-attribution-bar">
            `;
            
            // Add attribution segments
            for (const attribution of mockAttributions) {
                const width = attribution.percentage * 100;
                html += `
                    <div class="gist-attribution-segment" 
                         style="width: ${width}%; background-color: ${attribution.color};"
                         title="${attribution.source}: ${(attribution.percentage * 100).toFixed(1)}%">
                    </div>
                `;
            }
            
            html += `
                    </div>
                    <div class="gist-attribution-sources">
            `;
            
            // Add source labels
            for (const attribution of mockAttributions) {
                html += `
                    <div class="gist-attribution-source">
                        <div class="gist-attribution-dot" style="background-color: ${attribution.color};"></div>
                        <span>${attribution.source} (${(attribution.percentage * 100).toFixed(1)}%)</span>
                    </div>
                `;
            }
            
            html += `
                    </div>
                    <div class="gist-source-previews">
            `;
            
            // Add source preview cards
            for (const attribution of mockAttributions) {
                const formatDate = (date) => {
                    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
                };
                
                html += `
                    <div class="gist-source-preview" style="--source-color: ${attribution.color};" data-url="${attribution.url}">
                        <div class="gist-source-preview-image">
                            <div class="gist-source-preview-icon">${attribution.icon}</div>
                        </div>
                        <div class="gist-source-preview-content">
                            <div class="gist-source-preview-header">
                                <div class="gist-source-preview-source">${attribution.source}</div>
                                <div class="gist-source-preview-date">${formatDate(attribution.date)}</div>
                            </div>
                            <div class="gist-source-preview-title">${attribution.title}</div>
                            <div class="gist-source-preview-description">${attribution.description}</div>
                        </div>
                        <div class="gist-source-preview-percentage">${(attribution.percentage * 100).toFixed(0)}%</div>
                    </div>
                `;
            }
            
            html += `
                    </div>
                </div>
            `;
            
            answerContent.innerHTML = html;
            hasAnswer = true;
            
            // Add click handlers to source preview cards
            setTimeout(() => {
                const sourcePreviewCards = answerContent.querySelectorAll('.gist-source-preview[data-url]');
                sourcePreviewCards.forEach(card => {
                    card.addEventListener('click', () => {
                        const url = card.dataset.url;
                        if (url) {
                            window.open(url, '_blank', 'noopener,noreferrer');
                        }
                    });
                });
            }, 100);
            
            // Trigger animations after a brief delay to ensure DOM is updated
            setTimeout(() => {
                const elements = answerContent.querySelectorAll('.gist-content-entering');
                elements.forEach(el => {
                    el.classList.remove('gist-content-entering');
                    el.classList.add('gist-content-entered');
                });
                
                // Apply text reveal animation to answer text
                const answerText = answerContent.querySelector('.gist-answer-text');
                if (answerText) {
                    applyTextRevealAnimation(answerText);
                }
                
                // Show external ads with delay
                setTimeout(() => {
    
                }, 200);

            }, 50);
        }
        

        

        

        

        

        

        


        function generateMockAttributions() {
            // Array of possible mock sources with realistic names and rich data
            const possibleSources = [
                { 
                    name: 'Wikipedia', 
                    icon: 'W',
                    url: 'https://en.wikipedia.org',
                    titles: [
                        'Stock market',
                        'Financial markets',
                        'Securities exchange',
                        'Capital markets',
                        'Investment banking'
                    ],
                    descriptions: [
                        'A stock market, equity market, or share market is the aggregation of buyers and sellers of stocks...',
                        'Financial markets refer to any marketplace where the trading of securities occurs...',
                        'A securities exchange facilitates the buying and selling of securities...',
                        'Capital markets allow businesses to raise long-term funding...',
                        'Investment banking involves the creation of capital for companies and governments...'
                    ]
                },
                { 
                    name: 'Stanford Research', 
                    icon: 'S',
                    url: 'https://www.stanford.edu',
                    titles: [
                        'Market Efficiency and Information Theory',
                        'Behavioral Finance in Modern Markets',
                        'Algorithmic Trading Strategies',
                        'Risk Management in Financial Markets',
                        'Corporate Finance and Valuation'
                    ],
                    descriptions: [
                        'Research on how quickly markets incorporate new information into stock prices...',
                        'Study of psychological factors affecting investor decision-making processes...',
                        'Analysis of computer-driven trading strategies and market impact...',
                        'Comprehensive framework for measuring and managing financial risks...',
                        'Methods for determining the intrinsic value of companies and securities...'
                    ]
                },
                { 
                    name: 'MIT OpenCourseWare', 
                    icon: 'M',
                    url: 'https://ocw.mit.edu',
                    titles: [
                        'Financial Theory I',
                        'Introduction to Financial Markets',
                        'Mathematical Finance',
                        'Corporate Finance',
                        'Portfolio Theory and Risk Management'
                    ],
                    descriptions: [
                        'Fundamental principles of financial decision making and market operations...',
                        'Overview of financial institutions, markets, and investment instruments...',
                        'Mathematical models for pricing derivatives and managing risk...',
                        'Financial management decisions within corporations and organizations...',
                        'Modern portfolio theory and risk-return optimization techniques...'
                    ]
                },
                { 
                    name: 'Nature Journal', 
                    icon: 'N',
                    url: 'https://www.nature.com',
                    titles: [
                        'Network analysis of financial markets',
                        'Complexity science in economics',
                        'Machine learning in finance',
                        'Systemic risk in banking',
                        'Quantum computing for finance'
                    ],
                    descriptions: [
                        'Application of network theory to understand financial market interconnections...',
                        'Complex systems approach to modeling economic phenomena...',
                        'Advanced AI techniques for financial prediction and analysis...',
                        'Study of interconnected risks in the global banking system...',
                        'Exploring quantum algorithms for financial optimization problems...'
                    ]
                },
                { 
                    name: 'Scientific American', 
                    icon: 'SA',
                    url: 'https://www.scientificamerican.com',
                    titles: [
                        'The Psychology of Market Bubbles',
                        'How AI is Reshaping Finance',
                        'The Future of Digital Currency',
                        'Understanding Market Volatility',
                        'Sustainable Investment Strategies'
                    ],
                    descriptions: [
                        'Exploring the psychological factors that lead to financial bubbles...',
                        'How artificial intelligence is transforming financial services...',
                        'The evolution and potential of cryptocurrencies and digital assets...',
                        'Scientific approaches to understanding price fluctuations...',
                        'Investment strategies that consider environmental and social impact...'
                    ]
                },
                { 
                    name: 'MoneyWeek', 
                    icon: 'MW',
                    url: 'https://moneyweek.com',
                    titles: [
                        'How to navigate the financial markets',
                        'Investment strategies for beginners',
                        'Market outlook and predictions',
                        'Personal finance management',
                        'Trading tips and techniques'
                    ],
                    descriptions: [
                        'Financial markets exist for one reason: they bring investors together...',
                        'Practical advice for new investors entering the stock market...',
                        'Expert analysis and forecasts for various financial markets...',
                        'Strategies for managing personal wealth and investments...',
                        'Tactical approaches to trading stocks, bonds, and other securities...'
                    ]
                },
                { 
                    name: 'Prospect Magazine', 
                    icon: 'P',
                    url: 'https://www.prospectmagazine.co.uk',
                    titles: [
                        'Making banks boring again',
                        'The future of financial regulation',
                        'Fintech disruption analysis',
                        'Central bank digital currencies',
                        'Financial inequality studies'
                    ],
                    descriptions: [
                        'A vibrant and professional financial services industry is essential to a...',
                        'Analysis of regulatory approaches to maintaining financial stability...',
                        'How technology startups are challenging traditional banking...',
                        'The potential impact of government-issued digital currencies...',
                        'Research on wealth distribution and access to financial services...'
                    ]
                },
                { 
                    name: 'Harvard Business Review', 
                    icon: 'H',
                    url: 'https://hbr.org',
                    titles: [
                        'Strategic Asset Allocation',
                        'ESG Investing Trends',
                        'Private Equity Performance',
                        'Financial Innovation',
                        'Market Leadership Strategies'
                    ],
                    descriptions: [
                        'Best practices for long-term investment portfolio management...',
                        'Environmental, social, and governance factors in investment decisions...',
                        'Analysis of returns and strategies in private equity markets...',
                        'How technological innovation is disrupting financial services...',
                        'Leadership strategies for financial services organizations...'
                    ]
                }
            ];
            
            const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#06b6d4', '#84cc16'];
            
            // Randomly select 2-4 sources
            const numSources = Math.floor(Math.random() * 3) + 2; // 2-4 sources
            const selectedSources = [];
            const usedSources = new Set();
            
            // Generate random percentages that sum to 1
            const rawPercentages = [];
            for (let i = 0; i < numSources; i++) {
                rawPercentages.push(Math.random());
            }
            
            const sum = rawPercentages.reduce((a, b) => a + b, 0);
            const normalizedPercentages = rawPercentages.map(p => p / sum);
            
            for (let i = 0; i < numSources; i++) {
                let sourceData;
                do {
                    sourceData = possibleSources[Math.floor(Math.random() * possibleSources.length)];
                } while (usedSources.has(sourceData.name));
                
                usedSources.add(sourceData.name);
                
                // Generate random date within the last 20 years
                const randomDate = new Date();
                randomDate.setFullYear(randomDate.getFullYear() - Math.floor(Math.random() * 20));
                randomDate.setMonth(Math.floor(Math.random() * 12));
                randomDate.setDate(Math.floor(Math.random() * 28) + 1);
                
                // Pick random title and description
                const titleIndex = Math.floor(Math.random() * sourceData.titles.length);
                const descIndex = Math.floor(Math.random() * sourceData.descriptions.length);
                
                selectedSources.push({
                    source: sourceData.name,
                    icon: sourceData.icon,
                    url: sourceData.url,
                    title: sourceData.titles[titleIndex],
                    description: sourceData.descriptions[descIndex],
                    date: randomDate,
                    percentage: normalizedPercentages[i],
                    color: colors[i % colors.length]
                });
            }
            
            // Sort by percentage (largest first)
            return selectedSources.sort((a, b) => b.percentage - a.percentage);
        }
        

        
        function showPlaceholder() {
            showPlaceholderForTool(currentTool);
        }
        
        // Function to toggle answer container and toolbox
        function showAnswerContainer() {
            // Always show the container and toolbox on hover/interaction
            answerContainer.classList.add('visible');
            toolbox.classList.add('visible');
            

            
            // Expand widget and mark as interacting when showing answers
            userIsInteracting = true;
            widget.classList.add('active');
            expandWidget();
            
            // If no answer yet, show placeholder
            if (!hasAnswer) {
                showPlaceholder();
            }
        }
        
        function hideAnswerContainer() {
            if (!isActive) {
                answerContainer.classList.remove('visible');
                toolbox.classList.remove('visible');

            }
        }
        
        // Function to handle query submission
        async function submitQuery() {
            const query = input.value.trim();
            if (!query) return;
            
            // Only process queries when in "Ask" mode
            if (currentTool !== 'ask') {
                // Switch to Ask tool if user submits a query
                switchTool('ask');
            }
            
            // Clear any existing timeout
            if (submitTimeout) {
                clearTimeout(submitTimeout);
            }
            
            // Debounce the submission as per PRD (300ms)
            submitTimeout = setTimeout(async () => {
                try {
                    log('info', 'User submitted query', { query });
                    
                    // Store the current question for ad generation
                    currentQuestion = query;
                    
                    // Ensure answer container and toolbox are visible and show loading state immediately
                    answerContainer.classList.add('visible');
                    toolbox.classList.add('visible');
                    showLoading();
                    
                    // Get chat completion from Gist
                    const startTime = Date.now();
                    const chatResponse = await createChatCompletion(query);
                    const responseTime = Date.now() - startTime;
                    
                    // Display the answer only if user is still on ask tool
                    if (currentTool === 'ask') {
                    showAnswer(chatResponse.response, query);
                    }
                    
                    // Clear input
                    input.value = '';
                    input.blur();
                    
                    // Emit success event for host analytics
                    window.dispatchEvent(new CustomEvent('gist-response', {
                        detail: {
                            query: query,
                            response: chatResponse.response,
                            responseTime: responseTime,
                            usage: chatResponse.usage
                        }
                    }));
                    
                } catch (error) {
                    log('error', 'Gist API request failed', { error: error.message, query });
                    
                    // Show error in answer container only if user is still on ask tool
                    if (currentTool === 'ask') {
                    showError(error.message);
                    showAnswerContainer();
                    hasAnswer = true;
                    }
                    
                    // Emit error event for host analytics
                    window.dispatchEvent(new CustomEvent('gist-error', {
                        detail: {
                            error: error.message,
                            query: query,
                            type: 'api_request'
                        }
                    }));
                }
            }, WIDGET_CONFIG.DEBOUNCE_MS);
        }
        
        // Note: Hover logic now handled by minimization/expansion functions above
        
        // Handle click to activate input
        pill.addEventListener('click', (e) => {
            e.stopPropagation();
            userIsInteracting = true;
            isActive = true;
            expandWidget();
            input.focus();
            
            // Ensure Ask tool content is shown if no other tool is active
            if (currentTool === 'ask' && !hasAskAnswer) {
                showSuggestedQuestions();
            }
        });
        
        // Handle input focus (activate state)
        input.addEventListener('focus', () => {
            isActive = true;
            userIsInteracting = true;
            expandWidget();
            showAnswerContainer();
            
            // Show Ask tool content if no answer exists
            if (currentTool === 'ask' && !hasAskAnswer) {
                showSuggestedQuestions();
            }
        });
        
        // Handle input blur (deactivate state)
        input.addEventListener('blur', () => {
            isActive = false;
            // Reset interaction state after a delay
            setTimeout(() => {
                if (!input.value.trim()) {
                    userIsInteracting = false;
                }
    }, 100);
        });
        
        // Handle input hover - auto-desktop mode disabled
        input.addEventListener('mouseenter', () => {
            // Auto-desktop mode functionality disabled per user request
            // Users can still manually toggle desktop mode using the desktop mode button
        });
        
        // Handle Enter key press
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                submitQuery();
            }
        });
        
        // Handle submit button click
        submitBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            userIsInteracting = true;
            isActive = true;
            submitQuery();
        });
        
        // Handle desktop mode button click
        desktopModeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            userIsInteracting = true;
            isActive = true;
            toggleDesktopMode();
        });
        
        // Handle close button click
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // Minimize the widget but keep desktop mode if active
            isActive = false;
            userIsInteracting = false;
            input.blur();
            minimizeWidget();
        });
        
        // Handle secret settings button click
        settingsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            userIsInteracting = true;
            isActive = true;
            
            // Show mock settings menu
            showSettingsMenu();
        });
        
        // Prevent clicks on answer container from bubbling
        answerContainer.addEventListener('click', (e) => {
            e.stopPropagation();
            userIsInteracting = true;
            isActive = true;
        });
        
        // Prevent clicks on toolbox from bubbling
        toolbox.addEventListener('click', (e) => {
            e.stopPropagation();
            userIsInteracting = true;
            isActive = true;
        });
        

        
        // Handle clicking outside to minimize
        document.addEventListener('click', (e) => {
            // Check if click is outside the widget container
            if (!widgetContainer.contains(e.target)) {
                // Both normal and desktop mode: deactivate and minimize
                isActive = false;
                userIsInteracting = false;
                input.blur();
                
                // Start minimization immediately, blur will fade with the animation
                setTimeout(() => minimizeWidget(), 100);
            }
        });
        
        // Disable automatic style observer to prevent issues with complex websites
        // const styleObserver = createStyleObserver(shadowRoot);
        const styleObserver = null; // Disabled to prevent widget disappearing on complex sites
        
        // Log the applied styling for debugging
        log('info', 'Widget styling applied', { 
            websiteType, 
            extractedStyling: enhancedStyling,
            logoFound: !!enhancedStyling.logoUrl,
            faviconFound: !!enhancedStyling.faviconUrl,
            colorCount: enhancedStyling.brandColors.length
        });
        
        // Add style debugging to console for developers
        console.group('🎨 Gist Widget Styling Analysis');
        console.log('Website Type:', websiteType);
        console.log('Extracted Styling:', enhancedStyling);
        console.log('Logo URL:', enhancedStyling.logoUrl || 'Not found');
        console.log('Favicon URL:', enhancedStyling.faviconUrl || 'Not found');
        console.log('Brand Colors:', enhancedStyling.brandColors);
        console.log('Font Family:', enhancedStyling.fontFamily);
        console.groupEnd();
        
        // Trigger entrance animation after a brief delay
        setTimeout(() => {
            const widget = shadowRoot.getElementById('gist-widget');
            if (widget) {
                widget.classList.add('loaded');
            }
        }, 100);
        
        // Store references for potential future updates
        window.gistWidgetShadowRoot = shadowRoot;
        window.gistWidgetStyling = enhancedStyling;
        window.gistStyleObserver = styleObserver;
        window.gistCurrentTool = currentTool;
        window.gistSwitchTool = switchTool;
        window.gistOptimizeToolboxAlignment = optimizeToolboxAlignment;
        
        return shadowRoot;
    }
    
    // Public API for manual styling updates
    window.GistWidget = {
        // Force refresh widget styling
        refreshStyling: function() {
            if (window.gistWidgetShadowRoot) {
                updateWidgetStyling(window.gistWidgetShadowRoot);
                log('info', 'Widget styling manually refreshed');
            }
        },
        
        // Get current widget styling
        getStyling: function() {
            return window.gistWidgetStyling || null;
        },
        
        // Apply custom styling override
        applyStyling: function(customStyling) {
            if (window.gistWidgetShadowRoot && customStyling) {
                const mergedStyling = { ...window.gistWidgetStyling, ...customStyling };
                const customStyles = generateDynamicStyles(mergedStyling);
                
                const existingStyle = window.gistWidgetShadowRoot.querySelector('style');
                if (existingStyle) {
                    existingStyle.textContent = customStyles + existingStyle.textContent.split('/* ORIGINAL STYLES */')[1] || '';
                }
                
                window.gistWidgetStyling = mergedStyling;
                log('info', 'Custom styling applied', { customStyling });
            }
        },
        
        // Debug: Show styling analysis
        debugStyling: async function() {
            const current = await analyzeWebsiteStyling();
            console.group('🔍 Current Website Styling Analysis');
            console.log('Current Analysis:', current);
            console.log('Applied Styling:', window.gistWidgetStyling);
            console.groupEnd();
            return current;
        },
        
        // Enable/disable automatic styling updates (DISABLED to prevent issues)
        setAutoUpdate: function(enabled) {
            // Auto-update is permanently disabled to prevent widget disappearing on complex sites
            log('info', 'Auto-update styling disabled for stability', { requestedEnabled: enabled });
        },
        
        // Configure which tools are enabled/disabled
        configureTools: function(toolsConfig) {
            if (!toolsConfig || typeof toolsConfig !== 'object') {
                console.error('[GistWidget] Invalid tools configuration. Must be an object.');
                return;
            }
            
            // Update TOOLS_CONFIG with provided settings
            Object.keys(toolsConfig).forEach(tool => {
                if (TOOLS_CONFIG.hasOwnProperty(tool)) {
                    TOOLS_CONFIG[tool] = Boolean(toolsConfig[tool]);
            } else {
                    console.warn(`[GistWidget] Unknown tool '${tool}' ignored.`);
                }
            });
            
            // Regenerate tabs if widget exists
            if (window.gistWidgetShadowRoot) {
                const shadowRoot = window.gistWidgetShadowRoot;
                const toolboxTabsContainer = shadowRoot.getElementById('gist-toolbox-tabs');
                
                if (toolboxTabsContainer) {
                    // Get the generate function from the widget's scope
                    // We need to regenerate tabs based on new config
                    const toolLabels = {
                        ask: 'Ask'
                    };
                    
                    // Clear existing tabs
                    toolboxTabsContainer.innerHTML = '';
                    
                    // Get enabled tools in the desired order
                    const toolOrder = ['ask'];
                    const enabledTools = toolOrder.filter(tool => TOOLS_CONFIG[tool]);
                    
                    if (enabledTools.length === 0) {
                        console.error('[GistWidget] At least one tool must be enabled');
                        TOOLS_CONFIG.ask = true; // Force enable Ask as fallback
                        enabledTools.push('ask');
                    }
                    
                    // Generate tabs for enabled tools
                    enabledTools.forEach((tool, index) => {
                        const button = document.createElement('button');
                        button.className = 'gist-toolbox-tab';
                        button.setAttribute('data-tool', tool);
                        button.textContent = toolLabels[tool];
                        
                        // Make first enabled tool active if current tool is disabled
                        if (!TOOLS_CONFIG[window.gistCurrentTool] && index === 0) {
                            button.classList.add('active');
                            // We'll need to switch to this tool
                            setTimeout(() => {
                                if (window.gistSwitchTool) {
                                    window.gistSwitchTool(tool);
                                }
                            }, 100);
                        } else if (tool === window.gistCurrentTool) {
                            button.classList.add('active');
                        }
                        
                        toolboxTabsContainer.appendChild(button);
                    });
                    
                    // Re-optimize toolbox alignment
                    if (window.gistOptimizeToolboxAlignment) {
                        setTimeout(window.gistOptimizeToolboxAlignment, 100);
                    }
                    
                    log('info', 'Tools configuration updated', { enabledTools, config: TOOLS_CONFIG });
                }
            }
        },
        
        // Get current tools configuration
        getToolsConfig: function() {
            return { ...TOOLS_CONFIG };
        }
    };

    // Initialize widget when DOM is ready
    function initWidget() {
  if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => createWidget());
  } else {
            createWidget();
        }
    }
    
    // Logging function for debugging
    function log(level, msg, extra = {}) {
        if (!window.gistDebug && level === 'debug') return;
        const payload = { level, msg, ts: Date.now(), ...extra };
        console[level]("[GistWidget]", payload);
    }
    
    log('info', 'Gist Widget loader initialized');
    
    // Log available configuration options for developers
    console.group('🛠️ Gist Widget Configuration');
    console.log('Tools Configuration:');
    console.log('• TOOLS_CONFIG =', TOOLS_CONFIG);
                    console.log('• GistWidget.configureTools({ ask: true })');
    console.log('• GistWidget.getToolsConfig()');
    console.log('');
    console.log('Usage Examples:');
                    console.log('• TOOLS_CONFIG.ask = true  // Enable Ask tool');
                    console.log('• GistWidget.configureTools({ ask: true })  // Configure Ask tool only');
    console.groupEnd();
    
    initWidget();
})();