(function() {
    'use strict';

    // ================================
    // CONFIGURATION
    // ================================
    
    // Fallback questions for instant display
    const FALLBACK_QUESTIONS = [
        "What are the key developments mentioned in this news?",
        "How might this impact the industry?",
        "What are the main findings discussed here?"
    ];
    
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

    // Get widget position from URL parameters or data attributes
    function getWidgetPosition() {
        // Check URL parameters first
        const urlParams = new URLSearchParams(window.location.search);
        const urlPosition = urlParams.get('widget_position');
        console.log('[GIST] Checking URL position parameter:', urlPosition);
        if (urlPosition && ['center', 'left', 'right'].includes(urlPosition)) {
            console.log('[GIST] Using URL position:', urlPosition);
            return urlPosition;
        }
        
        // Check data attribute on script tag
        const scripts = document.querySelectorAll('script[src*="widget.js"]');
        for (const script of scripts) {
            const dataPosition = script.getAttribute('data-position');
            if (dataPosition && ['center', 'left', 'right'].includes(dataPosition)) {
                console.log('[GIST] Using script data-position:', dataPosition);
                return dataPosition;
            }
        }
        
        // Check current script if available
        if (typeof document !== 'undefined' && document.currentScript) {
            const dataPosition = document.currentScript.getAttribute('data-position');
            if (dataPosition && ['center', 'left', 'right'].includes(dataPosition)) {
                console.log('[GIST] Using currentScript data-position:', dataPosition);
                return dataPosition;
            }
        }
        
        // Default to center
        console.log('[GIST] Using default position: center');
        return 'center';
    }

    const WIDGET_CONFIG = {
        CHAT_API_URL: `${BACKEND_BASE_URL}/api/chat`,
        MODEL: 'gpt-3.5-turbo',
        TIMEOUT_MS: 20000,
        DEBOUNCE_MS: 300,
        // Loading phase durations - reduced for speed
        SKELETON_DURATION: 500,     // 0.5 seconds
        SOURCES_DURATION: 300,      // 0.3 seconds
        GENERATING_DURATION: 200,   // 0.2 seconds
        // Widget positioning
        POSITION: getWidgetPosition() // center, left, right
    };
    
    // ================================
    // DARK MODE DETECTION
    // ================================
    
    function detectDarkMode() {
        console.log('[GIST] Dark mode detection starting...');
        
        // First, check for explicit theme class names (most reliable)
        const darkModeClasses = ['dark', 'dark-mode', 'dark-theme', 'theme-dark', 'night-mode'];
        const lightModeClasses = ['light', 'light-mode', 'light-theme', 'theme-light'];
        
        // Check for explicit light mode classes first
        for (const className of lightModeClasses) {
            if (document.body.classList.contains(className) || 
                document.documentElement.classList.contains(className)) {
                console.log('[GIST] Light mode class found:', className);
                console.log('[GIST] Final dark mode result: false (explicit light class)');
                return false;
            }
        }
        
        // Check for explicit dark mode classes
        let darkClassFound = false;
        for (const className of darkModeClasses) {
            if (document.body.classList.contains(className) || 
                document.documentElement.classList.contains(className)) {
                darkClassFound = true;
                console.log('[GIST] Dark mode class found:', className);
                break;
            }
        }
        console.log('[GIST] Dark mode classes found:', darkClassFound);
        if (darkClassFound) {
            console.log('[GIST] Final dark mode result: true (explicit dark class)');
            return true;
        }
        
        // Second, analyze actual page colors using a scoring system
        console.log('[GIST] Analyzing actual page colors with scoring system...');
        const elementsToCheck = [
            { element: document.querySelector('html'), name: 'html', weight: 2 },
            { element: document.body, name: 'body', weight: 1 },
            { element: document.querySelector('main'), name: 'main', weight: 3 },
            { element: document.querySelector('article'), name: 'article', weight: 3 },
            { element: document.querySelector('.content'), name: '.content', weight: 2 },
            { element: document.querySelector('#content'), name: '#content', weight: 2 },
            { element: document.querySelector('#root'), name: '#root', weight: 2 },
            { element: document.querySelector('#app'), name: '#app', weight: 2 },
            { element: document.querySelector('.main-content'), name: '.main-content', weight: 2 },
            { element: document.querySelector('header'), name: 'header', weight: 1 },
            { element: document.querySelector('.header'), name: '.header', weight: 1 }
        ];
        
        let darkScore = 0;
        let lightScore = 0;
        let hasDefinitiveResult = false;
        
        for (const { element, name, weight } of elementsToCheck) {
            if (!element) {
                console.log(`[GIST] ${name} element not found`);
                continue;
            }
            
            const style = window.getComputedStyle(element);
            const bgColor = style.backgroundColor;
            const textColor = style.color;
            
            console.log(`[GIST] ${name} background:`, bgColor, 'text:', textColor);
            
            // Check background color
            if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
                const rgbMatch = bgColor.match(/\d+/g);
                if (rgbMatch && rgbMatch.length >= 3) {
                    const [r, g, b] = rgbMatch.map(Number);
                    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
                    console.log(`[GIST] ${name} background RGB:`, [r, g, b], 'Luminance:', luminance.toFixed(3), 'Weight:', weight);
                    
                    if (luminance < 0.2) {
                        darkScore += weight;
                        console.log(`[GIST] ${name} contributes ${weight} to dark score (very dark bg)`);
                        // Main content areas with dark backgrounds are definitive
                        if ((name === 'main' || name === 'article') && luminance < 0.15) {
                            hasDefinitiveResult = true;
                            console.log(`[GIST] Found very dark main content area (${name})`);
                            console.log('[GIST] Final dark mode result: true (definitive dark main content)');
                            return true;
                        }
                    } else if (luminance > 0.8) {
                        lightScore += weight;
                        console.log(`[GIST] ${name} contributes ${weight} to light score (very light bg)`);
                        // Main content areas with light backgrounds are definitive
                        if ((name === 'main' || name === 'article') && luminance > 0.85) {
                            hasDefinitiveResult = true;
                            console.log(`[GIST] Found very light main content area (${name})`);
                            console.log('[GIST] Final dark mode result: false (definitive light main content)');
                            return false;
                        }
                    } else if (luminance < 0.5) {
                        darkScore += weight * 0.5;
                        console.log(`[GIST] ${name} contributes ${weight * 0.5} to dark score (medium-dark bg)`);
                    } else {
                        lightScore += weight * 0.5;
                        console.log(`[GIST] ${name} contributes ${weight * 0.5} to light score (medium-light bg)`);
                    }
                }
            }
            
            // Also check text color - dark sites often have light text
            if (textColor) {
                const textMatch = textColor.match(/\d+/g);
                if (textMatch && textMatch.length >= 3) {
                    const [r, g, b] = textMatch.map(Number);
                    const textLuminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
                    console.log(`[GIST] ${name} text RGB:`, [r, g, b], 'Text Luminance:', textLuminance.toFixed(3));
                    
                    if (textLuminance > 0.8) {
                        darkScore += weight * 0.3; // Light text suggests dark theme
                        console.log(`[GIST] ${name} contributes ${weight * 0.3} to dark score (light text)`);
                    } else if (textLuminance < 0.3) {
                        lightScore += weight * 0.3; // Dark text suggests light theme
                        console.log(`[GIST] ${name} contributes ${weight * 0.3} to light score (dark text)`);
                    }
                }
            }
        }
        
        console.log(`[GIST] Final scores - Dark: ${darkScore.toFixed(1)}, Light: ${lightScore.toFixed(1)}`);
        console.log(`[GIST] Threshold checks - Dark > Light*1.2: ${darkScore.toFixed(1)} > ${(lightScore * 1.2).toFixed(1)} = ${darkScore > lightScore * 1.2}`);
        console.log(`[GIST] Threshold checks - Light > Dark*1.2: ${lightScore.toFixed(1)} > ${(darkScore * 1.2).toFixed(1)} = ${lightScore > darkScore * 1.2}`);
        
        // Use scores to determine theme with more reasonable thresholds
        if (darkScore > lightScore * 1.2) {
            console.log('[GIST] Final dark mode result: true (dark score wins by margin)');
            return true;
        } else if (lightScore > darkScore * 1.2) {
            console.log('[GIST] Final dark mode result: false (light score wins by margin)');
            return false;
        } else if (darkScore > lightScore) {
            console.log('[GIST] Final dark mode result: true (dark score higher)');
            return true;
        } else if (lightScore > darkScore) {
            console.log('[GIST] Final dark mode result: false (light score higher)');
            return false;
        }
        
        // Last resort: check media query (but this should be last priority)
        const mediaQueryDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        console.log('[GIST] Media query dark mode:', mediaQueryDark, '(using as fallback only)');
        
        // Default to light mode if we can't determine (most websites are light)
        console.log('[GIST] No clear theme indicators found, defaulting to light mode');
        console.log('[GIST] Final dark mode result: false (default)');
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
            accentColors: new Set(),
            themeColors: new Set(),
            borderColors: new Set()
        };
        
        console.log('[GIST COLOR] Starting comprehensive theme color detection...');
        
        // Enhanced element selection for better color detection
        const sampleElements = [
            ...document.querySelectorAll('header, nav, .header, .navbar, .nav-bar'),
            ...document.querySelectorAll('button, .btn, .button, .cta, .call-to-action'),
            ...document.querySelectorAll('a[href], .link, .nav-link'),
            ...document.querySelectorAll('.brand, .logo, .site-title, .logo-text'),
            ...document.querySelectorAll('h1, h2, h3, .title, .heading, .hero-title'),
            ...document.querySelectorAll('.primary, .accent, .highlight, .featured'),
            document.body,
            document.documentElement
        ];
        
        sampleElements.forEach(element => {
            if (!element) return;
            
            const style = window.getComputedStyle(element);
            
            // Background colors
            const bgColor = style.backgroundColor;
            if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
                colors.backgrounds.add(bgColor);
                
                // Check if it's a vibrant color for theme detection
                if (isVibrantColor(bgColor)) {
                    colors.themeColors.add(bgColor);
                }
            }
            
            // Text colors
            const textColor = style.color;
            if (textColor) {
                colors.textColors.add(textColor);
                
                if (isVibrantColor(textColor)) {
                    colors.themeColors.add(textColor);
                }
            }
            
            // Border colors
            const borderColors = [
                style.borderColor,
                style.borderTopColor,
                style.borderRightColor,
                style.borderBottomColor,
                style.borderLeftColor
            ];
            
            borderColors.forEach(borderColor => {
                if (borderColor && borderColor !== 'rgba(0, 0, 0, 0)' && borderColor !== 'transparent') {
                    colors.borderColors.add(borderColor);
                    
                    if (isVibrantColor(borderColor)) {
                        colors.themeColors.add(borderColor);
                    }
                }
            });
            
            // Accent colors from interactive elements
            if (element.tagName === 'BUTTON' || element.tagName === 'A' || 
                element.classList.contains('btn') || element.classList.contains('button') ||
                element.classList.contains('cta') || element.classList.contains('primary')) {
                if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)') {
                    colors.accentColors.add(bgColor);
                    colors.themeColors.add(bgColor);
                }
                if (textColor && isVibrantColor(textColor)) {
                    colors.accentColors.add(textColor);
                    colors.themeColors.add(textColor);
                }
            }
        });
        
        // Check CSS custom properties for theme colors
        const rootStyle = window.getComputedStyle(document.documentElement);
        const themeVariables = [
            '--primary-color', '--primary', '--accent-color', '--accent', '--brand-color', '--brand',
            '--theme-color', '--main-color', '--highlight-color', '--link-color',
            '--primary-bg', '--accent-bg', '--brand-bg', '--theme-bg',
            '--border-color', '--primary-border', '--accent-border'
        ];
        
        themeVariables.forEach(varName => {
            const value = rootStyle.getPropertyValue(varName).trim();
            if (value && value !== 'initial' && value !== 'inherit' && value !== '') {
                console.log(`[GIST COLOR] Found CSS variable ${varName}: ${value}`);
                colors.themeColors.add(value);
                colors.accentColors.add(value);
            }
        });
        
        // Helper function to determine if a color is vibrant (not gray/neutral)
        function isVibrantColor(colorStr) {
            const rgbMatch = colorStr.match(/\d+/g);
            if (!rgbMatch || rgbMatch.length < 3) return false;
            
            const [r, g, b] = rgbMatch.map(Number);
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            const saturation = max === 0 ? 0 : (max - min) / max;
            const brightness = (r + g + b) / 3;
            
            // Consider it vibrant if it has some saturation and isn't too dark/light
            return saturation > 0.15 && brightness > 30 && brightness < 240;
        }
        
        const result = {
            backgrounds: Array.from(colors.backgrounds),
            textColors: Array.from(colors.textColors),
            accentColors: Array.from(colors.accentColors),
            themeColors: Array.from(colors.themeColors),
            borderColors: Array.from(colors.borderColors)
        };
        
        console.log('[GIST COLOR] Detected color scheme:', {
            themeColors: result.themeColors,
            accentColors: result.accentColors,
            borderColors: result.borderColors
        });
        
        return result;
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
    
    // Helper function for color conversion
    function hexToRgb(hex) {
        // Remove # if present
        hex = hex.replace('#', '');
        
        // Handle 3-digit hex
        if (hex.length === 3) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        
        return { r, g, b };
    }
    
    async function analyzeWebsiteStyling() {
        try {
            const isDarkMode = detectDarkMode();
            console.log('[GIST] Website styling detected - isDarkMode:', isDarkMode);
            const logos = await extractLogosAndIcons();
            const colorScheme = extractColorScheme();
            
            // Prioritize theme colors for the primary color
            let primaryColor = null;
            if (colorScheme.themeColors.length > 0) {
                primaryColor = rgbToHex(colorScheme.themeColors[0]);
                console.log('[GIST COLOR] Using theme color as primary:', primaryColor);
            } else if (colorScheme.accentColors.length > 0) {
                primaryColor = rgbToHex(colorScheme.accentColors[0]);
                console.log('[GIST COLOR] Using accent color as primary:', primaryColor);
            }
            
            // Secondary color - try to find a complementary theme color
            let secondaryColor = null;
            if (colorScheme.themeColors.length > 1) {
                secondaryColor = rgbToHex(colorScheme.themeColors[1]);
            } else if (colorScheme.borderColors.length > 0) {
                secondaryColor = rgbToHex(colorScheme.borderColors[0]);
            }

            const backgroundColor = colorScheme.backgrounds.length > 0 ? 
                rgbToHex(colorScheme.backgrounds.find(bg => 
                    !bg.includes('rgba(0, 0, 0, 0)') && bg !== 'transparent'
                )) : (isDarkMode ? '#1f2937' : '#ffffff');
            
            const textColor = colorScheme.textColors.length > 0 ? 
                rgbToHex(colorScheme.textColors[0]) : (isDarkMode ? '#f9fafb' : '#374151');
            
            // Create gradient colors from detected theme colors
            const gradientColors = colorScheme.themeColors.slice(0, 3).map(color => rgbToHex(color)).filter(Boolean);
            
                websiteStyling = {
                primaryColor: primaryColor || (isDarkMode ? '#60a5fa' : '#6366f1'),
                secondaryColor: secondaryColor || (isDarkMode ? '#a78bfa' : '#8b5cf6'),
                backgroundColor: backgroundColor || (isDarkMode ? '#1f2937' : '#ffffff'),
                textColor: textColor || (isDarkMode ? '#f9fafb' : '#374151'),
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                borderRadius: '16px',
                logoUrl: logos.logo,
                faviconUrl: logos.favicon,
                brandColors: gradientColors.length > 0 ? gradientColors : [primaryColor].filter(Boolean),
                themeColors: colorScheme.themeColors.map(color => rgbToHex(color)).filter(Boolean),
                borderColors: colorScheme.borderColors.map(color => rgbToHex(color)).filter(Boolean),
                isDarkMode: isDarkMode
            };
            
            console.log('[GIST DEBUG] Final websiteStyling:', websiteStyling);
            console.log('[GIST DEBUG] Detected brand colors:', websiteStyling.brandColors);
            console.log('[GIST DEBUG] Detected theme colors:', websiteStyling.themeColors);
            return websiteStyling;
            } catch (error) {
            console.error('[GistWidget] Failed to analyze website styling:', error);
            return websiteStyling;
        }
    }
    
    // ================================
    // DEBUG FUNCTIONS
    // ================================
    
    function debugThemeDetection() {
        const elements = ['html', 'body', 'main', 'header', '.content', '#root', '#app'];
        console.log('[GIST DEBUG] Theme detection for current page:');
        console.log('[GIST DEBUG] Page URL:', window.location.href);
        console.log('[GIST DEBUG] Page title:', document.title);
        
        elements.forEach(selector => {
            const el = document.querySelector(selector);
            if (el) {
                const style = window.getComputedStyle(el);
                const bgColor = style.backgroundColor;
                const textColor = style.color;
                
                // Calculate luminance for background
                let bgLuminance = 'N/A';
                if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
                    const rgbMatch = bgColor.match(/\d+/g);
                    if (rgbMatch && rgbMatch.length >= 3) {
                        const [r, g, b] = rgbMatch.map(Number);
                        bgLuminance = ((0.299 * r + 0.587 * g + 0.114 * b) / 255).toFixed(3);
                    }
                }
                
                // Calculate luminance for text
                let textLuminance = 'N/A';
                if (textColor) {
                    const textMatch = textColor.match(/\d+/g);
                    if (textMatch && textMatch.length >= 3) {
                        const [r, g, b] = textMatch.map(Number);
                        textLuminance = ((0.299 * r + 0.587 * g + 0.114 * b) / 255).toFixed(3);
                    }
                }
                
                console.log(`[GIST DEBUG] ${selector}:`, {
                    background: bgColor,
                    backgroundLuminance: bgLuminance,
                    color: textColor,
                    textLuminance: textLuminance,
                    className: el.className,
                    tagName: el.tagName
                });
            } else {
                console.log(`[GIST DEBUG] ${selector}: not found`);
            }
        });
        
        // Check for theme classes
        const themeClasses = {
            html: document.documentElement.className,
            body: document.body.className
        };
        console.log('[GIST DEBUG] Theme classes:', themeClasses);
        
        // Check media query
        const mediaQueryDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        console.log('[GIST DEBUG] Media query prefers dark:', mediaQueryDark);
        
        // Run detection and log result
        const detectedMode = detectDarkMode();
        console.log('[GIST DEBUG] Final detected mode:', detectedMode);
        
        return detectedMode;
    }
    
    // ================================
    // DYNAMIC STYLES GENERATION
    // ================================
    
    function generateDynamicStyles(styling) {
        const isDark = styling.isDarkMode;
        
        // Make websiteStyling globally available for the CSS
        window.currentWebsiteStyling = styling;
        
        // Create dynamic gradient from detected theme colors
        let gradientColors = [];
        if (styling.brandColors && styling.brandColors.length > 0) {
            gradientColors = styling.brandColors.slice(0, 3);
        } else if (styling.themeColors && styling.themeColors.length > 0) {
            gradientColors = styling.themeColors.slice(0, 3);
        }
        
        // Fallback to default gradient if no theme colors detected
        if (gradientColors.length === 0) {
            gradientColors = ['#f59e0b', '#ec4899', '#8b5cf6'];
        } else if (gradientColors.length === 1) {
            // Create variations of the single color
            const baseColor = gradientColors[0];
            gradientColors = [baseColor, baseColor, baseColor];
        } else if (gradientColors.length === 2) {
            // Add a third color that's a blend
            gradientColors = [gradientColors[0], gradientColors[1], gradientColors[0]];
        }
        
        const gradientString = `linear-gradient(90deg, ${gradientColors.join(', ')})`;
        
        console.log('[GIST DEBUG] generateDynamicStyles called with:', {
            isDarkMode: styling.isDarkMode,
            backgroundColor: styling.backgroundColor,
            textColor: styling.textColor,
            primaryColor: styling.primaryColor,
            brandColors: styling.brandColors,
            themeColors: styling.themeColors,
            gradientColors: gradientColors,
            widgetPosition: WIDGET_CONFIG.POSITION
        });
        
        return `
            :host {
                all: initial;
                font-family: ${styling.fontFamily};
                --primary-color: ${styling.primaryColor};
                --secondary-color: ${styling.secondaryColor};
                --background-color: ${styling.backgroundColor};
                --text-color: ${styling.textColor};
                --border-color: ${isDark ? '#374151' : '#e5e7eb'};
                --theme-gradient: ${gradientString};
                --shadow: ${isDark ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 4px 20px rgba(0, 0, 0, 0.1)'};
                --widget-width: 350px;
                --widget-chat-width: 380px;
            }
            
            /* Widget Container */
            .widget-container {
                position: fixed;
                top: 20px;
                left: 20px;
                z-index: 10000;
                pointer-events: none;
                opacity: 0;
                transform: translateY(-10px);
                transition: opacity 250ms ease, transform 250ms ease;
                font-family: ${styling.fontFamily};
                }
                
            .widget-container.loaded {
                    opacity: 1;
                transform: translateY(0);
                    pointer-events: auto;
                }
                
            /* Collapsible Search Bar - Enhanced for Dark Mode */
            .widget-search-bar {
                display: flex;
                align-items: center;
                background: ${isDark ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.98)'};
                /* Enhanced border for better dark mode visibility */
                border: 3px solid transparent;
                border-radius: 24px;
                /* Use website's theme gradient with enhanced visibility */
                background-image: 
                    linear-gradient(${isDark ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.98)'}, ${isDark ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.98)'}),
                    var(--theme-gradient);
                background-origin: border-box;
                background-clip: padding-box, border-box;
                /* Enhanced shadow with glow effect for dark mode using theme colors */
                box-shadow: ${isDark ? `
                    var(--shadow),
                    0 0 0 1px ${styling.primaryColor}40,
                    0 0 20px ${styling.primaryColor}30
                ` : 'var(--shadow)'};
                backdrop-filter: blur(10px);
                cursor: pointer;
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                overflow: hidden;
                position: relative;
                z-index: 10001;
                
                /* Collapsed state - circle with favicon */
                width: 48px;
                height: 48px;
                padding: 0;
                gap: 0;
            }

            /* Expanded state - full search bar */
            .widget-search-bar.expanded {
                width: 320px;
                padding: 0 8px 0 16px;
                gap: 12px;
            }

            .widget-search-bar:hover {
                transform: translateY(-1px);
                box-shadow: ${isDark ? '0 6px 25px rgba(0, 0, 0, 0.4)' : '0 4px 15px rgba(0, 0, 0, 0.15)'};
            }

            /* Website logo - visible in collapsed state, positioned in center */
            .widget-logo {
                width: 24px;
                height: 24px;
                flex-shrink: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                    border-radius: 4px;
                overflow: hidden;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                
                /* Show in center when collapsed */
                opacity: 1;
                transform: scale(1);
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                z-index: 10003;
            }

            .widget-search-bar.expanded .widget-logo {
                opacity: 1;
                transform: scale(1);
                position: static;
                transform: none;
                z-index: auto;
            }

            .logo-img {
                width: 100%;
                height: 100%;
                    object-fit: contain;
                border-radius: 4px;
            }

            .logo-text {
                width: 24px;
                height: 24px;
                background: var(--theme-gradient);
                color: white;
                font-size: 12px;
                font-weight: 700;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 4px;
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
            }

            /* Search input - hidden when collapsed */
            .widget-search-input {
                    flex: 1;
                border: none;
                background: transparent;
                font-size: 14px;
                color: var(--text-color);
                    outline: none;
                    font-family: inherit;
                    min-width: 0;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                
                /* Hidden when collapsed */
                opacity: 0;
                width: 0;
                pointer-events: none;
            }

            .widget-search-bar.expanded .widget-search-input {
                opacity: 1;
                width: auto;
                pointer-events: auto;
            }

            .widget-search-input::placeholder {
                color: ${isDark ? '#9ca3af' : '#6b7280'};
            }
            
            /* Arrow button - hidden in collapsed state */
            .widget-arrow-btn {
                width: 32px;
                height: 32px;
                background: #1f2937;
                border: none;
                border-radius: 50%;
        display: flex;
        align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.2s ease;
                flex-shrink: 0;
                color: white;
                
                /* Hidden when collapsed */
                opacity: 0;
                transform: scale(0.8);
                pointer-events: none;
            }

            .widget-search-bar.expanded .widget-arrow-btn {
                opacity: 1;
                transform: scale(1);
                pointer-events: auto;
            }

            .widget-arrow-btn:hover {
                transform: scale(1.05);
                background: #374151;
            }

            .widget-arrow-btn svg {
                width: 16px;
                height: 16px;
                transition: transform 0.3s ease;
            }

            /* Rotate arrow when expanded */
            .widget-search-bar.expanded .widget-arrow-btn svg {
                transform: rotate(180deg);
            }

            /* Rotation animation for loading */
            .widget-arrow-btn.rotating svg {
                animation: spin 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            }

            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }

            /* Mobile responsive */
            @media (max-width: 768px) {
                .widget-search-bar.expanded {
                    width: min(320px, calc(100vw - 40px));
                }
            }

            @media (max-width: 480px) {
                .widget-search-bar.expanded {
                    width: calc(100vw - 40px);
                    max-width: 300px;
                }
            }

            /* Floating Suggestions Container */
            .floating-suggestions {
                position: absolute;
                top: 56px; /* Position below search bar (48px height + 8px margin) */
                left: 0;
                right: 0;
                z-index: 10001;
                opacity: 0;
                visibility: hidden;
                transform: translateY(-10px);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                pointer-events: none;
            }

            .floating-suggestions.visible {
                opacity: 1;
                visibility: visible;
                transform: translateY(0);
                pointer-events: auto;
            }

            /* Individual floating suggestion buttons */
            .floating-suggestion {
                display: block;
                width: 100%;
                padding: 12px 20px;
                margin-bottom: 8px;
                background: ${isDark ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.98)'};
                border: 2px solid transparent;
                border-radius: 24px;
                background-image: 
                    linear-gradient(${isDark ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.98)'}, ${isDark ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.98)'}),
                    var(--theme-gradient);
                background-origin: border-box;
                background-clip: padding-box, border-box;
                box-shadow: var(--shadow);
                backdrop-filter: blur(10px);
                cursor: pointer;
                transition: all 0.2s ease;
                font-family: inherit;
                font-size: 14px;
                font-weight: 500;
                color: var(--text-color);
                text-align: left;
                border: none;
                outline: none;
                
                /* Staggered animation */
                opacity: 0;
                transform: translateY(10px);
                animation: fadeInUp 0.4s ease-out forwards;
            }

            .floating-suggestion:nth-child(1) { animation-delay: 0.1s; }
            .floating-suggestion:nth-child(2) { animation-delay: 0.2s; }
            .floating-suggestion:nth-child(3) { animation-delay: 0.3s; }
            .floating-suggestion:nth-child(4) { animation-delay: 0.4s; }

            .floating-suggestion:hover {
                transform: translateY(-2px);
                box-shadow: 
                    var(--shadow),
                    0 8px 25px ${styling.primaryColor}25;
                background-image: 
                    linear-gradient(${isDark ? 'rgba(55, 65, 81, 0.95)' : 'rgba(248, 250, 252, 0.98)'}, ${isDark ? 'rgba(55, 65, 81, 0.95)' : 'rgba(248, 250, 252, 0.98)'}),
                    var(--theme-gradient);
            }

            .floating-suggestion:active {
                transform: translateY(0);
            }

            /* Loading state */
            .suggestions-loading {
                text-align: center;
                padding: 16px 20px;
                color: ${isDark ? '#9ca3af' : '#6b7280'};
                font-size: 14px;
                font-style: italic;
                background: ${isDark ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.98)'};
                border: 2px solid transparent;
                border-radius: 24px;
                background-image: 
                    linear-gradient(${isDark ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.98)'}, ${isDark ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.98)'}),
                    var(--theme-gradient);
                background-origin: border-box;
                background-clip: padding-box, border-box;
                backdrop-filter: blur(10px);
            }

            /* Fade in animation */
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

            /* Mobile responsive for floating suggestions */
            @media (max-width: 480px) {
                .floating-suggestions {
                    left: -10px;
                    right: -10px;
                }
                
                .floating-suggestion {
                    padding: 10px 16px;
                    font-size: 13px;
                }
            }
            
            .gist-chat-container {
                width: var(--widget-chat-width);
                max-width: min(90vw, calc(100vw - 40px));
                max-height: 500px;
                background: ${isDark ? styling.backgroundColor : '#ffffff'};
                border: 2px solid transparent;
                border-radius: 16px;
                background-image: 
                    linear-gradient(${isDark ? styling.backgroundColor : '#ffffff'}, ${isDark ? styling.backgroundColor : '#ffffff'}),
                    var(--theme-gradient);
                background-origin: border-box;
                background-clip: padding-box, border-box;
                box-shadow: ${isDark ? '0 10px 40px rgba(0, 0, 0, 0.3)' : '0 4px 20px rgba(0, 0, 0, 0.15)'};
                backdrop-filter: blur(10px);
                    opacity: 0;
                    transform: translateY(-10px) scale(0.95);
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    pointer-events: none;
                    order: 2;
                    display: flex;
                    flex-direction: column;
                overflow: hidden;
                margin-top: 8px;
            }
                
            .gist-chat-container.visible {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                    pointer-events: auto;
                }
                
            @media (max-width: 768px) {
                .gist-chat-container {
                    width: min(var(--widget-chat-width), calc(100vw - 40px));
                    max-height: 400px;
                }
            }
            
            @media (max-width: 480px) {
                .gist-chat-container {
                    width: calc(100vw - 40px);
                    max-height: 350px;
                }
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
                background: ${isDark ? '#374151' : '#f3f4f6'};
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
                background: ${isDark ? '#374151' : '#f3f4f6'};
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
                transition: opacity 0.4s ease, transform 0.4s ease;
            }

            .gist-suggested-questions.hidden {
                display: none;
            }

            .gist-suggested-questions.loading {
                opacity: 1;
                transform: translateY(0);
            }

            .gist-loading-text {
                color: ${isDark ? '#9ca3af' : '#6b7280'};
                font-size: 13px;
                font-style: italic;
                    text-align: center;
                padding: 16px 0;
                animation: pulse 2s ease-in-out infinite;
            }

            .gist-skeleton-questions {
                    display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .gist-skeleton-question {
                height: 40px;
                background: ${isDark ? '#374151' : '#e5e7eb'};
                border-radius: 8px;
                    position: relative;
                    overflow: hidden;
                }
                
            .gist-skeleton-question::after {
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

            @keyframes pulse {
                0%, 100% { opacity: 0.6; }
                50% { opacity: 1; }
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
                background: ${isDark ? '#374151' : '#f3f4f6'};
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
                background: ${isDark ? '#4b5563' : '#e5e7eb'};
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
                transform: translateY(20px);
                visibility: hidden;
            }

            .gist-follow-up-questions.fade-in {
                animation: smoothFadeInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
            }

            @keyframes smoothFadeInUp {
                0% {
                    opacity: 0;
                    transform: translateY(20px);
                    visibility: hidden;
                }
                100% {
                    opacity: 1;
                    transform: translateY(0);
                    visibility: visible;
                }
            }

            @keyframes fadeIn {
                0% {
                    opacity: 0;
                }
                100% {
                    opacity: 1;
                }
            }

            @keyframes fadeInQuestion {
                0% {
                    opacity: 0;
                    transform: translateY(20px);
                }
                100% {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .gist-follow-up-title {
                    font-size: 14px;
                    font-weight: 600;
                color: var(--text-color);
                    margin-bottom: 12px;
                    opacity: 0;
                animation: fadeIn 0.6s ease-out forwards;
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
                background: ${isDark ? 'rgba(255, 255, 255, 0.03)' : '#f9fafb'};
                border: 1px solid var(--border-color);
                border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                text-align: left;
                width: 100%;
                font-family: inherit;
                font-size: 13px;
                opacity: 0;
                animation: fadeInQuestion 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
            }
            
            .gist-follow-up-question:hover {
                background: ${isDark ? 'rgba(255, 255, 255, 0.08)' : '#f3f4f6'};
                border-color: var(--primary-color);
                    transform: translateY(-1px);
                    box-shadow: ${isDark ? '0 2px 8px rgba(0, 0, 0, 0.1)' : '0 2px 8px rgba(0, 0, 0, 0.05)'};
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
            
                        /* Remix functionality styles - temporarily hidden */
            .gist-remix-btn {
                display: none;
            }

            .gist-remix-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(0, 0, 0, 0.8);
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
                background: ${isDark ? '#1a1a1a' : '#ffffff'};
                border-radius: 16px;
                width: 600px;
                max-width: 90vw;
                height: 80vh;
                max-height: 700px;
                display: flex;
                flex-direction: column;
                box-shadow: ${isDark ? '0 20px 60px rgba(0, 0, 0, 0.5)' : '0 20px 60px rgba(0, 0, 0, 0.15)'};
                transform: scale(0.95);
                transition: transform 0.3s ease;
                color: ${isDark ? 'white' : '#111827'};
                position: relative;
            }

            .gist-remix-modal.visible .gist-remix-content {
                transform: scale(1);
            }

            .gist-remix-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px 24px;
                border-bottom: 1px solid ${isDark ? '#333' : '#e5e7eb'};
            }

            .gist-remix-title {
                font-size: 20px;
                font-weight: 700;
                color: ${isDark ? 'white' : '#111827'};
                margin: 0;
            }

            .gist-remix-close {
                width: 36px;
                height: 36px;
                border-radius: 50%;
                background: transparent;
                border: none;
                color: ${isDark ? '#9ca3af' : '#6b7280'};
                font-size: 20px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
            }

            .gist-remix-close:hover {
                background: ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
                color: ${isDark ? 'white' : '#374151'};
                transform: scale(1.1);
            }

            .gist-remix-tabs {
                display: flex;
                gap: 8px;
                padding: 16px 24px;
                background: transparent;
            }

            .gist-remix-tab {
                padding: 8px 20px;
                background: transparent;
                border: none;
                border-radius: 20px;
                color: ${isDark ? '#9ca3af' : '#6b7280'};
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
                font-family: inherit;
            }

            .gist-remix-tab.active {
                background: ${isDark ? 'white' : '#111827'};
                color: ${isDark ? 'black' : 'white'};
            }

            .gist-remix-tab:hover:not(.active) {
                background: ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
                color: ${isDark ? 'white' : '#374151'};
            }

            .gist-remix-body {
                flex: 1;
                display: flex;
                flex-direction: column;
                overflow-y: auto;
                padding: 0 24px 24px;
            }

            .gist-remix-preview {
                width: 100%;
                height: 300px;
                margin: 20px 0;
                background: ${isDark ? '#2a2a2a' : '#f9fafb'};
                border-radius: 12px;
                border: 2px solid ${isDark ? '#3a3a3a' : '#e5e7eb'};
                display: flex;
                align-items: center;
                justify-content: center;
                flex-direction: column;
                gap: 16px;
                color: ${isDark ? '#9ca3af' : '#6b7280'};
                font-size: 16px;
                text-align: center;
            }

            .gist-remix-preview svg {
                opacity: 0.6;
            }

            /* New styles for options below preview */
            .gist-remix-options {
                display: flex;
                gap: 12px;
                margin-bottom: 24px;
                justify-content: center;
            }

            .gist-remix-option-group {
                position: relative;
            }

            .gist-remix-dropdown {
                background: ${isDark ? '#2a2a2a' : '#ffffff'};
                border: 1px solid ${isDark ? '#444' : '#d1d5db'};
                border-radius: 20px;
                padding: 10px 20px;
                color: ${isDark ? 'white' : '#374151'};
                font-size: 14px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 8px;
                transition: all 0.2s ease;
                font-family: inherit;
            }

            .gist-remix-dropdown:hover {
                background: ${isDark ? '#333' : '#f9fafb'};
                border-color: ${isDark ? '#555' : '#9ca3af'};
            }

            .dropdown-arrow {
                font-size: 12px;
                transition: transform 0.2s ease;
            }

            .gist-remix-dropdown.open .dropdown-arrow {
                transform: rotate(180deg);
            }

            .gist-remix-dropdown-content {
                position: absolute;
                top: 100%;
                left: 0;
                margin-top: 4px;
                background: ${isDark ? '#2a2a2a' : '#ffffff'};
                border: 1px solid ${isDark ? '#444' : '#d1d5db'};
                border-radius: 12px;
                padding: 8px;
                display: none;
                z-index: 10;
                min-width: 150px;
            }

            .gist-remix-dropdown-content.show {
                display: block;
            }

            /* Updated suggestion cards */
            .gist-remix-suggestions {
                display: flex;
                flex-direction: column;
                gap: 12px;
                margin-top: auto;
            }

            .gist-remix-suggestion-card {
                background: ${isDark ? '#2a2a2a' : '#f9fafb'};
                border-radius: 12px;
                padding: 16px;
                display: flex;
                align-items: center;
                gap: 12px;
                cursor: pointer;
                transition: all 0.2s ease;
                border: 1px solid transparent;
            }

            .gist-remix-suggestion-card:hover {
                background: ${isDark ? '#333' : '#f3f4f6'};
                border-color: ${isDark ? '#555' : '#d1d5db'};
            }

            .gist-remix-plus-icon {
                width: 24px;
                height: 24px;
                border-radius: 50%;
                background: ${isDark ? '#555' : '#e5e7eb'};
                color: ${isDark ? 'white' : '#6b7280'};
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
                font-weight: bold;
                flex-shrink: 0;
                transition: background 0.2s ease;
            }

            .gist-remix-suggestion-card:hover .gist-remix-plus-icon {
                background: ${isDark ? '#666' : '#d1d5db'};
            }

            .gist-remix-suggestion-text {
                color: ${isDark ? 'white' : '#374151'};
                font-size: 15px;
                font-weight: 500;
                line-height: 1.4;
            }

            /* Updated search bar styles */
            .gist-remix-input-container {
                padding: 20px 24px;
                border-top: 1px solid ${isDark ? '#333' : '#e5e7eb'};
                background: ${isDark ? '#1a1a1a' : '#ffffff'};
            }

            .gist-remix-search-wrapper {
                display: flex;
                align-items: center;
                gap: 12px;
                background: ${isDark ? '#2a2a2a' : '#ffffff'};
                border: 2px solid transparent;
                border-radius: 28px;
                padding: 8px 8px 8px 20px;
                background-image: 
                    linear-gradient(${isDark ? '#2a2a2a' : '#ffffff'}, ${isDark ? '#2a2a2a' : '#ffffff'}),
                    linear-gradient(90deg, #f59e0b 0%, #ec4899 50%, #8b5cf6 100%);
                background-origin: border-box;
                background-clip: padding-box, border-box;
                transition: all 0.3s ease;
            }

            .gist-remix-search-wrapper:focus-within {
                box-shadow: 0 0 20px rgba(139, 92, 246, 0.2);
            }

            .gist-remix-input {
                flex: 1;
                background: transparent;
                border: none;
                color: ${isDark ? 'white' : '#111827'};
                font-size: 14px;
                outline: none;
                font-family: inherit;
                padding: 4px 0;
            }

            .gist-remix-input::placeholder {
                color: ${isDark ? '#9ca3af' : '#6b7280'};
            }

            .gist-remix-voice-btn {
                background: transparent;
                border: none;
                color: ${isDark ? '#9ca3af' : '#6b7280'};
                padding: 8px;
                cursor: pointer;
                transition: all 0.2s ease;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .gist-remix-voice-btn:hover {
                background: ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
                color: ${isDark ? 'white' : '#374151'};
            }

            .gist-remix-create-btn {
                background: #f59e0b;
                color: black;
                border: none;
                padding: 10px 24px;
                border-radius: 20px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                font-family: inherit;
            }

            .gist-remix-create-btn:hover {
                background: #f97316;
                transform: scale(1.05);
            }

            .gist-remix-create-btn.loading {
                background: #6b7280;
                cursor: not-allowed;
            }

            .gist-remix-select {
                    width: 100%;
                background: ${isDark ? '#2a2a2a' : '#ffffff'};
                border: 1px solid ${isDark ? '#444' : '#d1d5db'};
                border-radius: 8px;
                padding: 14px 16px;
                color: ${isDark ? 'white' : '#374151'};
                font-size: 15px;
                font-family: inherit;
                cursor: pointer;
                outline: none;
                transition: all 0.2s ease;
                min-height: 48px;
            }

            .gist-remix-select:hover {
                border-color: ${isDark ? '#555' : '#9ca3af'};
                background: ${isDark ? '#333' : '#f9fafb'};
            }

            .gist-remix-select:focus {
                border-color: #8b5cf6;
                box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.2);
            }

            .gist-remix-select option {
                background: ${isDark ? '#2a2a2a' : '#ffffff'};
                color: ${isDark ? 'white' : '#374151'};
                padding: 8px;
            }

            @media (min-width: 768px) {
                .gist-remix-select {
                    padding: 16px 20px;
                    font-size: 16px;
                    min-height: 52px;
                }
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

            /* Audio Player Styles */
            .gist-audio-player {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: ${isDark ? '#000' : '#ffffff'};
                z-index: 10002;
                opacity: 0;
                transition: opacity 0.3s ease;
            }

            .gist-audio-player.visible {
                opacity: 1;
            }

            .audio-player-container {
                width: 100%;
                height: 100%;
                position: relative;
                display: flex;
                flex-direction: column;
            }

            /* Visualizer Canvas */
            .audio-visualizer {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 1;
            }

            .audio-gradient-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.8) 100%);
                z-index: 2;
            }

            /* Header */
            .audio-player-header {
                position: relative;
                z-index: 10;
                display: flex;
                justify-content: space-between;
                padding: 20px;
            }

            .audio-back-btn, .audio-options-btn {
                background: transparent;
                border: none;
                color: ${isDark ? 'white' : '#374151'};
                padding: 12px;
                cursor: pointer;
                transition: opacity 0.2s;
            }

            .audio-back-btn:hover, .audio-options-btn:hover {
                opacity: 0.7;
            }

            /* Content Area */
            .audio-content-area {
                flex: 1;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                position: relative;
                z-index: 10;
                padding: 20px;
            }

            .time-label {
                color: ${isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(107, 114, 128, 0.7)'};
                font-size: 14px;
                margin-bottom: 20px;
            }

            .mirror-btn {
                background: ${isDark ? '#1a1a1a' : '#f3f4f6'};
                color: ${isDark ? 'white' : '#374151'};
                border: none;
                padding: 12px 32px;
                border-radius: 24px;
                font-size: 16px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
                margin-top: 20px;
            }

            .mirror-btn:hover {
                background: ${isDark ? '#2a2a2a' : '#e5e7eb'};
                transform: scale(1.02);
            }

            /* News Card */
            .audio-news-card {
                background: ${isDark ? 'rgba(26, 26, 26, 0.9)' : 'rgba(255, 255, 255, 0.95)'};
                border-radius: 16px;
                padding: 24px;
                max-width: 400px;
                width: 100%;
                backdrop-filter: blur(10px);
                border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
            }

            .news-card-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 16px;
            }

            .news-source {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .source-logo {
                width: 24px;
                height: 24px;
                background: #8b5cf6;
                color: white;
                border-radius: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                font-size: 14px;
            }

            .source-name {
                color: ${isDark ? 'white' : '#374151'};
                font-weight: 500;
            }

            .news-attribution {
                background: rgba(139, 92, 246, 0.2);
                color: #8b5cf6;
                padding: 4px 12px;
                border-radius: 12px;
                font-size: 14px;
                font-weight: 500;
            }

            .news-title {
                color: ${isDark ? 'white' : '#111827'};
                font-size: 18px;
                font-weight: 600;
                margin-bottom: 8px;
                line-height: 1.4;
            }

            .news-date {
                color: ${isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(107, 114, 128, 0.7)'};
                font-size: 14px;
                margin-bottom: 16px;
            }

            .news-thumbnail {
                width: 60px;
                height: 60px;
                border-radius: 8px;
                object-fit: cover;
                position: absolute;
                right: 24px;
                bottom: 24px;
            }

            /* Voice Selector */
            .audio-voice-selector {
                background: ${isDark ? 'rgba(26, 26, 26, 0.9)' : 'rgba(255, 255, 255, 0.95)'};
                border-radius: 12px;
                padding: 16px;
                margin-bottom: 20px;
                display: flex;
                align-items: center;
                gap: 12px;
                backdrop-filter: blur(10px);
                border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
            }
            
            .voice-label {
                color: ${isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(107, 114, 128, 0.8)'};
                font-size: 14px;
                font-weight: 500;
                min-width: 50px;
            }
            
            .audio-voice-select {
                flex: 1;
                background: ${isDark ? '#2a2a2a' : '#ffffff'};
                border: 1px solid ${isDark ? '#444' : '#d1d5db'};
                border-radius: 8px;
                padding: 10px 16px;
                color: ${isDark ? 'white' : '#374151'};
                font-size: 14px;
                cursor: pointer;
                outline: none;
                transition: all 0.2s ease;
                font-family: inherit;
            }
            
            .audio-voice-select:hover {
                border-color: ${isDark ? '#555' : '#9ca3af'};
                background: ${isDark ? '#333' : '#f9fafb'};
            }
            
            .audio-voice-select:focus {
                border-color: #8b5cf6;
                box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.2);
            }
            
            .audio-voice-select option {
                background: ${isDark ? '#2a2a2a' : '#ffffff'};
                color: ${isDark ? 'white' : '#374151'};
                padding: 8px;
            }

            /* Player Controls */
            .audio-player-controls {
                position: relative;
                z-index: 10;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(20px);
                padding: 30px 20px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
            }

            .player-title {
                color: white;
                font-size: 18px;
                font-weight: 600;
                text-align: center;
                margin-bottom: 20px;
            }

            /* Progress Bar */
            .audio-progress-container {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 30px;
            }

            .time-current, .time-total {
                color: rgba(255, 255, 255, 0.7);
                font-size: 14px;
                min-width: 40px;
            }

            .audio-progress-bar {
                flex: 1;
                height: 4px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 2px;
                position: relative;
                cursor: pointer;
            }

            .audio-progress-track {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 2px;
            }

            .audio-progress-fill {
                position: absolute;
                top: 0;
                left: 0;
                height: 100%;
                background: white;
                border-radius: 2px;
                transition: width 0.1s ease;
            }

            .audio-progress-handle {
                position: absolute;
                top: 50%;
                transform: translate(-50%, -50%);
                width: 12px;
                height: 12px;
                background: white;
                border-radius: 50%;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                transition: left 0.1s ease;
            }

            /* Control Buttons */
            .audio-control-buttons {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 24px;
                margin-bottom: 20px;
            }

            .audio-control-buttons button {
                background: transparent;
                border: none;
                color: white;
                cursor: pointer;
                transition: all 0.2s ease;
                padding: 8px;
            }

            .audio-control-buttons button:hover {
                transform: scale(1.1);
                opacity: 0.8;
            }

            .audio-play-pause {
                background: white !important;
                color: black !important;
                width: 64px;
                height: 64px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 0 !important;
            }

            .audio-play-pause:hover {
                transform: scale(1.05);
            }

            .audio-download {
                position: absolute;
                bottom: 20px;
                right: 20px;
                background: transparent;
                border: none;
                color: rgba(255, 255, 255, 0.7);
                padding: 12px;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .audio-download:hover {
                color: white;
                transform: scale(1.1);
            }

            /* Mobile Responsive */
            @media (max-width: 768px) {
                .audio-news-card {
                    max-width: 90vw;
                    padding: 20px;
                }
                
                .audio-control-buttons {
                    gap: 16px;
                }
                
                .audio-play-pause {
                    width: 56px;
                    height: 56px;
                }
            }
            
            /* ================================
               RIGHT-HAND SIDEBAR STYLES - MATCH WEBPAGE STYLING
               ================================ */
            
            .gist-sidebar {
                position: fixed;
                top: 0;
                right: -400px;
                width: 400px;
                height: 100vh;
                /* Use the same background as detected from website */
                background: ${styling.backgroundColor || (isDark ? '#1f2937' : '#ffffff')};
                /* Add gradient border like search box */
                border: 2px solid transparent;
                border-left: 2px solid transparent;
                background-image: 
                    linear-gradient(${styling.backgroundColor || (isDark ? '#1f2937' : '#ffffff')}, ${styling.backgroundColor || (isDark ? '#1f2937' : '#ffffff')}),
                    var(--theme-gradient);
                background-origin: border-box;
                background-clip: padding-box, border-box;
                box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
                backdrop-filter: blur(10px);
                z-index: 10002;
                display: flex;
                flex-direction: column;
                transition: right 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                transform: translateZ(0);
                /* Ensure it's hidden by default */
                visibility: hidden;
                opacity: 0;
                transition: right 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease, visibility 0.4s ease;
            }

            .gist-sidebar.open {
                right: 0;
                visibility: visible;
                opacity: 1;
            }

            /* Sidebar Header - Match webpage styling */
            .gist-sidebar-header {
                padding: 20px 24px;
                border-bottom: 1px solid ${isDark ? '#374151' : '#e5e7eb'};
                display: flex;
                justify-content: space-between;
                align-items: center;
                /* Use slightly darker/lighter shade of webpage background */
                background: ${(() => {
                    const bgColor = styling.backgroundColor || (isDark ? '#1f2937' : '#ffffff');
                    if (bgColor.startsWith('#')) {
                        const rgb = hexToRgb(bgColor);
                        return isDark ? 
                            `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8)` : 
                            `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.95)`;
                    }
                    return isDark ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.95)';
                })()};
                backdrop-filter: blur(10px);
            }

            .gist-sidebar-header h3 {
                margin: 0;
                font-size: 18px;
                font-weight: 600;
                color: ${styling.textColor || (isDark ? '#f9fafb' : '#374151')};
            }

            /* Close button - Adapt to webpage colors */
            .gist-sidebar-close {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background: transparent;
                border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'};
                color: ${styling.textColor || (isDark ? '#d1d5db' : '#6b7280')};
                font-size: 18px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
                backdrop-filter: blur(5px);
            }

            .gist-sidebar-close:hover {
                background: ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
                border-color: ${styling.primaryColor || '#8b5cf6'};
                transform: scale(1.05);
            }

            /* Sidebar Content - Match webpage styling */
            .gist-sidebar-content {
                flex: 1;
                padding: 24px;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
                gap: 24px;
                /* Inherit webpage background */
                background: transparent;
            }

            .gist-sidebar-content::-webkit-scrollbar {
                width: 6px;
            }
            
            .gist-sidebar-content::-webkit-scrollbar-track {
                background: ${isDark ? '#374151' : '#f1f5f9'};
                border-radius: 3px;
            }
            
            .gist-sidebar-content::-webkit-scrollbar-thumb {
                background: ${isDark ? '#6b7280' : '#cbd5e1'};
                border-radius: 3px;
            }

            /* Welcome Message */
            .gist-sidebar-welcome {
                display: flex;
                gap: 12px;
                align-items: flex-start;
            }

            .gist-ai-avatar {
                flex-shrink: 0;
            }

            /* Welcome Message - Adapt to webpage colors */
            .gist-welcome-message {
                background: ${isDark ? 
                    'rgba(255, 255, 255, 0.1)' : 
                    'rgba(0, 0, 0, 0.05)'
                };
                border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
                padding: 16px;
                border-radius: 12px;
                color: ${styling.textColor || (isDark ? '#f9fafb' : '#374151')};
                line-height: 1.5;
                flex: 1;
                backdrop-filter: blur(5px);
            }

            /* Suggested Questions - Match webpage styling */
            .gist-sidebar-suggestions {
                padding: 24px;
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            
            .gist-sidebar-suggestions h4 {
                margin: 0 0 16px 0;
                font-size: 16px;
                font-weight: 600;
                color: ${styling.textColor || (isDark ? '#f9fafb' : '#374151')};
            }

            .gist-suggestions-container {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .gist-suggestions-loading {
                text-align: center;
                color: ${isDark ? '#9ca3af' : '#6b7280'};
                font-style: italic;
                padding: 20px;
            }

            .gist-sidebar-suggestion {
                padding: 12px 16px;
                background: ${isDark ? 
                    'rgba(255, 255, 255, 0.05)' : 
                    'rgba(0, 0, 0, 0.03)'
                };
                border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s ease;
                color: ${styling.textColor || (isDark ? '#f9fafb' : '#374151')};
                font-size: 14px;
                line-height: 1.4;
                backdrop-filter: blur(5px);
            }

            .gist-sidebar-suggestion:hover {
                background: ${isDark ? 
                    'rgba(255, 255, 255, 0.1)' : 
                    'rgba(0, 0, 0, 0.08)'
                };
                border-color: ${styling.primaryColor || '#8b5cf6'};
                transform: translateY(-1px);
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }

            /* Chat Messages Area */
            .gist-sidebar-messages {
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 16px;
                min-height: 200px;
            }

            /* User Messages in Sidebar */
            .gist-user-message {
                display: flex;
                justify-content: flex-end;
                margin-bottom: 12px;
            }

            .gist-user-message .gist-message-content {
                background: var(--primary-color);
                color: white;
                padding: 12px 16px;
                border-radius: 16px 16px 4px 16px;
                max-width: 80%;
                font-size: 14px;
                line-height: 1.4;
            }

            /* Sidebar Footer - Match webpage styling */
            .gist-sidebar-footer {
                padding: 16px 24px;
                border-top: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 12px;
                color: ${isDark ? '#9ca3af' : '#6b7280'};
                /* Match header background */
                background: ${(() => {
                    const bgColor = styling.backgroundColor || (isDark ? '#1f2937' : '#ffffff');
                    if (bgColor.startsWith('#')) {
                        const rgb = hexToRgb(bgColor);
                        return isDark ? 
                            `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8)` : 
                            `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.95)`;
                    }
                    return isDark ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.95)';
                })()};
                backdrop-filter: blur(10px);
            }

            /* Add to site link - Use webpage primary color */
            .gist-sidebar-footer .gist-add-to-site {
                color: ${styling.primaryColor || '#8b5cf6'};
                text-decoration: none;
                font-weight: 500;
            }

            .gist-sidebar-footer .gist-add-to-site:hover {
                text-decoration: underline;
            }

            /* Sidebar Input Container */
            .gist-sidebar-input-container {
                padding: 16px;
                border-top: 1px solid ${isDark ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.5)'};
                background: ${isDark ? 'rgba(31, 41, 55, 0.8)' : 'rgba(248, 250, 252, 0.8)'};
                display: flex;
                gap: 8px;
                align-items: center;
                backdrop-filter: blur(10px);
            }

            .gist-sidebar-input {
                flex: 1;
                padding: 10px 16px;
                background: ${isDark ? 'rgba(55, 65, 81, 0.5)' : 'rgba(255, 255, 255, 0.8)'};
                border: 1px solid ${isDark ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.5)'};
                border-radius: 24px;
                color: ${styling.textColor || (isDark ? '#f9fafb' : '#374151')};
                font-size: 14px;
                outline: none;
                transition: all 0.2s ease;
                font-family: inherit;
            }

            .gist-sidebar-input:focus {
                border-color: ${styling.primaryColor || '#8b5cf6'};
                background: ${isDark ? 'rgba(55, 65, 81, 0.8)' : '#ffffff'};
                box-shadow: 0 0 0 2px ${styling.primaryColor || '#8b5cf6'}20;
            }

            .gist-sidebar-input::placeholder {
                color: ${isDark ? '#9ca3af' : '#6b7280'};
            }

            .gist-sidebar-send-btn {
                width: 36px;
                height: 36px;
                border-radius: 50%;
                background: ${styling.primaryColor || '#8b5cf6'};
                border: none;
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.2s ease;
                flex-shrink: 0;
            }

            .gist-sidebar-send-btn:hover {
                background: ${styling.secondaryColor || styling.primaryColor || '#7c3aed'};
                transform: scale(1.05);
            }

            .gist-sidebar-send-btn svg {
                width: 18px;
                height: 18px;
            }

            /* Sidebar Overlay */
            .gist-sidebar-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(0, 0, 0, 0.3);
                z-index: 10001;
                opacity: 0;
                visibility: hidden;
                pointer-events: none;
                transition: all 0.3s ease;
            }

            .gist-sidebar-overlay.visible {
                opacity: 1;
                visibility: visible;
                pointer-events: auto;
            }

            /* Mobile Responsive for Sidebar */
            @media (max-width: 768px) {
                .gist-sidebar {
                    width: 100vw;
                    right: -100vw;
                }
                
                .gist-sidebar.open {
                    right: 0;
                }
                
                .gist-sidebar-content {
                    padding: 20px;
                }
            }

            /* Chat Sidebar Styles */
            .widget-sidebar {
                position: fixed;
                top: 0;
                right: -400px;
                width: 400px;
                height: 100vh;
                background: ${isDark ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.98)'};
                backdrop-filter: blur(10px);
                border-left: 1px solid ${isDark ? 'rgba(55, 65, 81, 0.5)' : 'rgba(229, 231, 235, 0.5)'};
                z-index: 10002;
                display: flex;
                flex-direction: column;
                transition: right 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: ${isDark ? '-4px 0 20px rgba(0, 0, 0, 0.3)' : '-4px 0 20px rgba(0, 0, 0, 0.1)'};
            }

            .widget-sidebar.open {
                right: 0;
            }

            .sidebar-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(0, 0, 0, 0.3);
                z-index: 10001;
                opacity: 0;
                visibility: hidden;
                pointer-events: none;
                transition: all 0.3s ease;
            }

            .sidebar-overlay.visible {
                opacity: 1;
                visibility: visible;
                pointer-events: auto;
            }

            .sidebar-header {
                padding: 20px;
                border-bottom: 1px solid ${isDark ? 'rgba(55, 65, 81, 0.5)' : 'rgba(229, 231, 235, 0.5)'};
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: ${isDark ? 'rgba(31, 41, 55, 0.8)' : 'rgba(248, 250, 252, 0.8)'};
            }

            .sidebar-header h3 {
                margin: 0;
                font-size: 18px;
                font-weight: 600;
                color: var(--text-color);
            }

            .sidebar-close {
                width: 32px;
                height: 32px;
                border: none;
                background: ${isDark ? 'rgba(107, 114, 128, 0.2)' : 'rgba(107, 114, 128, 0.1)'};
                color: ${isDark ? '#d1d5db' : '#6b7280'};
                border-radius: 50%;
                cursor: pointer;
                font-size: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
            }

            .sidebar-close:hover {
                background: ${isDark ? 'rgba(107, 114, 128, 0.3)' : 'rgba(107, 114, 128, 0.2)'};
                transform: scale(1.1);
            }

            .sidebar-content {
                flex: 1;
                padding: 20px;
                display: flex;
                flex-direction: column;
                overflow: hidden;
            }

            .sidebar-welcome {
                display: flex;
                align-items: flex-start;
                gap: 12px;
                margin-bottom: 20px;
                padding: 16px;
                background: ${isDark ? 'rgba(55, 65, 81, 0.3)' : 'rgba(248, 250, 252, 0.5)'};
                border-radius: 12px;
                border: 1px solid ${isDark ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.5)'};
            }

            .sidebar-welcome .ai-avatar {
                width: 32px;
                height: 32px;
                background: var(--theme-gradient);
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 600;
                font-size: 14px;
                flex-shrink: 0;
            }

            .welcome-message {
                flex: 1;
                font-size: 14px;
                line-height: 1.5;
                color: var(--text-color);
            }

            .sidebar-messages {
                flex: 1;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
                gap: 16px;
                padding-right: 8px;
            }

            .sidebar-messages::-webkit-scrollbar {
                width: 6px;
            }

            .sidebar-messages::-webkit-scrollbar-track {
                background: ${isDark ? '#374151' : '#f1f5f9'};
                border-radius: 3px;
            }

            .sidebar-messages::-webkit-scrollbar-thumb {
                background: ${isDark ? '#6b7280' : '#cbd5e1'};
                border-radius: 3px;
            }

            .sidebar-messages::-webkit-scrollbar-thumb:hover {
                background: ${isDark ? '#9ca3af' : '#94a3b8'};
            }

            .chat-message {
                display: flex;
                align-items: flex-start;
                gap: 12px;
            }

            .chat-message.user {
                flex-direction: row-reverse;
            }

            .chat-message .ai-avatar {
                width: 32px;
                height: 32px;
                background: var(--theme-gradient);
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 600;
                font-size: 14px;
                flex-shrink: 0;
            }

            .chat-message .message-content {
                flex: 1;
                max-width: 80%;
            }

            .chat-message .message-text {
                padding: 12px 16px;
                border-radius: 12px;
                font-size: 14px;
                line-height: 1.5;
            }

            .chat-message.user .message-text {
                background: var(--theme-gradient);
                color: white;
                border-radius: 12px 12px 4px 12px;
            }

            .chat-message.ai .message-text {
                background: ${isDark ? 'rgba(55, 65, 81, 0.5)' : 'rgba(248, 250, 252, 0.8)'};
                color: var(--text-color);
                border: 1px solid ${isDark ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.5)'};
                border-radius: 4px 12px 12px 12px;
            }

            .chat-message.loading .message-text {
                opacity: 0.7;
                font-style: italic;
            }

            .chat-message.error .message-text {
                background: ${isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(254, 226, 226, 0.8)'};
                color: ${isDark ? '#fca5a5' : '#dc2626'};
                border-color: ${isDark ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)'};
            }

            .sidebar-footer {
                padding: 16px 20px;
                border-top: 1px solid ${isDark ? 'rgba(55, 65, 81, 0.5)' : 'rgba(229, 231, 235, 0.5)'};
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 12px;
                color: ${isDark ? '#9ca3af' : '#6b7280'};
                background: ${isDark ? 'rgba(31, 41, 55, 0.8)' : 'rgba(248, 250, 252, 0.8)'};
            }

            .sidebar-footer .add-to-site {
                color: var(--primary-color);
                text-decoration: none;
                font-weight: 500;
            }

            .sidebar-footer .add-to-site:hover {
                text-decoration: underline;
            }

            /* Mobile responsive for chat sidebar */
            @media (max-width: 768px) {
                .widget-sidebar {
                    width: 100vw;
                    right: -100vw;
                }
                
                .widget-sidebar.open {
                    right: 0;
                }
                
                .sidebar-content {
                    padding: 16px;
                }
                
                .sidebar-header {
                    padding: 16px;
                }
            }
            
            /* Sidebar Input Container */
            .gist-sidebar-input-container {
                padding: 16px;
                border-top: 1px solid ${isDark ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.5)'};
                background: ${isDark ? 'rgba(31, 41, 55, 0.8)' : 'rgba(248, 250, 252, 0.8)'};
                display: flex;
                gap: 8px;
                align-items: center;
                backdrop-filter: blur(10px);
            }

            .gist-sidebar-input {
                flex: 1;
                padding: 10px 16px;
                background: ${isDark ? 'rgba(55, 65, 81, 0.5)' : 'rgba(255, 255, 255, 0.8)'};
                border: 1px solid ${isDark ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.5)'};
                border-radius: 24px;
                color: ${styling.textColor || (isDark ? '#f9fafb' : '#374151')};
                font-size: 14px;
                outline: none;
                transition: all 0.2s ease;
                font-family: inherit;
            }

            .gist-sidebar-input:focus {
                border-color: ${styling.primaryColor || '#8b5cf6'};
                background: ${isDark ? 'rgba(55, 65, 81, 0.8)' : '#ffffff'};
                box-shadow: 0 0 0 2px ${styling.primaryColor || '#8b5cf6'}20;
            }

            .gist-sidebar-input::placeholder {
                color: ${isDark ? '#9ca3af' : '#6b7280'};
            }

            .gist-sidebar-send-btn {
                width: 36px;
                height: 36px;
                border-radius: 50%;
                background: ${styling.primaryColor || '#8b5cf6'};
                border: none;
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.2s ease;
                flex-shrink: 0;
            }

            .gist-sidebar-send-btn:hover {
                background: ${styling.secondaryColor || styling.primaryColor || '#7c3aed'};
                transform: scale(1.05);
            }

            .gist-sidebar-send-btn svg {
                width: 18px;
                height: 18px;
            }

            /* Update sidebar content to account for input */
            .gist-sidebar-content {
                flex: 1;
                padding: 24px;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
                gap: 24px;
                /* Remove bottom padding since input container has its own */
                padding-bottom: 0;
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
        
        // Debug theme detection
        console.log('[GIST DEBUG] Starting comprehensive theme analysis...');
        debugThemeDetection();
        
        // Analyze website styling
        const extractedStyling = await analyzeWebsiteStyling();
        const dynamicStyles = generateDynamicStyles(extractedStyling);
        // Extract website branding for dynamic placeholder
        const siteBranding = await extractWebsiteBranding();
        const placeholderText = `Ask ${siteBranding.name} anything...`;
        
        // Preload detected font
        preloadWebsiteFont(siteBranding.font);
        
        // Debug logging
        console.log('[GIST] Detected website branding:', siteBranding);
        console.log('[GIST] Placeholder text:', placeholderText);
        
        const widgetHTML = `
            <style>${dynamicStyles}</style>
            <!-- Main Widget Container -->
            <div class="widget-container" id="widget-container">
                <!-- Collapsible search bar -->
                <div class="widget-search-bar collapsed" id="widget-search-bar">
                    <!-- Website logo (visible in collapsed state) -->
                    <div class="widget-logo" id="widget-logo">
                        ${siteBranding.faviconUrl ? 
                            `<img src="${siteBranding.faviconUrl}" alt="${siteBranding.name}" class="logo-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                             <span class="logo-text" style="display: none;">${siteBranding.name.charAt(0).toUpperCase()}</span>` : 
                            `<span class="logo-text">${siteBranding.name.charAt(0).toUpperCase()}</span>`
                        }
                </div>
                
                    <!-- Search input (hidden when collapsed) -->
                    <input 
                        type="text" 
                        class="widget-search-input" 
                        placeholder="${placeholderText}" 
                        id="widget-search-input"
                        style="font-family: ${siteBranding.font}, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;"
                    >
                    
                    <!-- Arrow button (always visible) -->
                    <button class="widget-arrow-btn" id="widget-arrow-btn">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="m9 18 6-6-6-6"></path>
                        </svg>
                    </button>
                </div>
                
                <!-- Floating suggested questions -->
                <div class="floating-suggestions" id="floating-suggestions">
                    <!-- Questions will be loaded here -->
                </div>
            </div>
            
            <!-- Chat Sidebar -->
            <div class="gist-sidebar-overlay" id="gist-sidebar-overlay"></div>
            <div class="gist-sidebar" id="gist-sidebar">
                <div class="gist-sidebar-header">
                    <h3>Ask ${siteBranding.name || 'Ask Anything™'} anything</h3>
                    <button class="gist-sidebar-close" id="gist-sidebar-close">×</button>
                </div>
                <div class="gist-sidebar-content" id="gist-sidebar-content">
                    <!-- Suggested questions section (shown when sidebar first opens) -->
                    <div class="gist-sidebar-suggestions" id="gist-sidebar-suggestions">
                        <h4>Suggested Questions</h4>
                        <div class="gist-suggestions-loading">Loading suggestions...</div>
                    </div>
                    
                    <!-- Messages container (for Q&A sessions) -->
                    <div class="gist-sidebar-messages" id="gist-sidebar-messages"></div>
                </div>
                
                <!-- Input container at bottom of sidebar -->
                <div class="gist-sidebar-input-container">
                    <input 
                        type="text" 
                        class="gist-sidebar-input" 
                        placeholder="${placeholderText}" 
                        id="gist-sidebar-input"
                    >
                    <button class="gist-sidebar-send-btn" id="gist-sidebar-send">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="m22 2-7 20-4-9-9-4 20-7z"></path>
                        </svg>
                    </button>
                </div>
                
                <div class="gist-sidebar-footer">
                    <div class="gist-powered-section">
                        <img src="${BACKEND_BASE_URL}/gist-logo.png" alt="Gist Logo" class="gist-footer-logo">
                        <span>Powered by Gist Answers</span>
                    </div>
                    <a href="https://gpademo.vercel.app" target="_blank" class="gist-add-to-site">Add to your site</a>
                </div>
            </div>
        `;
        
        shadowRoot.innerHTML = widgetHTML;
        document.body.appendChild(widgetContainer);
        
        // Get elements
        const widget = shadowRoot.getElementById('widget-container');
        const searchBar = shadowRoot.getElementById('widget-search-bar');
        const input = shadowRoot.getElementById('widget-search-input');
        const arrowBtn = shadowRoot.getElementById('widget-arrow-btn');
        const logo = shadowRoot.getElementById('widget-logo');
        const floatingSuggestions = shadowRoot.getElementById('floating-suggestions');

        // IMPORTANT: Ensure floating suggestions start hidden
        if (floatingSuggestions) {
            floatingSuggestions.classList.remove('visible');
            console.log('[WIDGET] Floating suggestions initialized as hidden');
        }

        // Ensure widget starts in collapsed state
        if (searchBar) {
            searchBar.classList.add('collapsed');
            console.log('[WIDGET] Search bar initialized as collapsed');
        }
        
        // State
        let isMinimized = true;
        let conversationHistory = [];
        let pageContext = null;
        let submitTimeout = null;
        let messageHistory = [];
        let hasUserSentMessage = false;

        // Sidebar hover detection state
        let sidebarHasBeenOpened = false;
        let rightEdgeHoverTimeout = null;
        let sidebarCloseTimeout = null;
        let isHoveringRightEdge = false;

        
        // ================================
        // DYNAMIC WIDTH DETECTION
        // ================================
        
        function calculateSafeWidgetWidth() {
            try {
                // 1. Find main content elements
                const contentSelectors = [
                    'main', 'article', '.content', '.main-content', 
                    '#content', '#main', '.container', '.wrapper',
                    'header', 'nav', '.header', '.navigation',
                    '.site-header', '.main-header', '.navbar',
                    '.post', '.entry', '.story', '.article-content',
                    'section', 'aside', '.sidebar', '.menu'
                ];
                
                // 2. Get leftmost content boundary
                let minContentLeft = window.innerWidth;
                let foundContent = false;
                
                contentSelectors.forEach(selector => {
                    try {
                        const elements = document.querySelectorAll(selector);
                        elements.forEach(el => {
                            // Skip our own widget and hidden elements
                            if (el.id === 'gist-widget-container' || 
                                el.closest('#gist-widget-container') ||
                                window.getComputedStyle(el).display === 'none' ||
                                window.getComputedStyle(el).visibility === 'hidden') {
                                return;
                            }
                            
                            const rect = el.getBoundingClientRect();
                            // Only consider elements that are visible and have meaningful width
                            if (rect.width > 100 && rect.height > 20 && rect.left >= 0) {
                                if (rect.left < minContentLeft) {
                                    minContentLeft = rect.left;
                                    foundContent = true;
                                }
                            }
                        });
                    } catch (e) {
                        // Ignore selector errors
                    }
                });
                
                // 3. Calculate safe widget width
                const WIDGET_LEFT_POSITION = 20; // Widget's left position
                const SAFETY_MARGIN = 20; // Safety margin to prevent overlap
                const MAX_WIDTH = 400; // Maximum widget width
                const MIN_WIDTH = window.innerWidth <= 480 ? 200 : window.innerWidth <= 768 ? 250 : 280; // Responsive minimum width
                const DEFAULT_WIDTH = window.innerWidth <= 480 ? 280 : window.innerWidth <= 768 ? 320 : 350; // Responsive default width
                
                // Mobile handling - use smaller widths on mobile
                const isMobile = window.innerWidth <= 768;
                const mobileMaxWidth = Math.min(window.innerWidth - 40, DEFAULT_WIDTH);
                
                if (isMobile) {
                    return {
                        pillWidth: mobileMaxWidth,
                        chatWidth: mobileMaxWidth
                    };
                }
                
                if (!foundContent || minContentLeft <= WIDGET_LEFT_POSITION + MIN_WIDTH) {
                    // No content found or content is too close, use default
                    return {
                        pillWidth: DEFAULT_WIDTH,
                        chatWidth: Math.min(MAX_WIDTH, DEFAULT_WIDTH + 30)
                    };
                }
                
                // Calculate available space
                const availableWidth = minContentLeft - WIDGET_LEFT_POSITION - SAFETY_MARGIN;
                const pillWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, availableWidth));
                const chatWidth = Math.max(MIN_WIDTH + 30, Math.min(MAX_WIDTH + 30, availableWidth + 30));
                
                console.log('[GIST DEBUG] Width calculation:', {
                    minContentLeft,
                    availableWidth,
                    pillWidth,
                    chatWidth,
                    foundContent
                });
                
                return {
                    pillWidth,
                    chatWidth
                };
                
            } catch (error) {
                console.warn('[GIST DEBUG] Error calculating widget width:', error);
                // Return default values on error
                return {
                    pillWidth: 350,
                    chatWidth: 380
                };
            }
        }
        
        function updateWidgetWidth() {
            try {
                const { pillWidth, chatWidth } = calculateSafeWidgetWidth();
                
                // Update CSS custom properties
                const widgetElement = shadowRoot.querySelector('.gist-widget');
                if (widgetElement) {
                    widgetElement.style.setProperty('--widget-width', `${pillWidth}px`);
                    widgetElement.style.setProperty('--widget-chat-width', `${chatWidth}px`);
                }
                
                console.log('[GIST DEBUG] Widget width updated:', { pillWidth, chatWidth });
            } catch (error) {
                console.warn('[GIST DEBUG] Error updating widget width:', error);
            }
        }
        
        // Debounced resize handler
        let resizeTimeout;
        function handleResize() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                updateWidgetWidth();
            }, 250);
        }
        

        
        // ================================
        // WEBSITE BRANDING DETECTION
        // ================================
        
        async function extractWebsiteBranding() {
            console.log('[GIST BRANDING] Starting website name detection...');
            
            let siteName = '';
            let siteFont = '';
            let detectionMethod = '';
            let faviconUrl = null;
            
            // Extract favicon first
            const logos = await extractLogosAndIcons();
            faviconUrl = logos.favicon;
            console.log('[GIST BRANDING] Favicon detected:', faviconUrl);
            
            // Method 1: Enhanced Logo/Brand Element Detection
            const logoSelectors = [
                '.logo', '.brand', '.site-title', '.header-logo', '.site-name',
                'h1.site-name', '.site-brand', '.navbar-brand', '.brand-logo',
                '[data-testid="logo"]', '.masthead-logo', '.c-logo', '.site-logo',
                '.header-brand', '.brand-text', '.logo-text', '.site-header h1',
                '.navbar-brand h1', '.header .brand', '.masthead h1',
                '.logo-container', '.brand-container', '.site-branding'
            ];
            
            console.log('[GIST BRANDING] Method 1: Checking logo selectors...');
            
            for (const selector of logoSelectors) {
                const elements = document.querySelectorAll(selector);
                console.log(`[GIST BRANDING] Selector "${selector}" found ${elements.length} elements`);
                
                for (const element of elements) {
                    // Extract text content, handling various scenarios
                    let text = '';
                    
                    // Check for image alt text first
                    const img = element.querySelector('img');
                    if (img && img.alt && img.alt.trim()) {
                        text = img.alt.trim();
                        console.log(`[GIST BRANDING] Found img alt text: "${text}"`);
                    }
                    
                    // Check for aria-label
                    if (!text && element.getAttribute('aria-label')) {
                        text = element.getAttribute('aria-label').trim();
                        console.log(`[GIST BRANDING] Found aria-label: "${text}"`);
                    }
                    
                    // Check for title attribute
                    if (!text && element.getAttribute('title')) {
                        text = element.getAttribute('title').trim();
                        console.log(`[GIST BRANDING] Found title attribute: "${text}"`);
                    }
                    
                    // Check for text content
                    if (!text) {
                        text = (element.textContent || element.innerText || '').trim();
                        console.log(`[GIST BRANDING] Found text content: "${text}"`);
                    }
                    
                    // Clean and validate text
                    if (text && isValidSiteName(text)) {
                        siteName = cleanSiteName(text);
                        detectionMethod = `Logo selector: ${selector}`;
                        
                        // Extract font family
                        const computedStyle = window.getComputedStyle(element);
                        siteFont = computedStyle.fontFamily;
                        
                        console.log(`[GIST BRANDING] ✅ Method 1 SUCCESS: "${siteName}" via ${selector}`);
                        break;
                    } else if (text) {
                        console.log(`[GIST BRANDING] ❌ Invalid site name: "${text}"`);
                    }
                }
                
                if (siteName) break;
            }
            
            // Method 2: Enhanced Meta Tag Detection
            if (!siteName) {
                console.log('[GIST BRANDING] Method 2: Checking meta tags...');
                
                const metaSelectors = [
                    'meta[property="og:site_name"]',
                    'meta[name="application-name"]',
                    'meta[name="apple-mobile-web-app-title"]',
                    'meta[property="twitter:site"]',
                    'meta[name="twitter:site"]',
                    'meta[property="al:web:url"]'
                ];
                
                for (const selector of metaSelectors) {
                    const meta = document.querySelector(selector);
                    if (meta) {
                        let content = meta.content || meta.getAttribute('content') || '';
                        
                        // Clean Twitter handles
                        if (selector.includes('twitter') && content.startsWith('@')) {
                            content = content.substring(1);
                        }
                        
                        console.log(`[GIST BRANDING] Meta tag "${selector}": "${content}"`);
                        
                        if (content && isValidSiteName(content)) {
                            siteName = cleanSiteName(content);
                            detectionMethod = `Meta tag: ${selector}`;
                            console.log(`[GIST BRANDING] ✅ Method 2 SUCCESS: "${siteName}"`);
                            break;
                        }
                    }
                }
            }
            
            // Method 3: Enhanced Document Title Parsing
            if (!siteName) {
                console.log('[GIST BRANDING] Method 3: Parsing document title...');
                
                const title = document.title.trim();
                console.log(`[GIST BRANDING] Document title: "${title}"`);
                
                if (title) {
                    siteName = parseDocumentTitle(title);
                    if (siteName) {
                        detectionMethod = 'Document title parsing';
                        console.log(`[GIST BRANDING] ✅ Method 3 SUCCESS: "${siteName}"`);
                    }
                }
            }
            
            // Method 4: Enhanced Domain Fallback
            if (!siteName) {
                console.log('[GIST BRANDING] Method 4: Using domain fallback...');
                
                siteName = getDomainBasedName();
                detectionMethod = 'Domain fallback';
                console.log(`[GIST BRANDING] ✅ Method 4 FALLBACK: "${siteName}"`);
            }
            
            // Method 5: Font Detection Enhancement
            if (!siteFont) {
                console.log('[GIST BRANDING] Detecting website font...');
                siteFont = detectWebsiteFont();
            }
            
            // Clean up font family
            if (siteFont) {
                siteFont = siteFont.split(',')[0].replace(/['"]/g, '').trim();
                console.log(`[GIST BRANDING] Detected font: "${siteFont}"`);
            }
            
            const result = {
                name: siteName || 'this site',
                font: siteFont || 'inherit',
                method: detectionMethod || 'fallback',
                faviconUrl: faviconUrl
            };
            
            console.log('[GIST BRANDING] 🎯 FINAL RESULT:', result);
            return result;
        }

        // Helper function to validate site names
        function isValidSiteName(text) {
            if (!text || typeof text !== 'string') return false;
            
            const cleaned = text.trim();
            if (cleaned.length < 1 || cleaned.length > 50) return false;
            
            // Filter out common unwanted elements
            const unwantedPatterns = [
                /^(menu|nav|navigation|toggle|close|open|search|login|signup)$/i,
                /^(home|back|next|prev|previous|continue|submit|cancel)$/i,
                /^(skip|skip to|main content|accessibility)$/i,
                /^\d+$/, // Just numbers
                /^[^\w\s]+$/, // Just symbols
                /^(logo|brand|site|website)$/i
            ];
            
            return !unwantedPatterns.some(pattern => pattern.test(cleaned));
        }

        // Helper function to clean site names
        function cleanSiteName(text) {
            return text
                .trim()
                .replace(/\s+/g, ' ') // Normalize whitespace
                .replace(/^(the\s+)/i, '') // Remove leading "The"
                .replace(/(\s+logo|\s+brand|\s+site)$/i, '') // Remove trailing descriptors
                .trim();
        }

        // Enhanced document title parsing
        function parseDocumentTitle(title) {
            const separators = [' | ', ' - ', ' :: ', ' — ', ' – ', ' · ', ' • ', ' / ', ' \\ '];
            
            // Find the best separator
            let parts = [title];
            let usedSeparator = '';
            
            for (const sep of separators) {
                if (title.includes(sep)) {
                    parts = title.split(sep).map(p => p.trim()).filter(p => p.length > 0);
                    usedSeparator = sep;
                    break;
                }
            }
            
            console.log(`[GIST BRANDING] Title parts (sep: "${usedSeparator}"):`, parts);
            
            if (parts.length === 1) {
                return isValidSiteName(parts[0]) ? cleanSiteName(parts[0]) : null;
            }
            
            // Enhanced generic content detection
            const genericPatterns = [
                /^(news|article|blog|post|story|breaking|latest|today|update|report)$/i,
                /^(analysis|opinion|editorial|premium|exclusive|featured|trending)$/i,
                /^(popular|top|live|watch|read|subscribe|free|unlimited)$/i,
                /^(home|homepage|main|index|welcome)$/i,
                /^(about|contact|services|products|solutions)$/i,
                /^\d+/, // Starts with numbers
                /^(page\s+\d+|p\.\s*\d+)$/i // Page numbers
            ];
            
            function isGeneric(text) {
                return genericPatterns.some(pattern => pattern.test(text.trim()));
            }
            
            // Score each part
            const scoredParts = parts.map((part, index) => ({
                text: part,
                index,
                isGeneric: isGeneric(part),
                length: part.length,
                isFirst: index === 0,
                isLast: index === parts.length - 1,
                hasCapitalization: /^[A-Z]/.test(part) && part.length > 1
            }));
            
            console.log('[GIST BRANDING] Scored parts:', scoredParts);
            
            // Selection logic
            const nonGeneric = scoredParts.filter(p => !p.isGeneric);
            
            if (nonGeneric.length === 1) {
                return cleanSiteName(nonGeneric[0].text);
            } else if (nonGeneric.length > 1) {
                // Prefer shorter, capitalized, non-generic parts
                const best = nonGeneric.sort((a, b) => {
                    if (a.hasCapitalization !== b.hasCapitalization) {
                        return b.hasCapitalization - a.hasCapitalization;
                    }
                    return a.length - b.length;
                })[0];
                
                return cleanSiteName(best.text);
            } else {
                // All parts are generic, choose the shortest
                const shortest = scoredParts.sort((a, b) => a.length - b.length)[0];
                return cleanSiteName(shortest.text);
            }
        }

        // Enhanced domain-based name generation
        function getDomainBasedName() {
            const hostname = window.location.hostname.toLowerCase();
            console.log(`[GIST BRANDING] Processing hostname: "${hostname}"`);
            
            // Remove www and common subdomains
            let domain = hostname.replace(/^(www\.|m\.|mobile\.|app\.)/, '');
            
            // Split by dots and take the main part
            const parts = domain.split('.');
            let mainPart = parts[0];
            
            // Handle special cases for news sites and common patterns
            const specialCases = {
                'nytimes': 'The New York Times',
                'washingtonpost': 'The Washington Post',
                'wsj': 'The Wall Street Journal',
                'bbc': 'BBC',
                'cnn': 'CNN',
                'npr': 'NPR',
                'reuters': 'Reuters',
                'bloomberg': 'Bloomberg',
                'techcrunch': 'TechCrunch',
                'venturebeat': 'VentureBeat',
                'theverge': 'The Verge',
                'arstechnica': 'Ars Technica'
            };
            
            if (specialCases[mainPart]) {
                return specialCases[mainPart];
            }
            
            // Clean up hyphenated domains
            if (mainPart.includes('-')) {
                const hyphenParts = mainPart.split('-');
                // Take the longest part or combine short parts
                if (hyphenParts.every(p => p.length <= 3)) {
                    mainPart = hyphenParts.join(' ');
                } else {
                    mainPart = hyphenParts.sort((a, b) => b.length - a.length)[0];
                }
            }
            
            // Capitalize first letter
            return mainPart.charAt(0).toUpperCase() + mainPart.slice(1);
        }

        // Enhanced font detection
        function detectWebsiteFont() {
            const fontSelectors = [
                'h1', 'h2', '.logo', '.brand', '.site-title',
                '.header', '.masthead', 'header', '.navbar-brand'
            ];
            
            for (const selector of fontSelectors) {
                const element = document.querySelector(selector);
                if (element) {
                    const computedStyle = window.getComputedStyle(element);
                    const fontFamily = computedStyle.fontFamily;
                    if (fontFamily && fontFamily !== 'inherit') {
                        console.log(`[GIST BRANDING] Font detected from ${selector}: ${fontFamily}`);
                        return fontFamily;
                    }
                }
            }
            
            return null;
        }
        
        // Add this function to preload detected fonts
        function preloadWebsiteFont(fontFamily) {
            if (!fontFamily || fontFamily === 'inherit') return;
            
            try {
                // Create a hidden element to trigger font loading
                const testElement = document.createElement('div');
                testElement.style.fontFamily = fontFamily;
                testElement.style.position = 'absolute';
                testElement.style.left = '-9999px';
                testElement.style.visibility = 'hidden';
                testElement.textContent = 'Font loading test';
                
                document.body.appendChild(testElement);
                
                // Remove after font loads
                setTimeout(() => {
                    if (testElement.parentNode) {
                        testElement.parentNode.removeChild(testElement);
                    }
                }, 1000);
            } catch (error) {
                console.warn('[GIST DEBUG] Error preloading font:', error);
            }
        }
        
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
                max_tokens: 300, // Reduced from 500 for faster response
                temperature: 0.7, // Add for more consistent speed
                stream: false // Ensure streaming is off
            };
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s instead of 20s
            
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
            
            // Only proceed if we have substantial content to analyze
            if (!context.content || context.content.length < 100) {
                const contextFallbacks = createContextSpecificFallbacks(context, {type: 'article', topics: [], entities: []});
                return contextFallbacks.slice(0, 3);
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
                    
                    // More lenient validation - just ensure it's a question and not too short
                    if (cleaned.endsWith('?') && cleaned.length >= 10) {
                        questions.push(cleaned);
                    }
                }
                
                // Get context fallbacks upfront
                const contextFallbacks = createContextSpecificFallbacks(context, contentAnalysis);
                
                // Combine AI-generated questions with fallbacks to ensure exactly 3
                let finalQuestions = [];
                
                // Add AI-generated questions first
                finalQuestions = questions.slice(0, 3);
                
                // If we don't have enough, add fallbacks
                while (finalQuestions.length < 3 && contextFallbacks.length > 0) {
                    const fallback = contextFallbacks.shift();
                    if (!finalQuestions.includes(fallback)) {
                        finalQuestions.push(fallback);
                    }
                }
                
                // If we still don't have 3 questions, add generic fallbacks
                const genericFallbacks = [
                    "What are the key points discussed in this content?",
                    "How can I learn more about this topic?",
                    "What makes this information important?"
                ];
                
                while (finalQuestions.length < 3) {
                    const fallback = genericFallbacks[finalQuestions.length];
                    finalQuestions.push(fallback);
                }
                
                return finalQuestions.slice(0, 3);
                    
            } catch (error) {
                // Return context-specific fallbacks or generic ones
                const contextFallbacks = createContextSpecificFallbacks(context, contentAnalysis);
                return contextFallbacks.slice(0, 3).length === 3 ? 
                    contextFallbacks.slice(0, 3) : 
                    [
                        "What are the key points discussed in this content?",
                        "How can I learn more about this topic?",
                        "What makes this information important?"
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
                        <div class="gist-skeleton-box" style="width: 85%; background: #f0f0f0;"></div>
                        <div class="gist-skeleton-box" style="width: 70%; background: #f0f0f0;"></div>
                        <div class="gist-skeleton-box" style="width: 90%; background: #f0f0f0;"></div>
                        <div class="gist-skeleton-box" style="width: 60%; background: #f0f0f0;"></div>
                        <div class="gist-skeleton-box" style="width: 75%; background: #f0f0f0;"></div>
                    </div>
                </div>
            `;
            
            loadingContainer.innerHTML = loadingHTML;
            sidebarMessages.appendChild(loadingContainer);
            
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
                    // Show the follow-up questions section with a subtle delay
                    setTimeout(() => {
                        suggestedQuestionsSection.classList.remove('hidden');
                        addFollowUpQuestions(suggestedQuestionsSection, question, answer);
                    }, 200); // 200ms delay for elegant timing
                    

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
                const sidebarInput = shadowRoot.getElementById('gist-sidebar-input');
                
                questionButtons.forEach(button => {
                    button.addEventListener('click', () => {
                        const question = button.dataset.question;
                        if (sidebarInput) {
                            sidebarInput.value = question;
                            // Trigger the question processing
                            processSidebarQuestion(question);
                            // Remove the follow-up questions section after clicking
                            container.style.display = 'none';
                        }
                    });
                });
            
                // Trigger fade-in animation
                container.classList.add('fade-in');
                
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

        // Process user query with optimized loading phases
        async function processUserQuery(question) {
            // Start API call immediately
            const apiPromise = createChatCompletion(question);
            
            // Show loading phases but don't wait for fixed durations
            showSkeletonLoading();
            
            // Set minimum display time for each phase
            const minSkeletonTime = 400;
            const minSourcesTime = 200;
            
            const startTime = Date.now();
            let phaseTimeout;
            let currentPhase = 0;
            
            // Function to advance phases
            const advancePhase = () => {
                if (currentPhase === 0) {
                    showObtainingSources();
                    currentPhase = 1;
                    phaseTimeout = setTimeout(advancePhase, 300);
                } else if (currentPhase === 1) {
                    showGeneratingAnswer();
                    currentPhase = 2;
                }
            };
            
            // Start phase advancement
            phaseTimeout = setTimeout(advancePhase, 400);
            
            try {
                // Wait for API response
                const response = await apiPromise;
                const sources = generateMockAttributions();
                
                // Clear phase timeout if still running
                clearTimeout(phaseTimeout);
                
                // Calculate remaining time to ensure smooth transition
                const elapsed = Date.now() - startTime;
                const minTotalTime = 1000; // 1 second minimum
                if (elapsed < minTotalTime) {
                    await delay(minTotalTime - elapsed);
                }
                
                // Display final answer
                displayFullAnswer(question, response.answer, sources);
                
            } catch (error) {
                clearTimeout(phaseTimeout);
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
            // Get the messages container from shadow DOM
            const messagesContainer = shadowRoot.getElementById('gist-sidebar-messages');
            if (!messagesContainer) {
                console.warn('[WIDGET] Could not find messages container to remove welcome questions');
                return;
            }
            
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
            // Get the messages container from shadow DOM
            const messagesContainer = shadowRoot.getElementById('gist-sidebar-messages');
            if (!messagesContainer) {
                console.warn('[WIDGET] Could not find messages container to remove welcome message');
                return;
            }
            
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

        // Create audio player function
        function createAudioPlayer(question, originalContent) {
            // Remove existing player if any
            const existingPlayer = shadowRoot.querySelector('.gist-audio-player');
            if (existingPlayer) {
                existingPlayer.remove();
            }
            
            // Create audio player container
            const audioPlayer = document.createElement('div');
            audioPlayer.className = 'gist-audio-player';
            
            audioPlayer.innerHTML = `
                <div class="audio-player-container">
                    <!-- Dynamic background canvas -->
                    <canvas id="audio-visualizer" class="audio-visualizer"></canvas>
                    <div class="audio-gradient-overlay"></div>
                    
                    <!-- Header controls -->
                    <div class="audio-player-header">
                        <button class="audio-back-btn" id="audio-back">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="15 18 9 12 15 6"></polyline>
                            </svg>
                        </button>
                        <button class="audio-options-btn">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="1"></circle>
                                <circle cx="12" cy="5" r="1"></circle>
                                <circle cx="12" cy="19" r="1"></circle>
                            </svg>
                        </button>
                    </div>
                    
                    <!-- Main content area -->
                    <div class="audio-content-area">
                        <!-- News card -->
                        <div class="audio-news-card">
                            <div class="news-card-header">
                                <div class="news-source">
                                    <span class="source-logo">G</span>
                                    <span class="source-name">Gist</span>
                                </div>
                                <span class="news-attribution">AI</span>
                            </div>
                            <h3 class="news-title">${question || 'Audio News Update'}</h3>
                            <p class="news-date">${new Date().toLocaleDateString()} · Generated audio content</p>
                            <img src="${extractedStyling.logoUrl || `${BACKEND_BASE_URL}/gist-logo.png`}" alt="Thumbnail" class="news-thumbnail">
                        </div>
                        
                        <!-- Voice selector -->
                        <div class="audio-voice-selector">
                            <label class="voice-label">Voice:</label>
                            <select class="audio-voice-select" id="audio-voice-select">
                                <option value="21m00Tcm4TlvDq8ikWAM">Rachel - American (calm)</option>
                                <option value="yoZ06aMxZJJ28mfd3POQ">Sam - American (raspy)</option>
                                <option value="TxGEqnHWrfWFTfGW9XjX">Josh - American (deep)</option>
                                <option value="piTKgcLEGmPE4e6mEKli">Nicole - American (soft)</option>
                                <option value="SOYHLrjzK2X1ezoPC6cr">Harry - American (anxious)</option>
                                <option value="oWAxZDx7w5VEj9dCyTzz">Grace - Southern American (pleasant)</option>
                                <option value="bVMeCyTHy58xNoL34h3p">Jeremy - Irish (excited)</option>
                                <option value="ZQe5CZNOzWyzPSCn5a3c">James - Australian (calm)</option>
                                <option value="Zlb1dXrM653N07WRdFW3">Joseph - British (articulate)</option>
                                <option value="GBv7mTt0atIp3Br8iCZE">Thomas - American (meditation)</option>
                            </select>
                        </div>
                        
                        <!-- Time display above news card -->
                        <div class="time-label">Live Audio</div>
                        
                        <!-- Black pill button -->
                        <button class="mirror-btn">Mirror</button>
                    </div>
                    
                    <!-- Audio player controls -->
                    <div class="audio-player-controls">
                        <h2 class="player-title">Gist News Snap: ${new Date().toLocaleDateString()}</h2>
                        
                        <!-- Progress bar -->
                        <div class="audio-progress-container">
                            <span class="time-current">0:00</span>
                            <div class="audio-progress-bar">
                                <div class="audio-progress-track"></div>
                                <div class="audio-progress-fill" style="width: 0%;"></div>
                                <div class="audio-progress-handle" style="left: 0%;"></div>
                            </div>
                            <span class="time-total">0:00</span>
                        </div>
                        
                        <!-- Control buttons -->
                        <div class="audio-control-buttons">
                            <button class="audio-shuffle">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="16 3 21 3 21 8"></polyline>
                                    <line x1="4" y1="20" x2="21" y2="3"></line>
                                    <polyline points="21 16 21 21 16 21"></polyline>
                                    <line x1="15" y1="15" x2="21" y2="21"></line>
                                    <line x1="4" y1="4" x2="9" y2="9"></line>
                                </svg>
                            </button>
                            
                            <button class="audio-previous">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polygon points="19 20 9 12 19 4 19 20"></polygon>
                                    <line x1="5" y1="19" x2="5" y2="5"></line>
                                </svg>
                            </button>
                            
                            <button class="audio-play-pause" id="audio-play-pause">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                </svg>
                            </button>
                            
                            <button class="audio-next">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polygon points="5 4 15 12 5 20 5 4"></polygon>
                                    <line x1="19" y1="5" x2="19" y2="19"></line>
                                </svg>
                            </button>
                            
                            <button class="audio-repeat">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="17 1 21 5 17 9"></polyline>
                                    <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                                    <polyline points="7 23 3 19 7 15"></polyline>
                                    <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
                                </svg>
                            </button>
                        </div>
                        
                        <!-- Download button -->
                        <button class="audio-download">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                        </button>
                    </div>
                </div>
            `;
            
            // Add to shadow root
            shadowRoot.appendChild(audioPlayer);
            
            // Initialize visualizer
            function initializeVisualizer() {
                const canvas = shadowRoot.getElementById('audio-visualizer');
                if (!canvas) return;
                
                const ctx = canvas.getContext('2d');
                
                // Set canvas size
                function resizeCanvas() {
                    canvas.width = window.innerWidth;
                    canvas.height = window.innerHeight;
                }
                resizeCanvas();
                window.addEventListener('resize', resizeCanvas);
                
                // Create animated wave effect
                let animationId;
                let time = 0;
                
                function drawWaves() {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    
                    // Create gradient
                    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
                    gradient.addColorStop(0, 'rgba(139, 92, 246, 0.3)');
                    gradient.addColorStop(0.5, 'rgba(236, 72, 153, 0.3)');
                    gradient.addColorStop(1, 'rgba(245, 158, 11, 0.3)');
                    
                    ctx.strokeStyle = gradient;
                    ctx.lineWidth = 2;
                    
                    // Draw multiple wave layers
                    for (let layer = 0; layer < 5; layer++) {
                        ctx.beginPath();
                        
                        for (let x = 0; x < canvas.width; x += 5) {
                            const y = canvas.height / 2 + 
                                Math.sin((x + time) * 0.01 + layer) * 50 * Math.sin(time * 0.001) +
                                Math.sin((x + time) * 0.02 + layer * 2) * 30 +
                                Math.sin((x + time) * 0.005 + layer * 3) * 60;
                            
                            if (x === 0) {
                                ctx.moveTo(x, y);
                            } else {
                                ctx.lineTo(x, y);
                            }
                        }
                        
                        ctx.stroke();
                    }
                    
                    // Draw grid lines
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
                    ctx.lineWidth = 1;
                    
                    // Horizontal lines
                    for (let y = 0; y < canvas.height; y += 40) {
                        ctx.beginPath();
                        ctx.moveTo(0, y);
                        ctx.lineTo(canvas.width, y);
                        ctx.stroke();
                    }
                    
                    // Vertical lines with perspective
                    for (let x = 0; x < canvas.width; x += 40) {
                        ctx.beginPath();
                        ctx.moveTo(x, canvas.height);
                        
                        // Create perspective effect
                        const perspectiveX = x + (x - canvas.width / 2) * 0.5;
                        ctx.lineTo(perspectiveX, 0);
                        ctx.stroke();
                    }
                    
                    time += 2;
                    animationId = requestAnimationFrame(drawWaves);
                }
                
                drawWaves();
                
                // Store animation ID for cleanup
                canvas.dataset.animationId = animationId;
            }
            
            initializeVisualizer();
            
            // Set up event listeners
            function setupAudioPlayerEvents(audioPlayer, question, originalContent) {
                // Shared state variables - store on audioPlayer for persistence
                audioPlayer.isPlaying = false;
                audioPlayer.isDragging = false;
                
                // Back button - return to remix modal
                const backBtn = audioPlayer.querySelector('#audio-back');
                backBtn.addEventListener('click', () => {
                    // Stop visualizer animation
                    const canvas = audioPlayer.querySelector('#audio-visualizer');
                    if (canvas && canvas.dataset.animationId) {
                        cancelAnimationFrame(canvas.dataset.animationId);
                    }
                    
                    // Stop audio if playing
                    if (audioPlayer.audio) {
                        audioPlayer.audio.pause();
                        audioPlayer.audio = null;
                    }
                    
                    // Stop client-side TTS if active
                    if (audioPlayer.speechUtterance) {
                        speechSynthesis.cancel();
                        audioPlayer.speechUtterance = null;
                    }
                    
                    // Hide and remove player
                    audioPlayer.classList.remove('visible');
                    setTimeout(() => {
                        audioPlayer.remove();
                        // Recreate remix modal
                        createRemixModal(originalContent);
                    }, 300);
                });
                
                // Play/pause button
                const playPauseBtn = audioPlayer.querySelector('#audio-play-pause');
                const progressFill = audioPlayer.querySelector('.audio-progress-fill');
                const progressHandle = audioPlayer.querySelector('.audio-progress-handle');
                const currentTimeSpan = audioPlayer.querySelector('.time-current');
                const totalTimeSpan = audioPlayer.querySelector('.time-total');
                
                playPauseBtn.addEventListener('click', async () => {
                    // Handle client-side TTS separately
                    if (audioPlayer.isClientTTS) {
                        if (audioPlayer.isPlaying) {
                            // Stop TTS (can't pause, only stop)
                            speechSynthesis.cancel();
                            audioPlayer.isPlaying = false;
                            audioPlayer.speechUtterance = null;
                            playPauseBtn.innerHTML = `
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                </svg>
                            `;
                        } else {
                            // Regenerate and play TTS
                            playPauseBtn.innerHTML = `
                                <div class="gist-loading-spinner-orange" style="width: 30px; height: 30px;"></div>
                            `;
                            playPauseBtn.disabled = true;
                            await generateAndStreamAudio(audioPlayer, question, originalContent);
                            playPauseBtn.disabled = false;
                        }
                        return;
                    }
                    
                    // If no audio exists yet, generate it first
                    if (!audioPlayer.audio) {
                        // Show loading state
                        playPauseBtn.innerHTML = `
                            <div class="gist-loading-spinner-orange" style="width: 30px; height: 30px;"></div>
                        `;
                        playPauseBtn.disabled = true;
                        
                        // Generate audio
                        await generateAndStreamAudio(audioPlayer, question, originalContent);
                        playPauseBtn.disabled = false;
                        
                        // After audio is loaded, start playing
                        if (audioPlayer.audio) {
                            audioPlayer.audio.play();
                            audioPlayer.isPlaying = true;
                            playPauseBtn.innerHTML = `
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                                    <rect x="6" y="4" width="4" height="16"></rect>
                                    <rect x="14" y="4" width="4" height="16"></rect>
                                </svg>
                            `;
                        }
                        return;
                    }
                    
                    // Toggle play/pause for regular audio
                    if (audioPlayer.isPlaying) {
                        audioPlayer.audio.pause();
                        audioPlayer.isPlaying = false;
                        playPauseBtn.innerHTML = `
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                                <polygon points="5 3 19 12 5 21 5 3"></polygon>
                            </svg>
                        `;
                    } else {
                        audioPlayer.audio.play();
                        audioPlayer.isPlaying = true;
                        playPauseBtn.innerHTML = `
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                                <rect x="6" y="4" width="4" height="16"></rect>
                                <rect x="14" y="4" width="4" height="16"></rect>
                            </svg>
                        `;
                    }
                });
                
                // Progress bar interaction
                const progressBar = audioPlayer.querySelector('.audio-progress-bar');
                
                progressBar.addEventListener('mousedown', startDragging);
                document.addEventListener('mousemove', handleDragging);
                document.addEventListener('mouseup', stopDragging);
                
                function startDragging(e) {
                    audioPlayer.isDragging = true;
                    updateProgress(e);
                }
                
                function handleDragging(e) {
                    if (!audioPlayer.isDragging) return;
                    updateProgress(e);
                }
                
                function stopDragging() {
                    audioPlayer.isDragging = false;
                }
                
                function updateProgress(e) {
                    const rect = progressBar.getBoundingClientRect();
                    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                    
                    progressFill.style.width = `${percent * 100}%`;
                    progressHandle.style.left = `${percent * 100}%`;
                    
                    // Update audio position if audio exists
                    const audio = audioPlayer.audio;
                    if (audio && audio.duration) {
                        audio.currentTime = audio.duration * percent;
                        
                        const minutes = Math.floor(audio.currentTime / 60);
                        const seconds = Math.floor(audio.currentTime % 60);
                        currentTimeSpan.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                    }
                }
                
                // Mirror button
                const mirrorBtn = audioPlayer.querySelector('.mirror-btn');
                mirrorBtn.addEventListener('click', () => {
                    // Animate button press
                    mirrorBtn.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        mirrorBtn.style.transform = 'scale(1)';
                    }, 100);
                    
                    // Show notification
                    showSuccessNotification('Audio mirrored to your library');
                });
                
                // Download button
                const downloadBtn = audioPlayer.querySelector('.audio-download');
                downloadBtn.addEventListener('click', () => {
                    if (audioPlayer.audio && audioPlayer.audioUrl) {
                        const a = document.createElement('a');
                        a.href = audioPlayer.audioUrl;
                        a.download = `gist-audio-${Date.now()}.mp3`;
                        a.click();
                        showSuccessNotification('Audio download started');
                    } else {
                        showErrorNotification('Audio not ready for download');
                    }
                });
                
                // Generate and stream audio content
                async function generateAndStreamAudio(audioPlayer, question, content) {
                    try {
                        // Show loading state
                        const newsTitle = audioPlayer.querySelector('.news-title');
                        if (newsTitle) {
                            newsTitle.textContent = 'Generating audio...';
                        }
                        
                        // Get selected voice ID
                        const voiceSelect = audioPlayer.querySelector('#audio-voice-select');
                        const selectedVoiceId = voiceSelect ? voiceSelect.value : '21m00Tcm4TlvDq8ikWAM';
                        
                        // DEBUG: Log the selected voice
                        console.log('[GIST DEBUG] Selected voice ID:', selectedVoiceId);
                        console.log('[GIST DEBUG] Voice dropdown element:', voiceSelect);
                        
                        const requestPayload = {
                            question: question,
                            text: content?.substring(0, 500), // Limit content length
                            voicePreset: 'news',
                            voiceId: selectedVoiceId
                        };
                        
                        // DEBUG: Log the request
                        console.log('[GIST DEBUG] API request payload:', requestPayload);
                        console.log('[GIST DEBUG] API URL:', `${BACKEND_BASE_URL}/api/generate-audio`);
                        
                        // Call the backend API for audio generation
                        const response = await fetch(`${BACKEND_BASE_URL}/api/generate-audio`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(requestPayload)
                        });
                        
                        // DEBUG: Log response details
                        console.log('[GIST DEBUG] Response status:', response.status);
                        console.log('[GIST DEBUG] Response headers:', Object.fromEntries(response.headers.entries()));
                        console.log('[GIST DEBUG] Response content-type:', response.headers.get('content-type'));
                        
                        // Check content type FIRST before parsing
                        const contentType = response.headers.get('content-type');
                        
                        if (response.ok && contentType?.includes('audio')) {
                            // Handle audio stream from ElevenLabs
                            console.log('[GIST DEBUG] Using ElevenLabs audio stream');
                            const audioBlob = await response.blob();
                            console.log('[GIST DEBUG] Audio blob size:', audioBlob.size, 'bytes');
                            const audioUrl = URL.createObjectURL(audioBlob);
                            
                            // Create audio element
                            const audio = new Audio(audioUrl);
                            audio.id = 'generated-audio';
                            audioPlayer.audio = audio;
                            audioPlayer.audioUrl = audioUrl;
                            
                            // Set up audio event listeners
                            setupAudioEventListeners(audioPlayer, audio, question);
                            
                            // Update UI to show audio is ready
                            const newsTitle = audioPlayer.querySelector('.news-title');
                            if (newsTitle) {
                                newsTitle.textContent = question || 'Audio ready';
                            }
                            
                        } else if (contentType?.includes('application/json')) {
                            // Handle JSON response (TTS fallback)
                            const data = await response.json();
                            console.log('[GIST DEBUG] Response data:', data);
                            
                            if (data.useClientTTS) {
                                // Use client-side TTS with the generated script
                                console.log('[GIST DEBUG] Using client-side TTS fallback');
                                console.log('[GIST DEBUG] TTS script:', data.script);
                                await generateClientSideTTS(audioPlayer, data.script, question);
                            } else {
                                console.log('[GIST DEBUG] JSON response but no useClientTTS flag');
                                throw new Error(data.error || 'Audio generation failed');
                            }
                            
                        } else {
                            console.log('[GIST DEBUG] Unexpected response type');
                            console.log('[GIST DEBUG] Response OK:', response.ok);
                            console.log('[GIST DEBUG] Content-type:', contentType);
                            
                            // Try to get error message if possible
                            let errorMessage = 'Audio generation failed';
                            try {
                                const data = await response.json();
                                errorMessage = data.error || errorMessage;
                            } catch (parseError) {
                                console.log('[GIST DEBUG] Could not parse error response as JSON');
                            }
                            
                            throw new Error(errorMessage);
                        }
                        
                    } catch (error) {
                        console.error('Audio generation failed:', error);
                        
                        // Show error in UI
                        const newsTitle = audioPlayer.querySelector('.news-title');
                        if (newsTitle) {
                            newsTitle.textContent = 'Audio generation failed';
                        }
                        
                        showErrorNotification('Failed to generate audio. Please try again.');
                    }
                }

                // Generate client-side TTS function
                async function generateClientSideTTS(audioPlayer, script, question) {
                    try {
                        // Check if browser supports Speech Synthesis
                        if (!('speechSynthesis' in window)) {
                            throw new Error('Speech synthesis not supported');
                        }
                        
                        // Update UI to show TTS generation
                        const newsTitle = audioPlayer.querySelector('.news-title');
                        if (newsTitle) {
                            newsTitle.textContent = 'Generating speech...';
                        }
                        
                        // Create speech synthesis utterance
                        const utterance = new SpeechSynthesisUtterance(script);
                        
                        // Configure voice settings
                        utterance.rate = 0.9; // Slightly slower for news reading
                        utterance.pitch = 1.0;
                        utterance.volume = 1.0;
                        
                        // Get selected voice from dropdown or use default
                        const voiceSelect = audioPlayer.querySelector('#audio-voice-select');
                        const voices = speechSynthesis.getVoices();
                        
                        let selectedVoice = null;
                        if (voiceSelect && voiceSelect.value && voices.length > 0) {
                            // For client-side TTS, map ElevenLabs voice IDs to browser voices
                            const voiceMap = {
                                '21m00Tcm4TlvDq8ikWAM': 'female', // Rachel
                                'yoZ06aMxZJJ28mfd3POQ': 'male',   // Sam
                                'TxGEqnHWrfWFTfGW9XjX': 'male',   // Josh
                                'piTKgcLEGmPE4e6mEKli': 'female', // Nicole
                                'SOYHLrjzK2X1ezoPC6cr': 'male',   // Harry
                                'oWAxZDx7w5VEj9dCyTzz': 'female', // Grace
                                'bVMeCyTHy58xNoL34h3p': 'male',   // Jeremy
                                'ZQe5CZNOzWyzPSCn5a3c': 'male',   // James
                                'Zlb1dXrM653N07WRdFW3': 'male',   // Joseph
                                'GBv7mTt0atIp3Br8iCZE': 'male'    // Thomas
                            };
                            
                            const preferredGender = voiceMap[voiceSelect.value] || 'female';
                            
                            // Try to find a voice matching the preferred gender
                            selectedVoice = voices.find(voice => 
                                voice.lang.startsWith('en') && 
                                voice.name.toLowerCase().includes(preferredGender === 'female' ? 'female' : 'male')
                            );
                            
                            // Fallback to any English voice
                            if (!selectedVoice) {
                                selectedVoice = voices.find(voice => 
                                    voice.lang.startsWith('en') && 
                                    (voice.name.includes('Google') || voice.name.includes('Microsoft'))
                                ) || voices.find(voice => voice.lang.startsWith('en'));
                            }
                        } else {
                            // Default professional voice selection
                            selectedVoice = voices.find(voice => 
                                voice.lang.startsWith('en') && 
                                (voice.name.includes('Google') || voice.name.includes('Microsoft'))
                            ) || voices.find(voice => voice.lang.startsWith('en'));
                        }
                        
                        if (selectedVoice) {
                            utterance.voice = selectedVoice;
                        }
                        
                        // Create a promise to handle the speech synthesis
                        const speakPromise = new Promise((resolve, reject) => {
                            utterance.onend = () => resolve();
                            utterance.onerror = (event) => reject(new Error('Speech synthesis failed: ' + event.error));
                        });
                        
                        // Store the utterance for control
                        audioPlayer.speechUtterance = utterance;
                        audioPlayer.isClientTTS = true;
                        audioPlayer.isPlaying = true;
                        
                        // Set up play/pause controls for TTS
                        const playPauseBtn = audioPlayer.querySelector('#audio-play-pause');
                        if (playPauseBtn) {
                            playPauseBtn.innerHTML = `
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                                    <rect x="6" y="4" width="4" height="16"></rect>
                                    <rect x="14" y="4" width="4" height="16"></rect>
                                </svg>
                            `;
                        }
                        
                        // Add event handlers for TTS completion
                        utterance.onend = () => {
                            audioPlayer.isPlaying = false;
                            audioPlayer.speechUtterance = null;
                            if (playPauseBtn) {
                                playPauseBtn.innerHTML = `
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                    </svg>
                                `;
                            }
                        };
                        
                        utterance.onerror = (event) => {
                            console.error('Speech synthesis error:', event.error);
                            audioPlayer.isPlaying = false;
                            audioPlayer.speechUtterance = null;
                            if (playPauseBtn) {
                                playPauseBtn.innerHTML = `
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                    </svg>
                                `;
                            }
                            showErrorNotification('Speech synthesis failed: ' + event.error);
                        };
                        
                        // Start speaking
                        speechSynthesis.speak(utterance);
                        
                        // Update UI to show it's ready
                        if (newsTitle) {
                            newsTitle.textContent = question || 'Audio News Update';
                        }
                        
                    } catch (error) {
                        console.error('Client-side TTS failed:', error);
                        
                        // Show error in UI
                        const newsTitle = audioPlayer.querySelector('.news-title');
                        if (newsTitle) {
                            newsTitle.textContent = 'Speech generation failed';
                        }
                        
                        showErrorNotification('Browser speech synthesis failed');
                    }
                }

                // Setup audio event listeners for ElevenLabs audio
                function setupAudioEventListeners(audioPlayer, audio, question) {
                    const playPauseBtn = audioPlayer.querySelector('#audio-play-pause');
                    const progressFill = audioPlayer.querySelector('.audio-progress-fill');
                    const progressHandle = audioPlayer.querySelector('.audio-progress-handle');
                    const currentTimeSpan = audioPlayer.querySelector('.time-current');
                    const totalTimeSpan = audioPlayer.querySelector('.time-total');
                    
                    // Update total duration when metadata loads
                    audio.addEventListener('loadedmetadata', () => {
                        const duration = audio.duration;
                        const minutes = Math.floor(duration / 60);
                        const seconds = Math.floor(duration % 60);
                        totalTimeSpan.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                        
                        // Update news title
                        const newsTitle = audioPlayer.querySelector('.news-title');
                        if (newsTitle) {
                            newsTitle.textContent = question || 'Audio ready';
                        }
                    });
                    
                    // Update progress bar as audio plays
                    audio.addEventListener('timeupdate', () => {
                        if (!audioPlayer.isDragging && audio.duration) {
                            const percent = (audio.currentTime / audio.duration) * 100;
                            progressFill.style.width = `${percent}%`;
                            progressHandle.style.left = `${percent}%`;
                            
                            const minutes = Math.floor(audio.currentTime / 60);
                            const seconds = Math.floor(audio.currentTime % 60);
                            currentTimeSpan.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                        }
                    });
                    
                    // Handle audio ended
                    audio.addEventListener('ended', () => {
                        audioPlayer.isPlaying = false;
                        playPauseBtn.innerHTML = `
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                                <polygon points="5 3 19 12 5 21 5 3"></polygon>
                            </svg>
                        `;
                        // Reset progress
                        progressFill.style.width = '0%';
                        progressHandle.style.left = '0%';
                        currentTimeSpan.textContent = '0:00';
                    });
                    
                    // Handle play event (in case audio is played from elsewhere)
                    audio.addEventListener('play', () => {
                        audioPlayer.isPlaying = true;
                        playPauseBtn.innerHTML = `
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                                <rect x="6" y="4" width="4" height="16"></rect>
                                <rect x="14" y="4" width="4" height="16"></rect>
                            </svg>
                        `;
                    });
                    
                    // Handle pause event
                    audio.addEventListener('pause', () => {
                        audioPlayer.isPlaying = false;
                        playPauseBtn.innerHTML = `
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                                <polygon points="5 3 19 12 5 21 5 3"></polygon>
                            </svg>
                        `;
                    });
                    
                    // Handle errors
                    audio.addEventListener('error', (e) => {
                        console.error('Audio playback error:', e);
                        const newsTitle = audioPlayer.querySelector('.news-title');
                        if (newsTitle) {
                            newsTitle.textContent = 'Audio playback failed';
                        }
                        showErrorNotification('Audio playback failed');
                    });
                }

                // Add voice change handler
                const voiceSelect = audioPlayer.querySelector('#audio-voice-select');
                if (voiceSelect) {
                    voiceSelect.addEventListener('change', () => {
                        // Stop current audio if playing
                        if (audioPlayer.audio) {
                            audioPlayer.audio.pause();
                            audioPlayer.audio = null;
                        }
                        
                        // Stop client-side TTS if active
                        if (audioPlayer.speechUtterance) {
                            speechSynthesis.cancel();
                            audioPlayer.speechUtterance = null;
                        }
                        
                        // Show loading state
                        const newsTitle = audioPlayer.querySelector('.news-title');
                        if (newsTitle) {
                            newsTitle.textContent = 'Switching voice...';
                        }
                        
                        // Reset play button
                        const playPauseBtn = audioPlayer.querySelector('#audio-play-pause');
                        if (playPauseBtn) {
                            playPauseBtn.innerHTML = `
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                </svg>
                            `;
                        }
                        
                        // Reset progress
                        const progressFill = audioPlayer.querySelector('.audio-progress-fill');
                        const progressHandle = audioPlayer.querySelector('.audio-progress-handle');
                        const currentTime = audioPlayer.querySelector('.time-current');
                        if (progressFill) progressFill.style.width = '0%';
                        if (progressHandle) progressHandle.style.left = '0%';
                        if (currentTime) currentTime.textContent = '0:00';
                        
                        // Regenerate with new voice
                        setTimeout(() => {
                            generateAndStreamAudio(audioPlayer, question, originalContent);
                        }, 500); // Small delay for UX
                    });
                }

                // Don't auto-generate audio - let user click play first
                // generateAndStreamAudio(audioPlayer, question, originalContent);
            }
            
            setupAudioPlayerEvents(audioPlayer, question, originalContent);
            
            // Show with animation
            setTimeout(() => {
                audioPlayer.classList.add('visible');
            }, 10);
        }

        // Create remix modal
        function createRemixModal(content) {
            // Get the last user question, default to empty if none
            const lastQuestion = window.lastUserQuestion || '';
            
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
                    
                    <div class="gist-remix-body">
                        <div class="gist-remix-tab-content" id="remix-tab-content">
                            <div class="gist-remix-preview">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                    <circle cx="8.5" cy="8.5" r="1.5"/>
                                    <polyline points="21,15 16,10 5,21"/>
                                </svg>
                                <span>Your image remix preview will appear here</span>
                            </div>
                            
                            <!-- Moved dropdowns here, below the preview -->
                            <div class="gist-remix-options">
                                <div class="gist-remix-option-group">
                                    <button class="gist-remix-dropdown" data-dropdown="tone">
                                        <span>Tone</span>
                                        <span class="dropdown-arrow">◇</span>
                                    </button>
                                    <div class="gist-remix-dropdown-content" data-content="tone">
                                        <select class="gist-remix-select" id="remix-tone">
                                            <option value="professional">Professional</option>
                                            <option value="casual">Casual</option>
                                            <option value="humorous">Humorous</option>
                                            <option value="serious">Serious</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div class="gist-remix-option-group">
                                    <button class="gist-remix-dropdown" data-dropdown="style">
                                        <span>Style</span>
                                        <span class="dropdown-arrow">◇</span>
                                    </button>
                                    <div class="gist-remix-dropdown-content" data-content="style">
                                        <select class="gist-remix-select" id="remix-style">
                                            <option value="minimalist">Minimalist</option>
                                            <option value="creative">Creative</option>
                                            <option value="bold">Bold</option>
                                            <option value="elegant">Elegant</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div class="gist-remix-option-group">
                                    <button class="gist-remix-dropdown" data-dropdown="format">
                                        <span>Format</span>
                                        <span class="dropdown-arrow">◇</span>
                                    </button>
                                    <div class="gist-remix-dropdown-content" data-content="format">
                                        <select class="gist-remix-select" id="remix-format">
                                            <option value="square">Square (1:1)</option>
                                            <option value="landscape">Landscape (16:9)</option>
                                            <option value="portrait">Portrait (9:16)</option>
                                            <option value="story">Story (9:16)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="gist-remix-suggestions">
                                <div class="gist-remix-suggestion-card" data-suggestion="Make a meme about the Trump visa situation">
                                    <div class="gist-remix-plus-icon">✨</div>
                                    <div class="gist-remix-suggestion-text">Make a meme about the Trump visa situation</div>
                                </div>
                                <div class="gist-remix-suggestion-card" data-suggestion="A TikTok about the Taylor Swift drama">
                                    <div class="gist-remix-plus-icon">✨</div>
                                    <div class="gist-remix-suggestion-text">A TikTok about the Taylor Swift drama</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="gist-remix-input-container">
                        <div class="gist-remix-search-wrapper">
                            <input 
                                type="text" 
                                class="gist-remix-input" 
                                placeholder="Remix..." 
                                id="gist-remix-input"
                                value="${lastQuestion.replace(/"/g, '&quot;')}"
                            >
                            <button class="gist-remix-voice-btn" title="Voice input">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                                    <line x1="12" y1="19" x2="12" y2="23"></line>
                                    <line x1="8" y1="23" x2="16" y2="23"></line>
                                </svg>
                            </button>
                            <button class="gist-remix-create-btn" id="gist-remix-submit">Create</button>
                        </div>
                    </div>
                </div>
            `;
            
            // Add to shadow root
            shadowRoot.appendChild(modal);

            // Get elements
            const closeBtn = modal.querySelector('.gist-remix-close');
            const tabs = modal.querySelectorAll('.gist-remix-tab');
            const submitBtn = modal.querySelector('#gist-remix-submit');
            const suggestionCards = modal.querySelectorAll('.gist-remix-suggestion-card');
            const remixInput = modal.querySelector('#gist-remix-input');
            const searchWrapper = modal.querySelector('.gist-remix-search-wrapper');

            let selectedType = 'image';

            // Helper function to update suggestions
            function updateSuggestions(type, question) {
                const suggestionsContainer = modal.querySelector('.gist-remix-suggestions');
                if (!suggestionsContainer) return;
                
                let suggestions = [];
                
                switch(type) {
                    case 'image':
                        suggestions = [
                            `Create a ${question ? 'visual representation of ' + question : 'futuristic cityscape'}`,
                            `Design an infographic about ${question || 'this topic'}`
                        ];
                        break;
                    case 'video':
                        suggestions = [
                            `Make a TikTok explaining ${question || 'this concept'}`,
                            `Create a short video tutorial about ${question || 'this'}`
                        ];
                        break;
                    case 'audio':
                        suggestions = [
                            `Generate a podcast intro about ${question || 'this topic'}`,
                            `Create background music for ${question || 'this content'}`
                        ];
                        break;
                    case 'meme':
                        suggestions = [
                            `Make a meme about ${question || 'current events'}`,
                            `Create a funny take on ${question || 'this situation'}`
                        ];
                        break;
                }
                
                suggestionsContainer.innerHTML = suggestions.map(suggestion => `
                    <div class="gist-remix-suggestion-card" data-suggestion="${suggestion}">
                        <div class="gist-remix-plus-icon">✨</div>
                        <div class="gist-remix-suggestion-text">${suggestion}</div>
                    </div>
                `).join('');
                
                // Re-attach click handlers
                const newCards = suggestionsContainer.querySelectorAll('.gist-remix-suggestion-card');
                newCards.forEach(card => {
                    card.addEventListener('click', () => {
                        remixInput.value = card.dataset.suggestion;
                        remixInput.focus();
                    });
                });
            }

            // Add dropdown toggle functionality
            const dropdownButtons = modal.querySelectorAll('.gist-remix-dropdown');
            dropdownButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const dropdown = button.dataset.dropdown;
                    const content = modal.querySelector(`[data-content="${dropdown}"]`);
                    
                    // Close other dropdowns
                    modal.querySelectorAll('.gist-remix-dropdown-content').forEach(el => {
                        if (el !== content) el.classList.remove('show');
                    });
                    modal.querySelectorAll('.gist-remix-dropdown').forEach(btn => {
                        if (btn !== button) btn.classList.remove('open');
                    });
                    
                    // Toggle current dropdown
                    content.classList.toggle('show');
                    button.classList.toggle('open');
                });
            });

            // Close dropdowns when clicking outside
            modal.addEventListener('click', (e) => {
                if (!e.target.closest('.gist-remix-option-group')) {
                    modal.querySelectorAll('.gist-remix-dropdown-content').forEach(el => {
                        el.classList.remove('show');
                    });
                    modal.querySelectorAll('.gist-remix-dropdown').forEach(btn => {
                        btn.classList.remove('open');
                    });
                }
            });

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
                    
                    // Special handling for audio tab
                    if (selectedType === 'audio') {
                        // Hide the remix modal
                        modal.classList.remove('visible');
                        setTimeout(() => {
                            modal.remove();
                            // Create and show audio player
                            createAudioPlayer(lastQuestion, content);
                        }, 300);
                        return;
                    }
                    
                    // Update preview area based on selected type
                    const previewArea = modal.querySelector('.gist-remix-preview');
                    if (selectedType === 'video') {
                        // Show video player for video tab
                        previewArea.innerHTML = `
                            <video 
                                controls 
                                style="width: 100%; height: 100%; object-fit: contain; border-radius: 8px; background: #000;"
                                poster=""
                                preload="metadata"
                            >
                                <source src="${BACKEND_BASE_URL}/Avatar IV Video (4).mp4" type="video/mp4">
                                Your browser does not support the video tag.
                            </video>
                        `;
                    } else if (selectedType === 'image') {
                        // Reset to image preview
                        previewArea.innerHTML = `
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                <circle cx="8.5" cy="8.5" r="1.5"/>
                                <polyline points="21,15 16,10 5,21"/>
                            </svg>
                            <span>Your image remix preview will appear here</span>
                        `;
                    } else {
                        // Default preview for other types
                        const icons = {
                            meme: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                <circle cx="12" cy="12" r="10"/>
                                <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                                <line x1="9" y1="9" x2="9.01" y2="9"/>
                                <line x1="15" y1="9" x2="15.01" y2="9"/>
                            </svg>`
                        };
                        
                        previewArea.innerHTML = `
                            ${icons[selectedType] || icons.meme}
                            <span>Your ${selectedType} remix preview will appear here</span>
                        `;
                    }
                    
                    // Update placeholder based on type
                    const placeholders = {
                        image: `Create an image of ${lastQuestion || 'your idea'}...`,
                        video: `Create a video about ${lastQuestion || 'your topic'}...`,
                        audio: `Create audio for ${lastQuestion || 'your content'}...`,
                        meme: `Make a meme about ${lastQuestion || 'this'}...`
                    };
                    remixInput.placeholder = placeholders[selectedType] || 'Describe your remix...';
                    
                    // Update suggestion cards based on type
                    updateSuggestions(selectedType, lastQuestion);
                });
            });

            // Suggestion cards
            suggestionCards.forEach(card => {
                card.addEventListener('click', () => {
                    const suggestion = card.dataset.suggestion;
                    remixInput.value = suggestion;
                    remixInput.focus();
                    // Add visual feedback
                    card.style.background = '#333';
                    setTimeout(() => {
                        card.style.background = '#2a2a2a';
                    }, 200);
                });
            });

            // Submit function
            const submitRemix = async () => {
                const inputValue = remixInput.value.trim();
                if (!inputValue) return;
                
                // Add loading state
                submitBtn.classList.add('loading');
                
                // Disable input during generation
                remixInput.disabled = true;
                
                // Get selected options
                const tone = modal.querySelector('#remix-tone')?.value || 'professional';
                const style = modal.querySelector('#remix-style')?.value || 'minimalist';
                const format = modal.querySelector('#remix-format')?.value || 'square';
                
                // Update preview to show loading
                const previewArea = modal.querySelector('.gist-remix-preview');
                if (previewArea) {
                    previewArea.innerHTML = `
                        <div class="gist-loading-spinner-orange" style="width: 40px; height: 40px; border-width: 4px;"></div>
                        <span>Generating your ${selectedType}...</span>
                    `;
                }
                
                try {
                    // Call the API
                    const response = await fetch(`${BACKEND_BASE_URL}/api/generate-image`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            prompt: inputValue,
                            style: style,
                            format: format
                        })
                    });
                    
                    const data = await response.json();
                    
                    if (data.success && data.imageUrl) {
                        // Update preview with generated image
                        if (previewArea) {
                            previewArea.innerHTML = `
                                <div style="position: relative; width: 100%; height: 100%;">
                                    <img src="${data.imageUrl}" alt="Generated image" style="width: 100%; height: 100%; object-fit: contain; border-radius: 8px;">
                                    <div style="position: absolute; bottom: 10px; right: 10px; display: flex; gap: 8px;">
                                        <button onclick="window.open('${data.imageUrl}', '_blank')" style="background: rgba(0,0,0,0.7); color: white; border: none; padding: 8px 16px; border-radius: 20px; cursor: pointer; font-size: 14px;">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 4px;">
                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                                <polyline points="7 10 12 15 17 10"></polyline>
                                                <line x1="12" y1="15" x2="12" y2="3"></line>
                                            </svg>
                                            Download
                                        </button>
                                    </div>
                                </div>
                            `;
                        }
                        
                        // Show success message
                        showSuccessNotification('Image generated successfully!');
                        
                    } else {
                        throw new Error(data.error || 'Failed to generate image');
                    }
                    
                } catch (error) {
                    console.error('Image generation error:', error);
                    
                    // Show error in preview
                    if (previewArea) {
                        previewArea.innerHTML = `
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="1.5">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                            <span style="color: #ef4444;">Failed to generate image</span>
                            <span style="font-size: 14px; color: #9ca3af; margin-top: 8px;">${error.message}</span>
                        `;
                    }
                    
                    // Show error notification
                    showErrorNotification(error.message || 'Failed to generate image');
                    
                } finally {
                    // Reset button and input
                    submitBtn.classList.remove('loading');
                    remixInput.disabled = false;
                    remixInput.value = '';
                }
            };

            // Submit button click
            submitBtn.addEventListener('click', submitRemix);

            // Enter key submission
            remixInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    submitRemix();
                }
            });

            // Focus input when clicking search wrapper
            searchWrapper.addEventListener('click', () => {
                remixInput.focus();
            });

            // ESC key to close modal
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && modal.classList.contains('visible')) {
                    modal.classList.remove('visible');
                    setTimeout(() => modal.remove(), 300);
                }
            });

            // Show modal with animation
            setTimeout(() => {
                modal.classList.add('visible');
                // Auto-focus the input after modal animation
                setTimeout(() => {
                    remixInput.focus();
                }, 300);
            }, 10);
        }

        // Success notification function
        function showSuccessNotification(message) {
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                bottom: 80px;
                left: 50%;
                transform: translateX(-50%);
                background: #10b981;
                color: white;
                padding: 12px 24px;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 500;
                box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
                z-index: 10003;
                opacity: 0;
                transition: opacity 0.3s ease;
            `;
            notification.textContent = message;
            
            shadowRoot.appendChild(notification);
            
            setTimeout(() => {
                notification.style.opacity = '1';
            }, 10);
            
            setTimeout(() => {
                notification.style.opacity = '0';
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }

        // Error notification function
        function showErrorNotification(message) {
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                bottom: 80px;
                left: 50%;
                transform: translateX(-50%);
                background: #ef4444;
                color: white;
                padding: 12px 24px;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 500;
                box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
                z-index: 10003;
                opacity: 0;
                transition: opacity 0.3s ease;
            `;
            notification.textContent = message;
            
            shadowRoot.appendChild(notification);
            
            setTimeout(() => {
                notification.style.opacity = '1';
            }, 10);
            
            setTimeout(() => {
                notification.style.opacity = '0';
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }

        // Create remix content
        function createRemixContent(selectedType, style, format, content, tone = 'professional') {
            console.log('Creating remix content:', {
                type: selectedType,
                style: style,
                format: format,
                tone: tone,
                content: content.substring(0, 200) + '...'
            });

            // Show success message temporarily
            const successMessage = document.createElement('div');
            successMessage.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: linear-gradient(135deg, #f59e0b 0%, #fb923c 100%);
                color: white;
                padding: 16px 24px;
                border-radius: 12px;
                font-size: 14px;
                font-weight: 500;
                z-index: 10002;
                box-shadow: 0 8px 25px rgba(245, 158, 11, 0.4);
                opacity: 0;
                transition: opacity 0.3s ease;
            `;
            successMessage.textContent = `Creating ${selectedType} with ${tone} tone in ${format} format...`;
            
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

        
        // ================================
        // SIDEBAR FUNCTIONS
        // ================================
        
        function openSidebar() {
            console.log('[WIDGET] Opening sidebar');
            sidebarHasBeenOpened = true; // Track that sidebar has been opened
            if (sidebar && sidebarOverlay) {
                // Debug positioning
                const sidebarRect = sidebar.getBoundingClientRect();
                console.log('[WIDGET] Sidebar position before open:', {
                    right: sidebarRect.right,
                    left: sidebarRect.left,
                    width: sidebarRect.width,
                    viewportWidth: window.innerWidth
                });
                
                // Add classes to slide in from right
                sidebar.classList.add('open');
                sidebarOverlay.classList.add('visible');
                
                // Debug positioning after open
                setTimeout(() => {
                    const sidebarRectAfter = sidebar.getBoundingClientRect();
                    console.log('[WIDGET] Sidebar position after open:', {
                        right: sidebarRectAfter.right,
                        left: sidebarRectAfter.left,
                        width: sidebarRectAfter.width,
                        viewportWidth: window.innerWidth
                    });
                }, 100);
                
                // Load suggested questions if not already loaded
                loadSidebarSuggestions();
                
                console.log('[WIDGET] Sidebar opened successfully');
            } else {
                console.error('[WIDGET] Could not find sidebar or overlay elements');
            }
        }

        function closeSidebar() {
            console.log('[WIDGET] Closing sidebar');
            if (sidebar && sidebarOverlay) {
                // Remove classes to slide out to right
                sidebar.classList.remove('open');
                sidebarOverlay.classList.remove('visible');
                
                console.log('[WIDGET] Sidebar closed successfully');
            } else {
                console.error('[WIDGET] Could not find sidebar or overlay elements');
            }
        }

        async function loadSidebarSuggestions() {
            const suggestionsContainer = shadowRoot.querySelector('.gist-sidebar-suggestions');
            if (!suggestionsContainer) {
                console.log('[WIDGET] No suggestions container found in sidebar');
                return;
            }
            
            try {
                // Use existing generateSuggestedQuestions function
                const questions = await generateSuggestedQuestions();
                
                if (questions.length > 0) {
                    suggestionsContainer.innerHTML = questions.map(question => `
                        <div class="gist-sidebar-suggestion" data-question="${question}">
                            ${question}
                        </div>
                    `).join('');
                    
                    // Add click handlers
                    suggestionsContainer.querySelectorAll('.gist-sidebar-suggestion').forEach(btn => {
                        btn.addEventListener('click', () => {
                            const question = btn.dataset.question;
                            console.log('[WIDGET] Sidebar suggestion clicked:', question);
                            // Process the question in sidebar
                            processSidebarQuestion(question);
                        });
                    });
                    
                    console.log('[WIDGET] Loaded', questions.length, 'sidebar suggestions with click handlers');
                } else {
                    suggestionsContainer.innerHTML = '<div class="gist-suggestions-loading">No suggestions available</div>';
                }
            } catch (error) {
                console.error('[WIDGET] Error loading sidebar suggestions:', error);
                suggestionsContainer.innerHTML = '<div class="gist-suggestions-loading">Unable to load suggestions</div>';
            }
        }

        async function processSidebarQuestion(question) {
            console.log('[WIDGET] processSidebarQuestion called with:', question);
            
            const messagesContainer = shadowRoot.getElementById('gist-sidebar-messages');
            const suggestionsSection = shadowRoot.getElementById('gist-sidebar-suggestions');
            
            console.log('[WIDGET] Elements found:', {
                messagesContainer: !!messagesContainer,
                suggestionsSection: !!suggestionsSection
            });
            
            if (!messagesContainer) {
                console.error('[WIDGET] No messages container found! Cannot process question.');
                return;
            }
            
            // Hide suggestions section when processing a question
            if (suggestionsSection) {
                console.log('[WIDGET] Hiding suggestions section');
                suggestionsSection.style.display = 'none';
            }
            
            // Add the question to conversation history for context
            console.log('[WIDGET] Adding user message to history');
            addUserMessage(question);
            
            // Remove welcome message if this is the first user message
            if (!hasUserSentMessage) {
                console.log('[WIDGET] First user message - removing welcome message');
                hasUserSentMessage = true;
                removeWelcomeMessage();
            }
            
            try {
                console.log('[WIDGET] Creating loading container');
                // Create a container for this Q&A session
                const loadingContainer = document.createElement('div');
                loadingContainer.className = 'gist-qa-session';
                loadingContainer.id = 'current-loading-session';
                
                // Phase 1: Skeleton loading
                console.log('[WIDGET] Starting Phase 1: Skeleton loading');
                const skeletonHTML = `
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
                
                loadingContainer.innerHTML = skeletonHTML;
                messagesContainer.appendChild(loadingContainer);
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
                
                console.log('[WIDGET] Loading container added to DOM, waiting for SKELETON_DURATION');
                await delay(WIDGET_CONFIG.SKELETON_DURATION);
                
                // Phase 2: Obtaining sources
                loadingContainer.innerHTML = `
                    <div class="gist-loading-phase">
                        <div class="gist-loading-header">
                            <div class="gist-loading-spinner-orange"></div>
                            <span>Obtaining sources</span>
                        </div>
                    </div>
                `;
                
                await delay(WIDGET_CONFIG.SOURCES_DURATION);
                
                // Phase 3: Generating answer
                loadingContainer.innerHTML = `
                    <div class="gist-loading-phase">
                        <div class="gist-loading-header">
                            <div class="gist-loading-spinner-orange"></div>
                            <span>Generating answer</span>
                        </div>
                    </div>
                `;
                
                await delay(WIDGET_CONFIG.GENERATING_DURATION);
                
                // Get API response
                const response = await createChatCompletion(question);
                const sources = generateMockAttributions();
                
                // Phase 4: Display final answer with rich layout
                loadingContainer.removeAttribute('id');
                loadingContainer.innerHTML = ''; // Clear loading
                
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
                
                // Build answer inside the container
                loadingContainer.appendChild(answerLayout);
                
                // Start typewriter effect
                typewriterEffect(response.answer, uniqueId, () => {
                    const footer = loadingContainer.querySelector('.gist-engagement-footer');
                    if (footer) {
                        footer.classList.remove('hidden');
                        footer.classList.add('fade-in');
                    }
                });
                
                // Generate and add follow-up questions after typewriter completes
                setTimeout(async () => {
                    setTimeout(() => {
                        suggestedQuestionsSection.classList.remove('hidden');
                        addFollowUpQuestions(suggestedQuestionsSection, question, response.answer);
                    }, 200);
                }, response.answer.length * 5 + 500);
                
                // Add event listeners for engagement buttons
                setTimeout(() => {
                    const likeBtn = engagementFooter.querySelector('.gist-like-btn');
                    const dislikeBtn = engagementFooter.querySelector('.gist-dislike-btn');
                    const shareBtn = engagementFooter.querySelector('.gist-share-btn');
                    const remixBtn = engagementFooter.querySelector('.gist-remix-btn');
                    
                    if (likeBtn) {
                        likeBtn.addEventListener('click', () => {
                            likeBtn.classList.toggle('active');
                            if (likeBtn.classList.contains('active')) {
                                dislikeBtn.classList.remove('active');
                            }
                        });
                    }
                    
                    if (dislikeBtn) {
                        dislikeBtn.addEventListener('click', () => {
                            dislikeBtn.classList.toggle('active');
                            if (dislikeBtn.classList.contains('active')) {
                                likeBtn.classList.remove('active');
                            }
                        });
                    }
                    
                    if (shareBtn) {
                        shareBtn.addEventListener('click', async () => {
                            if (navigator.share) {
                                try {
                                    await navigator.share({
                                        title: question,
                                        text: response.answer.substring(0, 200) + '...',
                                        url: window.location.href
                                    });
                                } catch (err) {
                                    console.log('Share cancelled');
                                }
                            } else {
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
                    }
                    
                    if (remixBtn) {
                        remixBtn.addEventListener('click', () => {
                            createRemixModal(response.answer);
                        });
                    }
                }, 100);
                
                // Scroll to show the new answer
                setTimeout(() => {
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                }, 100);
                
            } catch (error) {
                console.error('[WIDGET] Error processing question:', error);
                
                // Add error message
                const errorMessage = document.createElement('div');
                errorMessage.className = 'gist-ai-message error';
                errorMessage.innerHTML = `
                    <div class="gist-ai-avatar">G</div>
                    <div class="gist-message-content">
                        <div class="gist-message-text">Sorry, I encountered an error processing your question. Please try again.</div>
                    </div>
                `;
                messagesContainer.appendChild(errorMessage);
                
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
        }

        // Collapsible Widget Setup with Floating Suggestions
        function setupCollapsibleWidget() {
            let isExpanded = false;
            let suggestionsVisible = false;
            
            function toggleWidget() {
                isExpanded = !isExpanded;
                
                if (isExpanded) {
                    searchBar.classList.remove('collapsed');
                    searchBar.classList.add('expanded');
                    
                    // Focus input and show suggestions immediately
                    input.focus();
                    showFloatingSuggestions();
            } else {
                    searchBar.classList.remove('expanded');
                    searchBar.classList.add('collapsed');
                    
                    // Hide suggestions and clear input
                    hideFloatingSuggestions();
                    input.value = '';
                    input.blur();
                }
                
                console.log('[WIDGET] Widget toggled:', isExpanded ? 'expanded' : 'collapsed');
            }
            
            function showFloatingSuggestions() {
                if (!suggestionsVisible && floatingSuggestions) {
                    suggestionsVisible = true;
                    floatingSuggestions.classList.add('visible');
                    loadFloatingSuggestions();
                    console.log('[WIDGET] Floating suggestions shown');
                }
            }
            
            function hideFloatingSuggestions() {
                if (suggestionsVisible && floatingSuggestions) {
                    suggestionsVisible = false;
                    floatingSuggestions.classList.remove('visible');
                    console.log('[WIDGET] Floating suggestions hidden');
                }
            }
            
            // Click handler for the entire search bar when collapsed
            searchBar.addEventListener('click', (e) => {
                if (!isExpanded) {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleWidget();
                }
            });
            
            // Specific click handler for logo (favicon) when collapsed
            if (logo) {
                logo.addEventListener('click', (e) => {
                    if (!isExpanded) {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('[WIDGET] Logo/favicon clicked - expanding widget');
                        toggleWidget();
                    }
                });
            }
            
            // Click handler for arrow button
            arrowBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                if (isExpanded) {
                    const question = input.value.trim();
                    
                    if (question) {
                        console.log('[WIDGET] Arrow clicked with question - opening chat:', question);
                        openChatWithQuestion(question);
                    } else {
                        // Otherwise collapse
                        toggleWidget();
                    }
                } else {
                    // If collapsed, expand
                    toggleWidget();
                }
            });
            
            // Prevent input clicks from bubbling when expanded
            input.addEventListener('click', (e) => {
                e.stopPropagation();
            });
            
            // Handle Enter key
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    const question = e.target.value.trim();
                    
                    if (question) {
                        console.log('[WIDGET] Enter pressed with question - opening chat:', question);
                        openChatWithQuestion(question);
                    }
                }
                
                if (e.key === 'Escape') {
                    toggleWidget();
                }
            });
            
            // Close on click outside
            document.addEventListener('click', (e) => {
                if (isExpanded && !searchBar.contains(e.target) && !floatingSuggestions.contains(e.target)) {
                    toggleWidget();
                }
            });
        }
        
        // Load floating suggestions function
        async function loadFloatingSuggestions() {
            const container = shadowRoot.getElementById('floating-suggestions');
            if (!container) return;
            
            try {
                // Ensure container is visible
                container.classList.add('visible');
                
                // Define fallback questions if not already defined
                if (!window.FALLBACK_QUESTIONS) {
                    window.FALLBACK_QUESTIONS = [
                        "What are the key points discussed in this content?",
                        "How might this impact the industry?",
                        "What are the main findings discussed here?"
                    ];
                }
                
                let questions = [];
                
                // Use pre-generated questions if available
                if (window.pregeneratedQuestions && window.pregeneratedQuestions.length === 3) {
                    // If we have pregenerated questions, use them and don't update
                    questions = window.pregeneratedQuestions;
                } else {
                    // Use fallbacks for display
                    questions = window.FALLBACK_QUESTIONS.slice(0, 3);
                    
                    // Only generate new questions if we don't have any pregenerated ones
                    // These will be used next time, not for current display
                    if (!window.pregeneratedQuestions) {
                        generateSuggestedQuestions().then(newQuestions => {
                            if (newQuestions && newQuestions.length === 3) {
                                // Store for next time, don't update current display
                                window.pregeneratedQuestions = newQuestions;
                            }
                        }).catch(error => {
                            console.warn('[WIDGET] Failed to generate questions:', error);
                        });
                    }
                }
                
                // Display questions with fade in
                container.innerHTML = questions.map((question, index) => `
                    <button class="floating-suggestion" style="opacity: 0" data-question="${question}">
                        ${question}
                    </button>
                `).join('');
                
                // Fade in questions sequentially
                const buttons = container.querySelectorAll('.floating-suggestion');
                buttons.forEach((btn, index) => {
                    setTimeout(() => {
                        btn.style.transition = 'opacity 300ms ease-in';
                        btn.style.opacity = '1';
                    }, index * 100);
                });
                
                // Setup click handlers
                setupQuestionClickHandlers(container);
                
            } catch (error) {
                console.error('[WIDGET] Failed to load suggestions:', error);
                // Don't hide container, show fallbacks instead
                const fallbacks = window.FALLBACK_QUESTIONS.slice(0, 3);
                container.innerHTML = fallbacks.map(question => `
                    <button class="floating-suggestion" data-question="${question}">
                        ${question}
                    </button>
                `).join('');
                setupQuestionClickHandlers(container);
            }
            
            function setupQuestionClickHandlers(container) {
                container.querySelectorAll('.floating-suggestion').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        const question = btn.dataset.question;
                        const searchInput = shadowRoot.getElementById('widget-search-input');
                        
                        // Fill input with question
                        if (searchInput) searchInput.value = question;
                        
                        // Open chat with question
                        openChatWithQuestion(question);
                    });
                });
            }
        }
        
        // Initialize collapsible functionality
        setupCollapsibleWidget();
        
        // Define and setup chat functions
        function openChatWithQuestion(question) {
            console.log('[WIDGET] Opening chat with question:', question);
            
            // First, collapse the search widget and hide suggestions
            if (searchBar) {
                searchBar.classList.add('collapsed');
                searchBar.classList.remove('expanded');
            }
            
            if (floatingSuggestions) {
                floatingSuggestions.classList.remove('visible');
            }
            
            // Clear and collapse the input
            if (input) {
                input.value = '';
                input.blur();
            }
            
            // Open the sidebar
            const sidebar = shadowRoot.getElementById('gist-sidebar');
            const overlay = shadowRoot.getElementById('gist-sidebar-overlay');
            const messagesContainer = shadowRoot.getElementById('gist-sidebar-messages');
            const suggestionsSection = shadowRoot.getElementById('gist-sidebar-suggestions');
            
            console.log('[WIDGET] Sidebar elements check:', {
                sidebar: !!sidebar,
                overlay: !!overlay,
                messagesContainer: !!messagesContainer,
                suggestionsSection: !!suggestionsSection
            });
            
            if (sidebar && overlay) {
                console.log('[WIDGET] Starting sidebar animation...');
                sidebar.classList.add('open');
                overlay.classList.add('visible');
                
                // Wait for the full sidebar animation to complete (400ms + small buffer)
                setTimeout(() => {
                    console.log('[WIDGET] Sidebar animation complete, processing question:', question);
                    // Double-check elements are still available after animation
                    const messagesContainerAfter = shadowRoot.getElementById('gist-sidebar-messages');
                    console.log('[WIDGET] Messages container after animation:', !!messagesContainerAfter);
                    processSidebarQuestion(question);
                }, 450); // 450ms to ensure animation is fully complete
            } else {
                console.error('[WIDGET] Missing sidebar elements:', { sidebar: !!sidebar, overlay: !!overlay });
            }
        }

        // Setup sidebar event handlers
        function setupSidebarHandlers() {
            const sidebar = shadowRoot.getElementById('gist-sidebar');
            const overlay = shadowRoot.getElementById('gist-sidebar-overlay');
            const closeBtn = shadowRoot.getElementById('gist-sidebar-close');
            const sidebarInput = shadowRoot.getElementById('gist-sidebar-input');
            const sidebarSendBtn = shadowRoot.getElementById('gist-sidebar-send');
            
            // Close button handler
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    if (sidebar) sidebar.classList.remove('open');
                    if (overlay) overlay.classList.remove('visible');
                });
            }
            
            // Overlay click handler
            if (overlay) {
                overlay.addEventListener('click', () => {
                    if (sidebar) sidebar.classList.remove('open');
                    overlay.classList.remove('visible');
                });
            }
            
            // Sidebar input event handlers
            if (sidebarInput && sidebarSendBtn) {
                // Send button click
                sidebarSendBtn.addEventListener('click', () => {
                    const question = sidebarInput.value.trim();
                    if (question) {
                        console.log('[WIDGET] Send button clicked with question:', question);
                        processSidebarQuestion(question);
                        sidebarInput.value = '';
                    }
                });
                
                // Enter key handler
                sidebarInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        const question = sidebarInput.value.trim();
                        if (question) {
                            console.log('[WIDGET] Enter key pressed with question:', question);
                            processSidebarQuestion(question);
                            sidebarInput.value = '';
                        }
                    }
                });
            }
            
            // ESC key handler
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && sidebar && sidebar.classList.contains('open')) {
                    sidebar.classList.remove('open');
                    if (overlay) overlay.classList.remove('visible');
                }
            });
        }
        
        // Initialize sidebar handlers
        setupSidebarHandlers();
        
        // Initialize dynamic width detection
        setTimeout(() => {
            updateWidgetWidth();
            // Add resize listener
            window.addEventListener('resize', handleResize);
            
            // Also monitor for DOM changes that might affect layout
            const observer = new MutationObserver(() => {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    updateWidgetWidth();
                }, 500);
            });
            
            // Observe changes to body and main content areas
            observer.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['class', 'style']
            });
            
            // Store observer for cleanup if needed
            widgetContainer._widthObserver = observer;
        }, 300);
        
        // Show widget
        setTimeout(() => {
            widget.classList.add('loaded');
            console.log('[WIDGET] Widget initialized with floating suggestions hidden and search bar collapsed');
        }, 100);
        
        // Setup right edge hover detection for sidebar
        function setupRightEdgeHoverDetection() {
            const HOVER_ZONE_WIDTH = 30; // pixels from right edge
            const HOVER_DELAY = 300; // ms before opening
            const CLOSE_DELAY = 500; // ms before closing when mouse leaves
            
            document.addEventListener('mousemove', (e) => {
                const isNearRightEdge = window.innerWidth - e.clientX <= HOVER_ZONE_WIDTH;
                const sidebar = shadowRoot.getElementById('gist-sidebar');
                
                if (isNearRightEdge && sidebarHasBeenOpened && !sidebar?.classList.contains('open')) {
                    // Mouse is near right edge and sidebar has been opened before
                    if (!isHoveringRightEdge) {
                        isHoveringRightEdge = true;
                        clearTimeout(rightEdgeHoverTimeout);
                        
                        rightEdgeHoverTimeout = setTimeout(() => {
                            if (isHoveringRightEdge) {
                                openSidebar();
                            }
                        }, HOVER_DELAY);
                    }
                } else if (!isNearRightEdge && isHoveringRightEdge) {
                    // Mouse left the hover zone
                    isHoveringRightEdge = false;
                    clearTimeout(rightEdgeHoverTimeout);
                    
                    // Auto-close sidebar if it's open and mouse moves away from right side
                    if (sidebar?.classList.contains('open')) {
                        clearTimeout(sidebarCloseTimeout);
                        sidebarCloseTimeout = setTimeout(() => {
                            // Only close if mouse is still away from sidebar
                            const sidebarRect = sidebar.getBoundingClientRect();
                            const currentMouseX = e.clientX;
                            
                            if (currentMouseX < sidebarRect.left - 50) {
                                closeSidebar();
                            }
                        }, CLOSE_DELAY);
                    }
                }
            });
            
            // Cancel close timeout if mouse enters sidebar
            const sidebar = shadowRoot.getElementById('gist-sidebar');
            if (sidebar) {
                sidebar.addEventListener('mouseenter', () => {
                    clearTimeout(sidebarCloseTimeout);
                });
                
                sidebar.addEventListener('mouseleave', (e) => {
                    // Start close timeout when leaving sidebar
                    clearTimeout(sidebarCloseTimeout);
                    sidebarCloseTimeout = setTimeout(() => {
                        if (!isHoveringRightEdge) {
                            closeSidebar();
                        }
                    }, CLOSE_DELAY);
                });
            }
        }
        
        // Initialize right edge hover detection
        setupRightEdgeHoverDetection();
        
        return shadowRoot;
    }

    // Initialize
    let pregeneratedQuestions = [];
    
    function initWidget() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                createWidget();
                // Pre-generate questions on widget load
                setTimeout(() => {
                    generateSuggestedQuestions().then(questions => {
                        pregeneratedQuestions = questions;
                    }).catch(() => {
                        // Silently fail
                    });
                }, 1000); // Generate after 1 second of page load
            });
        } else {
            createWidget();
            // Pre-generate questions on widget load
            setTimeout(() => {
                generateSuggestedQuestions().then(questions => {
                    pregeneratedQuestions = questions;
                }).catch(() => {
                    // Silently fail
                });
            }, 1000); // Generate after 1 second of page load
        }
    }
    
    initWidget();
})();
