(function() {
    'use strict';

    // ================================
    // CONFIGURATION
    // ================================
    
    // Dynamically determine the backend URL from the widget script source
    function getBackendBaseUrl() {
        const scripts = document.querySelectorAll('script[src*="widget.js"]');
        for (const script of scripts) {
            const src = script.src;
            if (src) {
                const url = new URL(src);
                return `${url.protocol}//${url.host}`;
            }
        }
        
        if (typeof document !== 'undefined' && document.currentScript) {
            const src = document.currentScript.src;
            if (src) {
                const url = new URL(src);
                return `${url.protocol}//${url.host}`;
            }
        }
        
        return 'https://gpademo.vercel.app';
    }

    const BACKEND_BASE_URL = getBackendBaseUrl();

    const WIDGET_CONFIG = {
        CHAT_API_URL: `${BACKEND_BASE_URL}/api/chat`,
        MODEL: 'gpt-3.5-turbo',
        TIMEOUT_MS: 20000,
        DEBOUNCE_MS: 300,
        // Loading phase durations
        SKELETON_DURATION: 1750,    // 1.75 seconds
        SOURCES_DURATION: 1250,     // 1.25 seconds
        GENERATING_DURATION: 750    // 0.75 seconds
    };
    
    // ================================
    // DARK MODE DETECTION
    // ================================
    
    function detectDarkMode() {
        // Check CSS media query
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return true;
        }
        
        // Check body background color
        const bodyStyle = window.getComputedStyle(document.body);
        const bgColor = bodyStyle.backgroundColor;
        
        if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
            // Convert to RGB values
            const rgbMatch = bgColor.match(/\d+/g);
            if (rgbMatch && rgbMatch.length >= 3) {
                const [r, g, b] = rgbMatch.map(Number);
                // Calculate luminance
                const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
                return luminance < 0.5; // Dark if luminance is low
            }
        }
        
        // Check for common dark mode class names
        const darkModeClasses = ['dark', 'dark-mode', 'dark-theme', 'theme-dark'];
        for (const className of darkModeClasses) {
            if (document.body.classList.contains(className) || 
                document.documentElement.classList.contains(className)) {
                return true;
            }
        }
        
        return false;
    }
    
    // ================================
    // WEBSITE STYLING EXTRACTION
    // ================================
    
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
        isDarkMode: false
    };

    // Extract website favicon and logo
    async function extractLogosAndIcons() {
        const results = { favicon: null, logo: null };
        
        // Favicon candidates with priority
        const faviconSelectors = [
            { selector: 'link[rel="apple-touch-icon"][sizes="180x180"]', priority: 100 },
            { selector: 'link[rel="apple-touch-icon"][sizes="192x192"]', priority: 95 },
            { selector: 'link[rel="icon"][sizes="192x192"]', priority: 90 },
            { selector: 'link[rel="icon"][sizes="180x180"]', priority: 85 },
            { selector: 'link[rel="apple-touch-icon"]', priority: 75 },
            { selector: 'link[rel="icon"]', priority: 45 },
            { selector: 'link[rel="shortcut icon"]', priority: 40 }
        ];
        
        const faviconCandidates = [];
        
        faviconSelectors.forEach(({ selector, priority }) => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                let url = element.href;
                if (url && isValidImageUrl(url)) {
                    if (url.startsWith('/')) {
                        url = window.location.origin + url;
                    }
                    faviconCandidates.push({ url, priority });
                }
            });
        });
        
        // Add fallback paths
        const fallbackPaths = ['/favicon.ico', '/favicon.png', '/favicon.svg'];
        fallbackPaths.forEach((path, index) => {
            faviconCandidates.push({
                url: window.location.origin + path,
                priority: 25 - index
            });
        });
        
        // Sort and test candidates
        faviconCandidates.sort((a, b) => b.priority - a.priority);
        
        for (const candidate of faviconCandidates) {
            const isWorking = await testImageUrl(candidate.url);
            if (isWorking) {
                results.favicon = candidate.url;
                break;
            }
        }
        
        // Look for logos
        const logoSelectors = [
                '.logo img[src]',
                '.brand img[src]',
                'header .logo img[src]',
                'nav .logo img[src]',
            '.navbar-brand img[src]'
        ];
        
        for (const selector of logoSelectors) {
                const element = document.querySelector(selector);
                if (element && element.src && isValidImageUrl(element.src)) {
                        const isWorking = await testImageUrl(element.src);
                        if (isWorking) {
                            results.logo = element.src;
                            break;
                }
            }
        }
        
        // Use favicon as logo if no logo found
        if (!results.logo && results.favicon) {
                results.logo = results.favicon;
        }
        
        // Fallback to backend logo
        if (!results.favicon && !results.logo) {
            results.logo = `${BACKEND_BASE_URL}/gist-logo.png`;
        }
        
        if (!results.favicon && results.logo) {
            results.favicon = results.logo;
        }
        
        return results;
    }
    
    async function testImageUrl(url) {
        return new Promise((resolve) => {
            const img = new Image();
            const timeout = setTimeout(() => resolve(false), 3000);
            
            img.onload = () => {
                clearTimeout(timeout);
                resolve(img.width > 1 && img.height > 1);
            };
            
            img.onerror = () => {
                clearTimeout(timeout);
                resolve(false);
            };
            
            img.src = url;
        });
    }
    
    function isValidImageUrl(url) {
        if (!url || typeof url !== 'string') return false;
        url = url.trim();
        if (url.length === 0) return false;
        
        const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg|ico|bmp)(\?.*)?$/i;
        const logoIndicators = /(\/logo|\/brand|\/icon|favicon|apple-touch)/i;
        
        return imageExtensions.test(url) || 
               logoIndicators.test(url) ||
               url.includes('favicon') ||
               url.endsWith('/favicon.ico');
    }
    
    function extractColorScheme() {
        const colors = {
            backgrounds: new Set(),
            textColors: new Set(),
            accentColors: new Set()
        };
        
        const sampleElements = [
            ...document.querySelectorAll('header, nav, .header, .navbar'),
            ...document.querySelectorAll('button, .btn, .button'),
            ...document.querySelectorAll('a[href], .link'),
            document.body
        ];
        
        sampleElements.forEach(element => {
            if (!element) return;
            
            const style = window.getComputedStyle(element);
            
            const bgColor = style.backgroundColor;
            if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
                colors.backgrounds.add(bgColor);
            }
            
            const textColor = style.color;
            if (textColor) {
                colors.textColors.add(textColor);
            }
            
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
            accentColors: Array.from(colors.accentColors)
        };
    }
    
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
    
    async function analyzeWebsiteStyling() {
        try {
            const isDarkMode = detectDarkMode();
            const logos = await extractLogosAndIcons();
            const colorScheme = extractColorScheme();
            
            let primaryColor = colorScheme.accentColors.length > 0 ? 
                rgbToHex(colorScheme.accentColors[0]) : '#6366f1';

            const backgroundColor = colorScheme.backgrounds.length > 0 ? 
                rgbToHex(colorScheme.backgrounds.find(bg => 
                    !bg.includes('rgba(0, 0, 0, 0)') && bg !== 'transparent'
                )) : (isDarkMode ? '#1f2937' : '#ffffff');
            
            const textColor = colorScheme.textColors.length > 0 ? 
                rgbToHex(colorScheme.textColors[0]) : (isDarkMode ? '#f9fafb' : '#374151');
            
                websiteStyling = {
                primaryColor: primaryColor || (isDarkMode ? '#60a5fa' : '#6366f1'),
                secondaryColor: isDarkMode ? '#a78bfa' : '#8b5cf6',
                backgroundColor: backgroundColor || (isDarkMode ? '#1f2937' : '#ffffff'),
                textColor: textColor || (isDarkMode ? '#f9fafb' : '#374151'),
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                borderRadius: '16px',
                logoUrl: logos.logo,
                faviconUrl: logos.favicon,
                brandColors: [primaryColor].filter(Boolean),
                isDarkMode: isDarkMode
            };
            
            return websiteStyling;
            } catch (error) {
            console.error('[GistWidget] Failed to analyze website styling:', error);
            return websiteStyling;
        }
    }
    
    // ================================
    // DYNAMIC STYLES GENERATION
    // ================================
    
    function generateDynamicStyles(styling) {
        const isDark = styling.isDarkMode;
        
        return `
            :host {
                all: initial;
                font-family: ${styling.fontFamily};
                --primary-color: ${styling.primaryColor};
                --secondary-color: ${styling.secondaryColor};
                --background-color: ${styling.backgroundColor};
                --text-color: ${styling.textColor};
                --border-color: ${isDark ? '#374151' : '#e5e7eb'};
                --shadow: ${isDark ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 4px 20px rgba(0, 0, 0, 0.1)'};
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
                transition: opacity 250ms ease, transform 250ms ease;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 12px;
                font-family: ${styling.fontFamily};
                }
                
                .gist-widget.loaded {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                    pointer-events: auto;
                }
                
                .gist-widget.minimized {
                    gap: 0;
                }
                
            .gist-widget.minimized .gist-chat-container {
                    opacity: 0;
                transform: translateY(10px) scale(0.95);
                    pointer-events: none;
                    max-height: 0;
                    overflow: hidden;
                transition: all 0.4s ease;
            }
            
            .gist-pill {
                background: ${isDark ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)'};
                border: 2px solid transparent;
                border-radius: 28px;
                background-image: 
                    linear-gradient(${isDark ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)'}, ${isDark ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)'}),
                    linear-gradient(90deg, #f59e0b 0%, #ec4899 50%, #8b5cf6 100%);
                background-origin: border-box;
                background-clip: padding-box, border-box;
                padding: 12px 20px;
                display: flex;
                align-items: center;
                gap: 12px;
                box-shadow: var(--shadow);
                backdrop-filter: blur(10px);
                cursor: pointer;
                transition: all 0.3s ease, box-shadow 0.3s ease;
                order: 2;
                min-width: 300px;
                max-width: 400px;
            }
            
            .gist-pill:hover {
                transform: translateY(-2px);
                box-shadow: ${isDark ? '0 8px 30px rgba(0, 0, 0, 0.4)' : '0 8px 30px rgba(0, 0, 0, 0.15)'};
                }
                
                .gist-pill-logo {
        width: 20px;
        height: 20px;
                    border-radius: 4px;
                    object-fit: contain;
                    flex-shrink: 0;
            }
            
            .gist-pill-input {
                    flex: 1;
                border: none;
                background: transparent;
                font-size: 14px;
                color: var(--text-color);
                    outline: none;
                    font-family: inherit;
                    min-width: 0;
            }
            
            .gist-pill-input::placeholder {
                color: ${isDark ? '#9ca3af' : '#6b7280'};
            }
            
            .gist-pill-submit {
                width: 28px;
                height: 28px;
                background: #8b5cf6;
                border: none;
                border-radius: 50%;
                color: white;
        font-size: 14px;
                cursor: pointer;
                transition: all 0.2s ease;
        display: flex;
        align-items: center;
                justify-content: center;
            }
            
            .gist-pill-submit:hover {
                transform: scale(1.05);
                filter: brightness(1.1);
            }
            
            .gist-chat-container {
                    width: 400px;
                max-width: 90vw;
                max-height: 500px;
                background: var(--background-color);
                border: 2px solid transparent;
                border-radius: 24px;
                background-image: 
                    linear-gradient(var(--background-color), var(--background-color)),
                    linear-gradient(90deg, #f59e0b 0%, #ec4899 50%, #8b5cf6 100%);
                background-origin: border-box;
                background-clip: padding-box, border-box;
                box-shadow: var(--shadow);
                backdrop-filter: blur(10px);
                    opacity: 0;
                    transform: translateY(20px) scale(0.95);
                transition: all 0.4s ease;
                    pointer-events: none;
                    order: 1;
                    display: flex;
                    flex-direction: column;
                overflow: hidden;
            }
                
            .gist-chat-container.visible {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                    pointer-events: auto;
                }
                
            .gist-chat-header {
                padding: 16px 20px 12px;
                border-bottom: 1px solid var(--border-color);
                    display: flex;
                    justify-content: space-between;
                align-items: center;
                    position: relative;
                background: ${isDark ? 'rgba(31, 41, 55, 0.5)' : 'rgba(248, 250, 252, 0.5)'};
            }
            
            .gist-chat-title {
                    font-size: 16px;
                    font-weight: 600;
                color: var(--text-color);
                    margin: 0;
                }
                
            .gist-messages-container {
                    flex: 1;
                    overflow-y: auto;
                padding: 16px;
                    display: flex;
                flex-direction: column;
                gap: 16px;
                max-height: 380px;
            }

            .gist-messages-container::-webkit-scrollbar {
                width: 6px;
            }
            
            .gist-messages-container::-webkit-scrollbar-track {
                background: ${isDark ? '#374151' : '#f1f5f9'};
                border-radius: 3px;
            }
            
            .gist-messages-container::-webkit-scrollbar-thumb {
                background: ${isDark ? '#6b7280' : '#cbd5e1'};
                border-radius: 3px;
            }

            /* Ensure smooth scrolling */
            .gist-messages-container {
                scroll-behavior: smooth;
            }

            .gist-answer-separator {
                height: 1px;
                background: var(--border-color);
                margin: 32px 0;
                opacity: 0.3;
            }

            .gist-qa-session {
                margin-bottom: 24px;
            }

            /* Loading states */
            .gist-loading-phase {
                    padding: 40px 20px;
                    display: flex;
                flex-direction: column;
                    align-items: center;
                    justify-content: center;
                min-height: 200px;
                }
                
            .gist-loading-header {
                    display: flex;
                    align-items: center;
                gap: 12px;
                margin-bottom: 24px;
                    font-size: 16px;
                color: ${isDark ? '#d1d5db' : '#374151'};
            }

            .gist-loading-spinner-orange {
                width: 20px;
                height: 20px;
                border: 3px solid ${isDark ? '#374151' : '#e5e7eb'};
                border-top: 3px solid #f59e0b;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
            }

            .gist-skeleton-container {
                width: 100%;
                    display: flex;
                    flex-direction: column;
                gap: 12px;
            }

            .gist-skeleton-box {
                height: 20px;
                background: ${isDark ? '#374151' : '#e5e7eb'};
                border-radius: 4px;
                    position: relative;
                    overflow: hidden;
                }
                
            .gist-skeleton-box::after {
                content: '';
                    position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(
                    90deg,
                    transparent,
                    ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.6)'},
                    transparent
                );
                animation: shimmer 2s infinite;
            }

            @keyframes shimmer {
                0% { left: -100%; }
                100% { left: 100%; }
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            /* Full answer page layout */
            .gist-answer-page {
                padding: 20px;
                display: flex;
                flex-direction: column;
                gap: 20px;
                    animation: fadeInUp 0.6s ease-out forwards;
                }
                
            .gist-answer-title {
                font-size: 20px;
                font-weight: 700;
                color: var(--text-color);
                margin: 0;
                text-transform: capitalize;
            }

            .gist-sources-bar {
                    display: flex;
                flex-direction: column;
                gap: 12px;
                }
                
                .gist-attribution-bar {
                height: 8px;
                background: ${isDark ? '#374151' : '#f3f4f6'};
                border-radius: 4px;
                    overflow: hidden;
                    display: flex;
                box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
                }
                
                .gist-attribution-segment {
                    height: 100%;
                    cursor: pointer;
                    transition: opacity 0.2s ease;
                position: relative;
                }
                
                .gist-attribution-segment:hover {
                    opacity: 0.8;
                }
                
            .gist-sources-list {
                    display: flex;
                align-items: center;
                gap: 16px;
                    font-size: 14px;
                font-weight: 500;
                    flex-wrap: wrap;
                }
                
            .gist-source-item {
                    display: flex;
                    align-items: center;
                gap: 8px;
                color: ${isDark ? '#d1d5db' : '#4b5563'};
            }

            .gist-source-color {
                width: 12px;
                height: 12px;
                border-radius: 2px;
                    flex-shrink: 0;
                }
                
            .gist-answer-content {
                font-size: 15px;
                line-height: 1.7;
                color: var(--text-color);
                white-space: pre-wrap;
            }

            .gist-answer-content h1,
            .gist-answer-content h2,
            .gist-answer-content h3 {
                margin-top: 20px;
                margin-bottom: 12px;
                    font-weight: 600;
            }

            .gist-answer-content h1 { font-size: 24px; }
            .gist-answer-content h2 { font-size: 20px; }
            .gist-answer-content h3 { font-size: 18px; }

            .gist-answer-content p {
                margin-bottom: 16px;
            }

            .gist-answer-content ul,
            .gist-answer-content ol {
                margin-bottom: 16px;
                padding-left: 24px;
            }

            .gist-answer-content li {
                margin-bottom: 8px;
            }

            .gist-user-message {
                    display: flex;
                justify-content: flex-end;
                margin-bottom: 12px;
                animation: slideInRight 0.3s ease-out;
            }

            .gist-ai-message {
                    display: flex;
                justify-content: flex-start;
                align-items: flex-start;
                gap: 12px;
                margin-bottom: 16px;
                animation: slideInLeft 0.3s ease-out;
            }

            .gist-user-message-bubble {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 12px 16px;
                border-radius: 18px 18px 4px 18px;
                max-width: 80%;
                    font-size: 14px;
                line-height: 1.4;
                    word-wrap: break-word;
                box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
            }

            .gist-ai-avatar {
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                flex-shrink: 0;
                margin-top: 4px;
            }

            .gist-avatar-img {
        width: 20px;
        height: 20px;
                    object-fit: contain;
                }
                
            .gist-message-content {
                    flex: 1;
                max-width: calc(100% - 44px);
            }

            .gist-message-text {
                background: ${isDark ? '#374151' : '#f8fafc'};
                color: var(--text-color);
                padding: 12px 16px;
                border-radius: 4px 18px 18px 18px;
                    font-size: 14px;
                line-height: 1.5;
                margin-bottom: 8px;
                border: 1px solid var(--border-color);
            }

            .gist-typing-indicator {
        display: flex;
        align-items: center;
                gap: 12px;
                margin-bottom: 16px;
                animation: slideInLeft 0.3s ease-out;
            }

            .gist-typing-dots {
                background: ${isDark ? '#374151' : '#f8fafc'};
                border: 1px solid var(--border-color);
                padding: 12px 16px;
                border-radius: 4px 18px 18px 18px;
        display: flex;
        align-items: center;
                gap: 4px;
            }

            .gist-typing-dot {
                width: 6px;
                height: 6px;
                background: ${isDark ? '#9ca3af' : '#6b7280'};
                border-radius: 50%;
                animation: typingDots 1.4s infinite ease-in-out;
            }

            .gist-typing-dot:nth-child(1) { animation-delay: -0.32s; }
            .gist-typing-dot:nth-child(2) { animation-delay: -0.16s; }
            .gist-typing-dot:nth-child(3) { animation-delay: 0s; }

            @keyframes typingDots {
                0%, 80%, 100% { 
                    transform: scale(0.8);
                    opacity: 0.5;
                }
                40% { 
                    transform: scale(1);
                    opacity: 1;
                }
            }

            @keyframes slideInRight {
                from {
                    opacity: 0;
                    transform: translateX(20px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }

            @keyframes slideInLeft {
                from {
                    opacity: 0;
                    transform: translateX(-20px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }

            @keyframes fadeInUp {
                from {
        opacity: 0;
                    transform: translateY(10px);
      }
                to {
        opacity: 1;
                    transform: translateY(0);
                }
            }

            .gist-message-timestamp {
                font-size: 11px;
                color: ${isDark ? '#9ca3af' : '#6b7280'};
                margin-top: 4px;
                text-align: right;
            }

            .gist-suggested-questions {
                margin-top: 20px;
                padding-top: 20px;
                border-top: 1px solid var(--border-color);
                opacity: 0;
                transform: translateY(10px);
                animation: fadeInUp 0.6s ease-out 0.5s forwards;
            }
            
            .gist-suggested-questions-title {
                    font-size: 14px;
                    font-weight: 600;
                color: var(--text-color);
                    margin-bottom: 12px;
                }
                
                .gist-suggested-question {
                    display: flex;
                    align-items: flex-start;
                padding: 12px;
                background: ${isDark ? '#374151' : '#f8fafc'};
                border: 1px solid var(--border-color);
                    border-radius: 8px;
                margin-bottom: 8px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    text-align: left;
                    width: 100%;
                font-family: inherit;
                }
                
                .gist-suggested-question:hover {
                background: ${isDark ? '#4b5563' : '#f1f5f9'};
                    transform: translateY(-1px);
                }
                
                .gist-suggested-question-icon {
                width: 20px;
                height: 20px;
                background: var(--primary-color);
                    color: white;
                    border-radius: 50%;
                    font-size: 12px;
                    font-weight: 600;
                margin-right: 10px;
                    flex-shrink: 0;
                    display: flex;
                align-items: center;
                    justify-content: center;
                }
                
                .gist-suggested-question-text {
                    flex: 1;
                    font-size: 13px;
                    font-weight: 500;
                color: var(--text-color);
                    line-height: 1.4;
                }
                
            .gist-error {
                color: ${isDark ? '#fca5a5' : '#dc2626'};
                background: ${isDark ? 'rgba(220, 38, 38, 0.1)' : '#fef2f2'};
                border: 1px solid ${isDark ? 'rgba(220, 38, 38, 0.2)' : '#fecaca'};
                    border-radius: 8px;
                padding: 16px;
                    font-size: 14px;
                margin: 20px 0;
            }
            
            .gist-chat-footer {
                padding: 12px 20px;
                border-top: 1px solid var(--border-color);
                    display: flex;
                    justify-content: space-between;
                align-items: center;
                font-size: 11px;
                color: ${isDark ? '#9ca3af' : '#6b7280'};
                background: ${isDark ? 'rgba(31, 41, 55, 0.5)' : 'rgba(248, 250, 252, 0.5)'};
            }
            
            .gist-powered-section {
                    display: flex;
                    align-items: center;
                    gap: 6px;
            }
            
            .gist-footer-logo {
                width: 12px;
                height: 12px;
                opacity: 0.8;
            }
            
            .gist-add-to-site {
                color: var(--primary-color);
                text-decoration: none;
                transition: opacity 0.2s ease;
            }
            
            .gist-add-to-site:hover {
                opacity: 0.8;
                text-decoration: underline;
            }
            
            .gist-close-btn {
                    width: 24px;
                    height: 24px;
                border-radius: 50%;
                background: ${isDark ? 'rgba(107, 114, 128, 0.2)' : 'rgba(107, 114, 128, 0.1)'};
        border: none;
                color: ${isDark ? '#d1d5db' : '#6b7280'};
                font-size: 16px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                transition: all 0.2s ease;
            }
            
            .gist-close-btn:hover {
                background: ${isDark ? 'rgba(107, 114, 128, 0.3)' : 'rgba(107, 114, 128, 0.2)'};
                transform: scale(1.1);
            }
            
            .gist-pill.in-hover-radius {
                box-shadow: 
                    0 0 20px rgba(245, 158, 11, 0.3),
                    0 0 40px rgba(139, 92, 246, 0.2),
                    var(--shadow);
            }
            
            .gist-engagement-footer {
                margin-top: 32px;
                padding-top: 20px;
                border-top: 1px solid var(--border-color);
                    display: flex;
                    align-items: center;
                justify-content: flex-start;
            }

            .gist-engagement-buttons {
                    display: flex;
                    align-items: center;
                gap: 16px;
            }

            .gist-engagement-btn {
                background: transparent;
                    border: none;
                color: ${isDark ? '#9ca3af' : '#6b7280'};
                    cursor: pointer;
                padding: 8px;
                border-radius: 8px;
                    display: flex;
                    align-items: center;
                gap: 6px;
                    font-size: 14px;
                font-family: inherit;
                transition: all 0.2s ease;
            }

            .gist-engagement-btn:hover {
                color: var(--text-color);
                background: ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'};
            }

            .gist-engagement-btn svg {
                    width: 20px;
                    height: 20px;
            }

            .gist-share-btn {
                border: 1px solid var(--border-color);
                border-radius: 20px;
                padding: 6px 16px;
            }

            .gist-share-btn:hover {
                background: ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
            }

            .gist-share-btn svg {
                width: 16px;
                height: 16px;
            }

            /* Active states */
            .gist-like-btn.active {
                color: #10b981;
            }

            .gist-dislike-btn.active {
                color: #ef4444;
            }

            /* Follow-up questions */
            .gist-follow-up-questions {
                margin-top: 24px;
                padding-top: 20px;
                border-top: 1px solid var(--border-color);
                    opacity: 0;
                    transform: translateY(10px);
                transition: all 0.4s ease;
            }

            .gist-follow-up-title {
                font-size: 14px;
                    font-weight: 600;
                color: var(--text-color);
                margin-bottom: 12px;
            }

            .gist-follow-up-loading {
                font-size: 13px;
                color: ${isDark ? '#9ca3af' : '#6b7280'};
                    font-style: italic;
                padding: 12px;
                text-align: center;
            }

            .gist-follow-up-list {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                
            .gist-follow-up-question {
                    display: flex;
                    align-items: center;
                gap: 12px;
                    padding: 12px 16px;
                background: ${isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)'};
                border: 1px solid var(--border-color);
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    text-align: left;
                width: 100%;
                font-family: inherit;
                font-size: 13px;
                animation: slideInUp 0.3s ease-out;
            }

            @keyframes slideInUp {
                0% {
        opacity: 0;
                    transform: translateY(15px);
      }
                100% {
        opacity: 1;
                    transform: translateY(0);
                }
                }
                
                .gist-follow-up-question:hover {
                background: ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'};
                border-color: var(--primary-color);
                    transform: translateY(-1px);
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                }
                
                .gist-follow-up-question:active {
                    transform: translateY(0);
            }

            .gist-follow-up-icon {
                width: 20px;
                height: 20px;
                background: var(--primary-color);
                    color: white;
                border-radius: 50%;
                font-size: 11px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
            }

            .gist-follow-up-text {
                    flex: 1;
                font-weight: 500;
                color: var(--text-color);
                    line-height: 1.4;
                }
                
            /* Stagger animation for follow-up questions */
            .gist-follow-up-question:nth-child(1) {
                animation-delay: 0.1s;
            }

            .gist-follow-up-question:nth-child(2) {
                animation-delay: 0.2s;
            }

            .gist-follow-up-question:nth-child(3) {
                animation-delay: 0.3s;
            }
            
            /* Remix functionality styles */
            .gist-remix-btn {
                background: linear-gradient(135deg, #8b5cf6 0%, #667eea 100%);
                color: white !important;
                border: none;
                border-radius: 20px;
                padding: 6px 16px;
                transition: all 0.2s ease;
            }

            .gist-remix-btn:hover {
                background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%);
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
            }

            .gist-remix-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(0, 0, 0, 0.7);
                z-index: 10001;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: opacity 0.3s ease;
                backdrop-filter: blur(4px);
            }

            .gist-remix-modal.visible {
                opacity: 1;
            }

            .gist-remix-content {
                background: ${isDark ? '#1f2937' : '#ffffff'};
                border-radius: 16px;
                padding: 24px;
                max-width: 500px;
                width: 90vw;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                transform: scale(0.9) translateY(20px);
                transition: transform 0.3s ease;
            }

            .gist-remix-modal.visible .gist-remix-content {
                transform: scale(1) translateY(0);
            }

            .gist-remix-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 24px;
                padding-bottom: 16px;
                border-bottom: 1px solid var(--border-color);
            }

            .gist-remix-title {
                font-size: 20px;
                font-weight: 700;
                color: var(--text-color);
                margin: 0;
            }

            .gist-remix-close {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background: ${isDark ? 'rgba(107, 114, 128, 0.2)' : 'rgba(107, 114, 128, 0.1)'};
                border: none;
                color: ${isDark ? '#d1d5db' : '#6b7280'};
                font-size: 18px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
            }

            .gist-remix-close:hover {
                background: ${isDark ? 'rgba(107, 114, 128, 0.3)' : 'rgba(107, 114, 128, 0.2)'};
                transform: scale(1.1);
            }

            .gist-remix-tabs {
                display: flex;
                gap: 8px;
                margin-bottom: 24px;
                background: ${isDark ? 'rgba(55, 65, 81, 0.5)' : 'rgba(243, 244, 246, 0.8)'};
                border-radius: 12px;
                padding: 4px;
            }

            .gist-remix-tab {
                flex: 1;
                padding: 12px 16px;
                background: transparent;
                border: none;
                border-radius: 8px;
                color: ${isDark ? '#9ca3af' : '#6b7280'};
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
                font-family: inherit;
            }

            .gist-remix-tab.active {
                background: linear-gradient(135deg, #8b5cf6 0%, #667eea 100%);
                color: white;
                box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3);
            }

            .gist-remix-tab:hover:not(.active) {
                background: ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
                color: var(--text-color);
            }

            .gist-remix-options {
                display: flex;
                flex-direction: column;
                gap: 16px;
                margin-bottom: 24px;
            }

            .gist-remix-option-group {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .gist-remix-option-label {
                font-size: 14px;
                font-weight: 600;
                color: var(--text-color);
            }

            .gist-remix-select {
                padding: 12px 16px;
                border: 1px solid var(--border-color);
                border-radius: 8px;
                background: var(--background-color);
                color: var(--text-color);
                font-size: 14px;
                font-family: inherit;
                cursor: pointer;
                transition: border-color 0.2s ease;
            }

            .gist-remix-select:focus {
                outline: none;
                border-color: #8b5cf6;
                box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
            }

            .gist-remix-create {
                width: 100%;
                padding: 16px 24px;
                background: linear-gradient(135deg, #8b5cf6 0%, #667eea 100%);
                color: white;
                border: none;
                border-radius: 12px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                font-family: inherit;
            }

            .gist-remix-create:hover {
                background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%);
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(139, 92, 246, 0.4);
            }

            .gist-remix-create:active {
                transform: translateY(0);
            }
            
            /* Engagement footer fade-in animation */
            .gist-engagement-footer.hidden {
                opacity: 0;
                visibility: hidden;
            }
            
            .gist-engagement-footer.fade-in {
                animation: fadeIn 0.5s ease-in forwards;
            }
            
            @keyframes fadeIn {
                from {
                    opacity: 0;
                    transform: translateY(10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
    }

    // ================================
    // WIDGET CREATION
    // ================================
    
    // Prevent multiple instances
    if (window.__gistWidgetLoaded) {
        return;
    }
    window.__gistWidgetLoaded = true;

    async function createWidget() {
        const widgetContainer = document.createElement('div');
        widgetContainer.id = 'gist-widget-container';
        
        const shadowRoot = widgetContainer.attachShadow({ mode: 'closed' });
        
        // Analyze website styling
        const extractedStyling = await analyzeWebsiteStyling();
        const dynamicStyles = generateDynamicStyles(extractedStyling);
        
        const widgetHTML = `
            <style>${dynamicStyles}</style>
            <div class="gist-widget" id="gist-widget">
                <div class="gist-chat-container" id="gist-chat-container">
                    <div class="gist-chat-header">
                        <h3 class="gist-chat-title">Chat with Ask Anything™</h3>
                        <button class="gist-close-btn" id="gist-close-btn">×</button>
                    </div>
                    <div class="gist-messages-container" id="gist-messages-container">
                        <div class="gist-welcome-message">
                            <div class="gist-ai-message">
                                <div class="gist-ai-avatar">
                                    <img src="${BACKEND_BASE_URL}/Gist G white no background.png" alt="AI" class="gist-avatar-img">
                </div>
                                <div class="gist-message-content">
                                    <div class="gist-message-text">Hello! I'm here to help you understand this content. What would you like to know?</div>
                                    <div class="gist-suggested-questions" id="gist-welcome-questions">
                                        <div class="gist-suggested-questions-title">Try asking:</div>
                                        <button class="gist-suggested-question" data-question="What is this article about?">
                                            <span class="gist-suggested-question-text">What is this article about?</span>
                                        </button>
                                        <button class="gist-suggested-question" data-question="Can you summarize the main points?">
                                            <span class="gist-suggested-question-text">Can you summarize the main points?</span>
                                        </button>
                                        <button class="gist-suggested-question" data-question="What are the key takeaways?">
                                            <span class="gist-suggested-question-text">What are the key takeaways?</span>
                                        </button>
                    </div>
                </div>
                </div>
                        </div>
                    </div>
                    <div class="gist-chat-footer">
                        <div class="gist-powered-section">
                            <img src="${BACKEND_BASE_URL}/gist-logo.png" alt="Gist Logo" class="gist-footer-logo">
                            <span>Powered by Gist Answers</span>
                        </div>
                        <a href="https://gpademo.vercel.app" target="_blank" class="gist-add-to-site">Add to your site</a>
                    </div>
                </div>
                
                <div class="gist-pill" id="gist-pill">
                    ${extractedStyling.logoUrl ? 
                        `<img src="${extractedStyling.logoUrl}" class="gist-pill-logo" alt="Logo">` :
                        `<img src="${BACKEND_BASE_URL}/gist-logo.png" class="gist-pill-logo" alt="Gist Logo">`
                    }
                    <input type="text" class="gist-pill-input" placeholder="Ask anything..." id="gist-input">
                    <button class="gist-pill-submit" id="gist-submit">↗</button>
                </div>
            </div>
        `;
        
        shadowRoot.innerHTML = widgetHTML;
        document.body.appendChild(widgetContainer);
        
        // Get elements
        const widget = shadowRoot.getElementById('gist-widget');
        const pill = shadowRoot.getElementById('gist-pill');
        const input = shadowRoot.getElementById('gist-input');
        const submitBtn = shadowRoot.getElementById('gist-submit');
        const closeBtn = shadowRoot.getElementById('gist-close-btn');
        const chatContainer = shadowRoot.getElementById('gist-chat-container');
        const messagesContainer = shadowRoot.getElementById('gist-messages-container');
        
        // State
        let isMinimized = true;
        let conversationHistory = [];
        let pageContext = null;
        let submitTimeout = null;
        let messageHistory = [];
        let hasUserSentMessage = false;
        
        // ================================
        // FUNCTIONALITY
        // ================================
        
        // Extract page context
        function extractPageContext() {
            if (pageContext) return pageContext;
            
            let content = '';
            const selectors = ['article', '.article', 'main', '.content', '[role="main"]'];
            
            let contentElement = null;
            for (const selector of selectors) {
                contentElement = document.querySelector(selector);
                if (contentElement) break;
            }
            
            if (!contentElement) {
                contentElement = document.body;
            }
            
            if (contentElement) {
                const clone = contentElement.cloneNode(true);
                const elementsToRemove = clone.querySelectorAll('script, style, nav, header, footer, aside, .widget, #gist-widget-container');
                elementsToRemove.forEach(el => el.remove());
                
                content = clone.textContent || clone.innerText || '';
                content = content.replace(/\s+/g, ' ').trim();
                
                if (content.length > 3000) {
                    content = content.substring(0, 3000) + '...';
                }
            }
            
            pageContext = {
                title: document.title || '',
                content: content,
                url: window.location.href
            };
            
            return pageContext;
        }
        
        // Initialize conversation
        function initializeConversation() {
            if (conversationHistory.length === 0) {
            const context = extractPageContext();
                if (context.content) {
                    conversationHistory.push({
                        role: 'system',
                        content: `You are a helpful AI assistant with access to the current webpage content. Use this context to provide relevant answers.

Page Title: ${context.title}
Page Content: ${context.content}

Instructions:
- Reference page content when relevant
- Answer general questions beyond page content
- Keep responses concise but informative
- Be helpful and accurate`
                    });
                }
            }
        }
        
        // API call
        async function createChatCompletion(userPrompt) {
            initializeConversation();
            
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
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestBody),
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error || `HTTP ${response.status}`);
                }
                
                const data = await response.json();
                let assistantMessage = data.response || data.choices?.[0]?.message?.content;
                
                if (!assistantMessage) {
                    throw new Error('Invalid response format');
                }
                
                conversationHistory.push({ role: 'assistant', content: assistantMessage });
                
                // Keep conversation manageable
                if (conversationHistory.length > 21) {
                    const systemMessage = conversationHistory[0];
                    const recentMessages = conversationHistory.slice(-20);
                    conversationHistory = [systemMessage, ...recentMessages];
                }
                
                return { answer: assistantMessage, usage: data.usage };
            } catch (error) {
                clearTimeout(timeoutId);
                if (error.name === 'AbortError') {
                    throw new Error('Request timed out. Please try again.');
                }
                throw error;
            }
        }
        
        // Generate mock attributions
        function generateMockAttributions() {
            const sources = [
                { name: 'Wikipedia', icon: 'W', color: '#3b82f6' },
                { name: 'Nature Journal', icon: 'N', color: '#ec4899' },
                { name: 'Stanford Research', icon: 'S', color: '#f59e0b' },
                { name: 'MIT OpenCourseWare', icon: 'M', color: '#10b981' }
            ];
            
            const numSources = Math.floor(Math.random() * 2) + 2; // 2-3 sources
            const selectedSources = sources.slice(0, numSources);
            
            const rawPercentages = selectedSources.map(() => Math.random());
            const sum = rawPercentages.reduce((a, b) => a + b, 0);
            
            return selectedSources.map((source, index) => ({
                ...source,
                percentage: rawPercentages[index] / sum,
                title: 'Research findings and analysis',
                description: 'Scientific analysis and peer-reviewed research on the topic...',
                date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
                url: `https://${source.name.toLowerCase().replace(' ', '')}.com`
            })).sort((a, b) => b.percentage - a.percentage);
        }
        
        // Generate suggested questions
        async function generateSuggestedQuestions() {
            const context = extractPageContext();
            
            if (!context.content || context.content.length < 50) {
                return [
                    "What are the main themes of this page?",
                    "Can you explain the key concepts?",
                    "What should I know about this topic?"
                ];
            }
            
            // Extract key entities and topics from content for more specific questions
            const contentAnalysis = analyzePageContent(context);
            
            const prompt = `You are analyzing this specific webpage to generate relevant questions that visitors might ask.

PAGE TITLE: "${context.title}"

KEY CONTENT ANALYSIS:
- Main topics: ${contentAnalysis.topics.join(', ')}
- Key entities: ${contentAnalysis.entities.join(', ')}
- Content type: ${contentAnalysis.type}

FULL CONTENT EXCERPT:
${context.content.substring(0, 2000)}...

Based on this SPECIFIC page content, generate exactly 3 questions that a visitor would naturally ask about THIS particular topic/article/page.

Requirements:
- Questions must be directly related to the specific content above
- Use actual names, concepts, or topics mentioned in the content
- Each question must end with a question mark (?)
- Keep questions 6-20 words long
- Focus on "What", "How", "Why", "When", "Where", or "Who" questions
- Make them actionable and specific to this content
- Do NOT use generic questions

Examples of GOOD specific questions:
- "How does React's virtual DOM improve performance?"
- "What are the benefits of using TypeScript over JavaScript?"
- "Why did Tesla choose lithium-ion batteries for their vehicles?"

Examples of BAD generic questions:
- "What are the main points?"
- "How does this work?"
- "Why is this important?"

Return exactly 3 questions, one per line, no numbering:`;
            
            try {
                const response = await createChatCompletion(prompt);
                const lines = response.answer.split('\n');
                const questions = [];
                
                for (const line of lines) {
                    const cleaned = line.trim()
                        .replace(/^\d+[.)]\s*/, '') // Remove numbers
                        .replace(/^[-•*]\s*/, '')    // Remove bullets
                        .replace(/^Question\s*\d*:?\s*/i, '') // Remove "Question 1:" etc
                        .replace(/^Q\d*:?\s*/i, '') // Remove "Q1:" etc
                        .trim();
                    
                    // Only include lines that are questions (end with ?) and aren't too long
                    if (cleaned.endsWith('?') && cleaned.length > 15 && cleaned.length < 150) {
                        questions.push(cleaned);
                    }
                }
                
                // Return first 3 valid questions or create context-specific fallbacks
                const validQuestions = questions.slice(0, 3);
                if (validQuestions.length >= 3) {
                    return validQuestions;
                }
                
                // Create context-specific fallbacks based on content analysis
                const contextFallbacks = createContextSpecificFallbacks(context, contentAnalysis);
                
                while (validQuestions.length < 3 && contextFallbacks.length > 0) {
                    validQuestions.push(contextFallbacks.shift());
                }
                
                // Final generic fallbacks if needed
                const genericFallbacks = [
                    "What are the main findings discussed here?",
                    "How does this relate to current trends?",
                    "What should I know about this topic?"
                ];
                
                while (validQuestions.length < 3) {
                    validQuestions.push(genericFallbacks[validQuestions.length]);
                }
                
                return validQuestions;
                    
                } catch (error) {
                // Return context-aware fallbacks even on error
                const contextFallbacks = createContextSpecificFallbacks(context, analyzePageContent(context));
                return contextFallbacks.length >= 3 ? contextFallbacks.slice(0, 3) : [
                    "What is this article about?",
                    "Can you summarize the main points?",
                    "What are the key takeaways?"
                ];
            }
        }
        
        // Analyze page content to extract key topics and entities
        function analyzePageContent(context) {
            const content = context.content.toLowerCase();
            const title = context.title.toLowerCase();
            
            // Detect content type
            let type = 'article';
            if (title.includes('tutorial') || content.includes('step') || content.includes('how to')) {
                type = 'tutorial';
            } else if (title.includes('review') || content.includes('pros') || content.includes('cons')) {
                type = 'review';
            } else if (title.includes('news') || content.includes('announced') || content.includes('released')) {
                type = 'news';
            } else if (content.includes('research') || content.includes('study') || content.includes('findings')) {
                type = 'research';
            }
            
            // Extract key topics and technologies
            const topics = [];
            const entities = [];
            
            // Technology keywords
            const techKeywords = ['javascript', 'python', 'react', 'vue', 'angular', 'node', 'typescript', 'ai', 'machine learning', 'blockchain', 'cryptocurrency', 'api', 'database', 'cloud', 'aws', 'docker', 'kubernetes'];
            const businessKeywords = ['startup', 'funding', 'ipo', 'merger', 'acquisition', 'revenue', 'profit', 'investment', 'market', 'competition'];
            const scienceKeywords = ['research', 'study', 'experiment', 'discovery', 'breakthrough', 'innovation', 'technology', 'development'];
            
            // Find mentioned technologies
            techKeywords.forEach(keyword => {
                if (content.includes(keyword)) {
                    topics.push(keyword);
                }
            });
            
            businessKeywords.forEach(keyword => {
                if (content.includes(keyword)) {
                    topics.push(keyword);
                }
            });
            
            scienceKeywords.forEach(keyword => {
                if (content.includes(keyword)) {
                    topics.push(keyword);
                }
            });
            
            // Extract company/product names (capitalized words)
            const words = context.content.split(/\s+/);
            const capitalizedWords = words.filter(word => 
                word.length > 2 && 
                word[0] === word[0].toUpperCase() && 
                !word.includes('.') && 
                !['The', 'This', 'That', 'And', 'But', 'Or', 'In', 'On', 'At', 'To', 'For', 'With', 'By'].includes(word)
            );
            
            // Get unique capitalized words (likely entities)
            const uniqueEntities = [...new Set(capitalizedWords)].slice(0, 5);
            entities.push(...uniqueEntities);
            
            return {
                type,
                topics: [...new Set(topics)].slice(0, 5),
                entities: entities.slice(0, 5)
            };
        }
        
        // Create context-specific fallback questions
        function createContextSpecificFallbacks(context, analysis) {
            const fallbacks = [];
            const title = context.title;
            
            // Based on content type
            switch (analysis.type) {
                case 'tutorial':
                    fallbacks.push(`How do I implement the steps described in "${title}"?`);
                    fallbacks.push(`What are the prerequisites for this tutorial?`);
                    fallbacks.push(`What common mistakes should I avoid?`);
                    break;
                case 'review':
                    fallbacks.push(`What are the pros and cons discussed in this review?`);
                    fallbacks.push(`How does this compare to alternatives?`);
                    fallbacks.push(`Would you recommend this based on the review?`);
                    break;
                case 'news':
                    fallbacks.push(`What are the key developments mentioned in this news?`);
                    fallbacks.push(`How might this impact the industry?`);
                    fallbacks.push(`When did these events take place?`);
                    break;
                case 'research':
                    fallbacks.push(`What were the main findings of this research?`);
                    fallbacks.push(`What methodology was used in this study?`);
                    fallbacks.push(`What are the implications of these results?`);
                    break;
                default:
                    // Include entities/topics in questions
                    if (analysis.entities.length > 0) {
                        fallbacks.push(`What role does ${analysis.entities[0]} play in this context?`);
                    }
                    if (analysis.topics.length > 0) {
                        fallbacks.push(`How does ${analysis.topics[0]} relate to the main topic?`);
                    }
                    if (title.length > 0) {
                        fallbacks.push(`What are the key points about ${title.split(' ').slice(0, 3).join(' ')}?`);
                    }
            }
            
            return fallbacks.filter(q => q.length > 0);
        }
        
        // Add user message to chat
        function addUserMessage(message) {
            // Only track for conversation context, no visual display
            const timestamp = new Date();
            messageHistory.push({role: 'user', content: message, timestamp});
            conversationHistory.push({ role: 'user', content: message });
        }



        // Show loading phases
        function showSkeletonLoading() {
            // Create a container for this Q&A session
            const loadingContainer = document.createElement('div');
            loadingContainer.className = 'gist-qa-session';
            loadingContainer.id = 'current-loading-session';
            
            const loadingHTML = `
                <div class="gist-loading-phase">
                    <div class="gist-loading-header">
                        <div class="gist-loading-spinner-orange"></div>
                        <span>Generating answer</span>
                </div>
                    <div class="gist-skeleton-container">
                        <div class="gist-skeleton-box" style="width: 85%;"></div>
                        <div class="gist-skeleton-box" style="width: 70%;"></div>
                        <div class="gist-skeleton-box" style="width: 90%;"></div>
                        <div class="gist-skeleton-box" style="width: 60%;"></div>
                        <div class="gist-skeleton-box" style="width: 75%;"></div>
                </div>
                    </div>
            `;
            
            loadingContainer.innerHTML = loadingHTML;
            messagesContainer.appendChild(loadingContainer);
            
            // Scroll to loading
            setTimeout(() => {
                loadingContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }

        function showObtainingSources() {
            const currentSession = shadowRoot.getElementById('current-loading-session');
            if (currentSession) {
                currentSession.innerHTML = `
                    <div class="gist-loading-phase">
                        <div class="gist-loading-header">
                            <div class="gist-loading-spinner-orange"></div>
                            <span>Obtaining sources</span>
                    </div>
                </div>
            `;
            }
        }

        function showGeneratingAnswer() {
            const currentSession = shadowRoot.getElementById('current-loading-session');
            if (currentSession) {
                currentSession.innerHTML = `
                    <div class="gist-loading-phase">
                        <div class="gist-loading-header">
                            <div class="gist-loading-spinner-orange"></div>
                            <span>Generating answer</span>
                        </div>
                </div>
            `;
            }
        }



        // Display full answer with new layout
        function displayFullAnswer(question, answer, sources) {
            // Get the loading container and replace with answer
            const currentSession = shadowRoot.getElementById('current-loading-session');
            if (currentSession) {
                currentSession.removeAttribute('id');
                currentSession.innerHTML = ''; // Clear loading
                
                // Create the answer layout
                const answerLayout = document.createElement('div');
                answerLayout.className = 'gist-answer-page';
                
                // Add question as title
                const titleElement = document.createElement('h1');
                titleElement.className = 'gist-answer-title';
                titleElement.textContent = question.toLowerCase();
                answerLayout.appendChild(titleElement);
                
                // Add sources bar
                if (sources && sources.length > 0) {
                    const sourcesBarContainer = document.createElement('div');
                    sourcesBarContainer.className = 'gist-sources-bar';
                    
                    // Attribution bar
                    const attributionBar = document.createElement('div');
                    attributionBar.className = 'gist-attribution-bar';
                    
                    sources.forEach(source => {
                        const segment = document.createElement('div');
                        segment.className = 'gist-attribution-segment';
                        segment.style.width = `${source.percentage * 100}%`;
                        segment.style.backgroundColor = source.color;
                        segment.title = `${source.name}: ${(source.percentage * 100).toFixed(1)}%`;
                        attributionBar.appendChild(segment);
                    });
                    
                    sourcesBarContainer.appendChild(attributionBar);
                    
                    // Sources list
                    const sourcesList = document.createElement('div');
                    sourcesList.className = 'gist-sources-list';
                    
                    sources.forEach(source => {
                        const sourceItem = document.createElement('div');
                        sourceItem.className = 'gist-source-item';
                        sourceItem.innerHTML = `
                            <div class="gist-source-color" style="background-color: ${source.color};"></div>
                            <span>${(source.percentage * 100).toFixed(0)}% ${source.name}</span>
                        `;
                        sourcesList.appendChild(sourceItem);
                    });
                    
                    sourcesBarContainer.appendChild(sourcesList);
                    answerLayout.appendChild(sourcesBarContainer);
                }
                
                // Add content container for typewriter
                const contentElement = document.createElement('div');
                contentElement.className = 'gist-answer-content';
                const uniqueId = `typewriter-target-${Date.now()}`;
                contentElement.id = uniqueId;
                answerLayout.appendChild(contentElement);
                
                // Add engagement footer with buttons
                const engagementFooter = document.createElement('div');
                engagementFooter.className = 'gist-engagement-footer hidden';
                engagementFooter.innerHTML = `
                    <div class="gist-engagement-buttons">
                        <button class="gist-engagement-btn gist-like-btn" title="Like">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                            </svg>
                        </button>
                        <button class="gist-engagement-btn gist-dislike-btn" title="Dislike">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path>
                            </svg>
                        </button>
                        <button class="gist-engagement-btn gist-share-btn">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                                <polyline points="16 6 12 2 8 6"></polyline>
                                <line x1="12" y1="2" x2="12" y2="15"></line>
                            </svg>
                            <span>Share</span>
                        </button>
                        <button class="gist-engagement-btn gist-remix-btn">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M23 7l-7 5 7 5V7z"></path>
                                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                            </svg>
                            <span>Remix</span>
                        </button>
                    </div>
                `;
                answerLayout.appendChild(engagementFooter);
                
                // Add suggested questions section after engagement footer
                const suggestedQuestionsSection = document.createElement('div');
                suggestedQuestionsSection.className = 'gist-follow-up-questions hidden';
                suggestedQuestionsSection.innerHTML = `
                    <div class="gist-follow-up-title">Ask a follow-up question:</div>
                    <div class="gist-follow-up-loading">Generating relevant questions...</div>
                `;
                answerLayout.appendChild(suggestedQuestionsSection);
                
                // Build answer inside the same container
                currentSession.appendChild(answerLayout);
                
                // Start typewriter effect
                typewriterEffect(answer, uniqueId, () => {
                    const footer = currentSession.querySelector('.gist-engagement-footer');
                    if (footer) {
                        footer.classList.remove('hidden');
                        footer.classList.add('fade-in');
                    }
                });
                
                // Generate and add follow-up questions after typewriter completes
                setTimeout(async () => {
                    // Show the follow-up questions section
                    suggestedQuestionsSection.classList.remove('hidden');
                    suggestedQuestionsSection.classList.add('fade-in');
                    await addFollowUpQuestions(suggestedQuestionsSection, question, answer);
                }, answer.length * 5 + 500); // Wait for typewriter to finish + buffer
                
                // Add event listeners for engagement buttons
                setTimeout(() => {
                    const likeBtn = engagementFooter.querySelector('.gist-like-btn');
                    const dislikeBtn = engagementFooter.querySelector('.gist-dislike-btn');
                    const shareBtn = engagementFooter.querySelector('.gist-share-btn');
                    const remixBtn = engagementFooter.querySelector('.gist-remix-btn');
                    
                    likeBtn.addEventListener('click', () => {
                        likeBtn.classList.toggle('active');
                        if (likeBtn.classList.contains('active')) {
                            dislikeBtn.classList.remove('active');
                        }
                    });
                    
                    dislikeBtn.addEventListener('click', () => {
                        dislikeBtn.classList.toggle('active');
                        if (dislikeBtn.classList.contains('active')) {
                            likeBtn.classList.remove('active');
                        }
                    });
                    
                    shareBtn.addEventListener('click', async () => {
                        if (navigator.share) {
                            try {
                                await navigator.share({
                                    title: question,
                                    text: answer.substring(0, 200) + '...',
                url: window.location.href
                                });
                            } catch (err) {
                                console.log('Share cancelled');
                            }
                } else {
                            // Fallback: copy to clipboard
                            navigator.clipboard.writeText(window.location.href);
                            shareBtn.innerHTML = `
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M20 6L9 17l-5-5"></path>
                                </svg>
                                <span>Copied!</span>
                            `;
                setTimeout(() => {
                                shareBtn.innerHTML = `
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                                        <polyline points="16 6 12 2 8 6"></polyline>
                                        <line x1="12" y1="2" x2="12" y2="15"></line>
                                    </svg>
                                    <span>Share</span>
                                `;
                            }, 2000);
                        }
                    });
                    
                    remixBtn.addEventListener('click', () => {
                        createRemixModal(answer);
                    });
                }, 100);
            
                // Scroll to show the new answer
                    setTimeout(() => {
                    answerLayout.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            }
        }

        // Typewriter effect
        function typewriterEffect(text, targetId, onComplete) {
            const target = shadowRoot.getElementById(targetId);
            if (!target) return;
            
            let index = 0;
            const speed = 5; // milliseconds per character (~200 chars/second)
            
            function type() {
                if (index < text.length) {
                    target.textContent += text.charAt(index);
                    index++;
                    setTimeout(type, speed);
                } else if (index >= text.length && onComplete) {
                    onComplete();
                }
            }
            
            type();
        }

        // Add follow-up questions after an answer
        async function addFollowUpQuestions(container, previousQuestion, previousAnswer) {
            try {
                const context = extractPageContext();
                const followUpQuestions = await generateFollowUpQuestions(previousQuestion, previousAnswer, context);
                
                // Replace loading with actual questions
                container.innerHTML = `
                    <div class="gist-follow-up-title">Ask a follow-up question:</div>
                    <div class="gist-follow-up-list">
                        ${followUpQuestions.map((question, index) => `
                            <button class="gist-follow-up-question" data-question="${question}">
                                <span class="gist-follow-up-icon">${index + 1}</span>
                                <span class="gist-follow-up-text">${question}</span>
                            </button>
                        `).join('')}
                    </div>
                `;
                
                // Add click handlers for follow-up questions
                const questionButtons = container.querySelectorAll('.gist-follow-up-question');
                questionButtons.forEach(button => {
                    button.addEventListener('click', () => {
                        const question = button.dataset.question;
                        input.value = question;
                        submitQuery();
                    });
                });
            
                // Animate in the questions
            setTimeout(() => {
                    container.style.opacity = '1';
                    container.style.transform = 'translateY(0)';
                }, 100);
                
            } catch (error) {
                console.error('Failed to generate follow-up questions:', error);
                // Hide the section if generation fails
                container.style.display = 'none';
            }
        }

        // Generate follow-up questions based on previous Q&A
        async function generateFollowUpQuestions(previousQuestion, previousAnswer, context) {
            const prompt = `Based on this conversation and webpage content, generate exactly 3 relevant follow-up questions that a user might naturally ask next.

PREVIOUS QUESTION: "${previousQuestion}"

PREVIOUS ANSWER: "${previousAnswer.substring(0, 500)}..."

PAGE CONTEXT: "${context.title}"
CONTENT EXCERPT: "${context.content.substring(0, 1000)}..."

Generate 3 specific, actionable follow-up questions that:
1. Build naturally on the previous answer
2. Are relevant to the page content
3. Would provide additional valuable information
4. End with a question mark (?)
5. Are 6-20 words long

Examples of good follow-up questions:
- "How does this compare to other approaches?"
- "What are the potential challenges with this method?"
- "Can you explain the implementation details?"
- "What are the best practices for this?"

Return exactly 3 questions, one per line, no numbering:`;

            try {
                const response = await createChatCompletion(prompt);
                const lines = response.answer.split('\n');
                const questions = [];
                
                for (const line of lines) {
                    const cleaned = line.trim()
                        .replace(/^\d+[.)]\s*/, '') // Remove numbers
                        .replace(/^[-•*]\s*/, '')    // Remove bullets
                        .replace(/^Question\s*\d*:?\s*/i, '') // Remove "Question 1:" etc
                        .replace(/^Q\d*:?\s*/i, '') // Remove "Q1:" etc
                        .trim();
                    
                    if (cleaned.endsWith('?') && cleaned.length > 10 && cleaned.length < 120) {
                        questions.push(cleaned);
                    }
                }
                
                // Return first 3 valid questions or fallbacks
                const validQuestions = questions.slice(0, 3);
                if (validQuestions.length >= 3) {
                    return validQuestions;
                }
                
                // Add fallback questions if needed
                const fallbacks = [
                    "Can you explain this in more detail?",
                    "What are the practical applications of this?",
                    "How does this relate to current best practices?"
                ];
                
                while (validQuestions.length < 3) {
                    validQuestions.push(fallbacks[validQuestions.length]);
                }
                
                return validQuestions;
                
            } catch (error) {
                // Return generic fallback questions
                return [
                    "Can you provide more details about this?",
                    "What are the key benefits of this approach?",
                    "How can I implement this effectively?"
                ];
            }
        }

        // Utility delay function
        function delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        // Process user query with loading phases
        async function processUserQuery(question) {
            // Phase 1: Skeleton loading
            showSkeletonLoading();
            await delay(WIDGET_CONFIG.SKELETON_DURATION);
            
            // Phase 2: Obtaining sources
            showObtainingSources();
            await delay(WIDGET_CONFIG.SOURCES_DURATION);
            
            // Phase 3: Generating answer
            showGeneratingAnswer();
            await delay(WIDGET_CONFIG.GENERATING_DURATION);
            
            // Get API response
            try {
                const response = await createChatCompletion(question);
                const sources = generateMockAttributions();
                
                // Phase 4: Display final answer in the same container
                displayFullAnswer(question, response.answer, sources);
                
            } catch (error) {
                const currentSession = shadowRoot.getElementById('current-loading-session');
                if (currentSession) {
                    currentSession.innerHTML = `
                        <div class="gist-error">
                            <strong>Error:</strong> ${error.message}
                            </div>
                        `;
                }
            }
        }



        // Remove welcome questions section
        function removeWelcomeQuestions() {
            const welcomeQuestions = messagesContainer.querySelector('#gist-welcome-questions');
            if (welcomeQuestions) {
                // Add fade-out animation
                welcomeQuestions.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
                welcomeQuestions.style.opacity = '0';
                welcomeQuestions.style.transform = 'translateY(-10px)';
                
                // Remove from DOM after animation
            setTimeout(() => {
                    welcomeQuestions.remove();
                }, 300);
            }
        }

        // Remove entire welcome message section including greeting
        function removeWelcomeMessage() {
            const welcomeMessage = messagesContainer.querySelector('.gist-welcome-message');
            if (welcomeMessage) {
                // Add fade-out animation
                welcomeMessage.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
                welcomeMessage.style.opacity = '0';
                welcomeMessage.style.transform = 'translateY(-10px)';
                
                // Remove from DOM after animation
            setTimeout(() => {
                    welcomeMessage.remove();
                }, 300);
            }
        }

        // Create remix modal
        function createRemixModal(content) {
            // Remove existing modal if any
            const existingModal = shadowRoot.querySelector('.gist-remix-modal');
            if (existingModal) {
                existingModal.remove();
            }

            // Create modal overlay
            const modal = document.createElement('div');
            modal.className = 'gist-remix-modal';
            
            modal.innerHTML = `
                <div class="gist-remix-content">
                    <div class="gist-remix-header">
                        <h3 class="gist-remix-title">Remix</h3>
                        <button class="gist-remix-close">×</button>
                    </div>
                    
                    <div class="gist-remix-tabs">
                        <button class="gist-remix-tab active" data-type="image">Image</button>
                        <button class="gist-remix-tab" data-type="video">Video</button>
                        <button class="gist-remix-tab" data-type="audio">Audio</button>
                        <button class="gist-remix-tab" data-type="meme">Meme</button>
                    </div>
                    
                    <div class="gist-remix-options">
                        <div class="gist-remix-option-group">
                            <label class="gist-remix-option-label">Style</label>
                            <select class="gist-remix-select" id="remix-style">
                                <option value="professional">Professional</option>
                                <option value="casual">Casual</option>
                                <option value="creative">Creative</option>
                                <option value="minimalist">Minimalist</option>
                            </select>
                        </div>
                        
                        <div class="gist-remix-option-group">
                            <label class="gist-remix-option-label">Format</label>
                            <select class="gist-remix-select" id="remix-format">
                                <option value="square">Square (1:1)</option>
                                <option value="landscape">Landscape (16:9)</option>
                                <option value="portrait">Portrait (9:16)</option>
                                <option value="story">Story (9:16)</option>
                            </select>
                        </div>
                    </div>
                    
                    <button class="gist-remix-create">Create</button>
                </div>
            `;

            // Add to shadow root
            shadowRoot.appendChild(modal);

            // Get elements
            const closeBtn = modal.querySelector('.gist-remix-close');
            const tabs = modal.querySelectorAll('.gist-remix-tab');
            const createBtn = modal.querySelector('.gist-remix-create');
            const styleSelect = modal.querySelector('#remix-style');
            const formatSelect = modal.querySelector('#remix-format');

            let selectedType = 'image';

            // Event listeners
            closeBtn.addEventListener('click', () => {
                modal.classList.remove('visible');
                setTimeout(() => modal.remove(), 300);
            });

            // Close on backdrop click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('visible');
                    setTimeout(() => modal.remove(), 300);
                }
            });

            // Tab switching
            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    tabs.forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                    selectedType = tab.dataset.type;
                });
            });

            // Create button
            createBtn.addEventListener('click', () => {
                const style = styleSelect.value;
                const format = formatSelect.value;
                createRemixContent(selectedType, style, format, content);
                modal.classList.remove('visible');
                setTimeout(() => modal.remove(), 300);
            });

            // Show modal with animation
            setTimeout(() => {
                modal.classList.add('visible');
            }, 10);
        }

        // Create remix content
        function createRemixContent(selectedType, style, format, content) {
            console.log('Creating remix content:', {
                type: selectedType,
                style: style,
                format: format,
                content: content.substring(0, 200) + '...'
            });

            // Show success message temporarily
            const successMessage = document.createElement('div');
            successMessage.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: linear-gradient(135deg, #8b5cf6 0%, #667eea 100%);
                color: white;
                padding: 16px 24px;
                border-radius: 12px;
                font-size: 14px;
                font-weight: 500;
                z-index: 10002;
                box-shadow: 0 8px 25px rgba(139, 92, 246, 0.4);
                opacity: 0;
                transition: opacity 0.3s ease;
            `;
            successMessage.textContent = `Creating ${selectedType} with ${style} style in ${format} format...`;
            
            shadowRoot.appendChild(successMessage);
            
            setTimeout(() => {
                successMessage.style.opacity = '1';
            }, 10);

            setTimeout(() => {
                successMessage.style.opacity = '0';
                setTimeout(() => successMessage.remove(), 300);
            }, 3000);

            // TODO: Implement actual API call to generate remix content
            // For now, just log the parameters
        }

        
        // Submit query
        async function submitQuery() {
            const query = input.value.trim();
            if (!query) return;
            
            if (submitTimeout) {
                clearTimeout(submitTimeout);
            }
            
            // Track the message for context but don't display it
            addUserMessage(query);
            
            // Clear input and update placeholder
            input.value = '';
            
            if (!hasUserSentMessage) {
                hasUserSentMessage = true;
                input.placeholder = 'Ask a follow-up...';
                removeWelcomeMessage(); // Remove entire welcome message including greeting
            }
            
            // Process query immediately with loading phases
            submitTimeout = setTimeout(async () => {
                await processUserQuery(query);
            }, WIDGET_CONFIG.DEBOUNCE_MS);
        }
        
        // Widget state management
        function expandWidget() {
            if (!isMinimized) return;
            isMinimized = false;
            widget.classList.remove('minimized');
            chatContainer.classList.add('visible');
        }
        
        function minimizeWidget() {
            if (isMinimized) return;
            isMinimized = true;
            widget.classList.add('minimized');
            chatContainer.classList.remove('visible');
        }
        
        // Event listeners
        pill.addEventListener('click', () => {
            expandWidget();
            input.focus();
        });
        
        input.addEventListener('focus', expandWidget);
        
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submitQuery();
            }
        });
        
        submitBtn.addEventListener('click', submitQuery);
        
        closeBtn.addEventListener('click', () => {
            minimizeWidget();
            input.blur();
        });
        
        chatContainer.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        
        // Click outside to minimize
        document.addEventListener('click', (e) => {
            if (!widgetContainer.contains(e.target)) {
                setTimeout(minimizeWidget, 100);
            }
        });
        
        // Adaptive hover detection for minimized and expanded states
        let hoverCheckTimeout = null;
        
        document.addEventListener('mousemove', (e) => {
            if (!pill) return;
            
            // Determine which element to use for distance calculation
            const targetElement = isMinimized ? pill : chatContainer;
            const targetRect = targetElement.getBoundingClientRect();
            
            if (isMinimized) {
                // Original behavior - use center point and oval radius for pill
                const pillCenterX = targetRect.left + targetRect.width / 2;
                const pillCenterY = targetRect.top + targetRect.height / 2;
                
                // Calculate distance from cursor to pill center using oval detection
                const deltaX = e.clientX - pillCenterX;
                const deltaY = e.clientY - pillCenterY;
                
                // Define oval dimensions (wider horizontally than vertically)
                const HOVER_RADIUS_X = 200; // horizontal radius
                const HOVER_RADIUS_Y = 120; // vertical radius
                
                // Calculate if point is inside oval using ellipse formula
                const isInHoverZone = (Math.pow(deltaX, 2) / Math.pow(HOVER_RADIUS_X, 2)) + 
                                      (Math.pow(deltaY, 2) / Math.pow(HOVER_RADIUS_Y, 2)) <= 1;
                
                // Add/remove hover class for visual feedback
                if (isInHoverZone) {
                    pill.classList.add('in-hover-radius');
                    expandWidget();
                    
                    // Clear any pending minimize timeout
                    if (hoverCheckTimeout) {
                        clearTimeout(hoverCheckTimeout);
                        hoverCheckTimeout = null;
                    }
                } else {
                    pill.classList.remove('in-hover-radius');
                    
                    // Only minimize if input is not focused and has no value
                    if (!input.matches(':focus') && !input.value.trim()) {
                        // Clear existing timeout
                        if (hoverCheckTimeout) {
                            clearTimeout(hoverCheckTimeout);
                        }
                        
                        // Add delay to prevent flickering
                        hoverCheckTimeout = setTimeout(() => {
                            // Double-check oval zone hasn't changed
                            const currentPillRect = pill.getBoundingClientRect();
                            const currentPillCenterX = currentPillRect.left + currentPillRect.width / 2;
                            const currentPillCenterY = currentPillRect.top + currentPillRect.height / 2;
                            
                            const currentDeltaX = e.clientX - currentPillCenterX;
                            const currentDeltaY = e.clientY - currentPillCenterY;
                            
                            const currentIsInHoverZone = (Math.pow(currentDeltaX, 2) / Math.pow(HOVER_RADIUS_X, 2)) + 
                                                         (Math.pow(currentDeltaY, 2) / Math.pow(HOVER_RADIUS_Y, 2)) <= 1;
                            
                            if (!currentIsInHoverZone && !input.matches(':focus') && !input.value.trim()) {
                                minimizeWidget();
                            }
                            hoverCheckTimeout = null;
                        }, 300);
                    }
                }
            } else {
                // When expanded, check if mouse is within the chat container bounds
                const PADDING = 50; // Extra padding around the container
                
                const isWithinBounds = 
                    e.clientX >= (targetRect.left - PADDING) &&
                    e.clientX <= (targetRect.right + PADDING) &&
                    e.clientY >= (targetRect.top - PADDING) &&
                    e.clientY <= (targetRect.bottom + PADDING);
                
                if (!isWithinBounds && !input.matches(':focus') && !input.value.trim()) {
                    // Clear existing timeout
                    if (hoverCheckTimeout) {
                        clearTimeout(hoverCheckTimeout);
                    }
                    
                    // Add delay to prevent flickering
                    hoverCheckTimeout = setTimeout(() => {
                        const currentRect = chatContainer.getBoundingClientRect();
                        const stillOutside = 
                            e.clientX < (currentRect.left - PADDING) ||
                            e.clientX > (currentRect.right + PADDING) ||
                            e.clientY < (currentRect.top - PADDING) ||
                            e.clientY > (currentRect.bottom + PADDING);
                            
                        if (stillOutside && !input.matches(':focus') && !input.value.trim()) {
                            minimizeWidget();
                        }
                        hoverCheckTimeout = null;
                    }, 300);
                } else if (isWithinBounds) {
                    // Clear any pending minimize timeout when mouse is back in bounds
                    if (hoverCheckTimeout) {
                        clearTimeout(hoverCheckTimeout);
                        hoverCheckTimeout = null;
                    }
                }
            }
        });
        
        // Initialize welcome suggested questions
        generateSuggestedQuestions().then(questions => {
            if (questions.length > 0) {
                const welcomeQuestions = shadowRoot.getElementById('gist-welcome-questions');
                if (welcomeQuestions) {
                    let questionsHTML = `<div class="gist-suggested-questions-title">Try asking:</div>`;
                    
                    questions.forEach((question, i) => {
                        questionsHTML += `
                            <button class="gist-suggested-question" data-question="${question}">
                                <span class="gist-suggested-question-text">${question}</span>
                            </button>
                        `;
                    });
                    
                    welcomeQuestions.innerHTML = questionsHTML;
                    
                    // Add event listeners to welcome questions
                    const questionButtons = welcomeQuestions.querySelectorAll('.gist-suggested-question');
                    questionButtons.forEach(button => {
                        button.addEventListener('click', () => {
                            const question = button.dataset.question;
                            
                            // Remove entire welcome message when user clicks a suggestion
                            if (!hasUserSentMessage) {
                                hasUserSentMessage = true;
                                removeWelcomeMessage(); // Remove entire welcome message including greeting
                            }
                            
                            input.value = question;
                            submitQuery();
                        });
                    });
                }
            }
        });
        
        // Show widget
        setTimeout(() => {
            widget.classList.add('loaded');
        }, 100);
        
        return shadowRoot;
    }

    // Initialize
    function initWidget() {
  if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', createWidget);
  } else {
            createWidget();
        }
    }
    
    initWidget();
})();