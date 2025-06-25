(function() {
    // Debug logging
    console.log('Widget script loaded');
    console.log('Script path:', document.currentScript.src);

    // Get the script's location to reference assets relatively
    const scriptElement = document.currentScript;
    const scriptPath = scriptElement.src;
    
    // Handle both direct and proxied paths
    let basePath;
    if (scriptPath.includes('/api/proxy')) {
        // For proxied paths, use the proxy endpoint
        basePath = '/api/proxy?url=' + encodeURIComponent('http://' + window.location.host + '/');
    } else {
        // For direct paths, use relative path
        basePath = scriptPath.substring(0, scriptPath.lastIndexOf('/'));
    }

    // Function to detect website name and font from common elements
    function detectWebsiteInfo() {
        // Common selectors where logos might be found
        const logoSelectors = [
            '.logo', '#logo', 'header .logo', 'header #logo',
            '[class*="logo"]', '[id*="logo"]',
            '.brand', '#brand', '.site-title', '#site-title',
            'header h1'
        ];

        let websiteName = '';
        let logoFont = '';
        let logoElement = null;

        // First try meta tags for name
        const metaName = document.querySelector('meta[property="og:site_name"]');
        if (metaName) {
            websiteName = metaName.getAttribute('content');
        }

        // Try to find logo element and its font
        for (const selector of logoSelectors) {
            const element = document.querySelector(selector);
            if (element) {
                // Get computed styles
                const styles = window.getComputedStyle(element);
                
                // If we haven't found a name yet, try to get it from text content
                if (!websiteName) {
                    const textContent = element.textContent.trim();
                    if (textContent) {
                        websiteName = textContent.split(/[-|]/)[0].trim();
                    }
                }

                // Get font family
                if (styles.fontFamily) {
                    logoFont = styles.fontFamily;
                    break;
                }
            }
        }

        // Fallback to domain name if no name found
        if (!websiteName) {
            const domain = window.location.hostname.replace('www.', '');
            websiteName = domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1);
        }

        // Fallback to inherited font if no font found
        if (!logoFont) {
            logoFont = 'inherit';
        }

        return { name: websiteName, font: logoFont };
    }

    // Create and inject styles
    const styles = `
        .gist-widget-container {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 999999;
            width: 400px;
            max-width: 90%;
            background: white;
            border-radius: 50px;
            padding: 12px 24px;
            box-sizing: border-box;
            display: flex;
            align-items: center;
            transition: all 0.3s ease;
            border: 2px solid transparent;
            background-image: linear-gradient(white, white), 
                            linear-gradient(60deg, #FF8C42, #4B9FE1, #8860D0);
            background-origin: border-box;
            background-clip: padding-box, border-box;
        }

        .gist-widget-container:hover {
            transform: translateX(-50%) translateY(-2px);
        }

        .gist-search-input {
            flex: 1;
            border: none;
            outline: none;
            font-size: 16px;
            padding: 8px;
            background: transparent;
            color: #333;
            font-family: inherit;
        }

        .gist-search-input::placeholder {
            color: #666;
        }

        .gist-website-name {
            font-family: var(--website-font);
        }

        .gist-search-icon {
            width: 20px;
            height: 20px;
            margin-right: 10px;
            opacity: 0.7;
            object-fit: contain;
        }

        .gist-arrow-button {
            width: 32px;
            height: 32px;
            background: #8BC34A;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: transform 0.2s ease;
            margin-left: 8px;
            border: none;
            padding: 0;
        }

        .gist-arrow-button:hover {
            transform: scale(1.1);
        }

        .gist-arrow-icon {
            width: 18px;
            height: 18px;
            stroke: white;
            stroke-width: 2;
            fill: none;
        }
    `;

    // Create style element and append to head
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    // Get website info
    const websiteInfo = detectWebsiteInfo();
    
    // Add the font as a CSS variable
    document.documentElement.style.setProperty('--website-font', websiteInfo.font);

    // Create widget HTML using the correct path to sparkles.png
    const widgetHTML = `
        <div class="gist-widget-container">
            <img src="${basePath}/sparkles.png" class="gist-search-icon" alt="sparkles icon">
            <input type="text" class="gist-search-input" placeholder="Ask ${websiteInfo.name} anything...">
            <button class="gist-arrow-button">
                <svg class="gist-arrow-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 17L17 7M17 7H10M17 7V14" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
        </div>
    `;

    // Create container element
    const container = document.createElement('div');
    container.innerHTML = widgetHTML;
    
    // Apply the website font to the input
    const input = container.querySelector('.gist-search-input');
    input.style.setProperty('--website-font', websiteInfo.font);
    
    document.body.appendChild(container.firstElementChild);

    // Add input event listener
    const searchInput = document.querySelector('.gist-search-input');
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            // TODO: Handle search query
            console.log('Search query:', e.target.value);
        }
    });
})();