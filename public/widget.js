/**
 * ProRata.ai Embedded Widget
 * Version: 1.0.0
 * Copyright (c) 2024 ProRata.ai
 */

(function(window, document) {
    'use strict';

    // Widget Configuration Defaults
    const DEFAULTS = {
        apiEndpoint: '/api/chat', // Use local API endpoint instead of direct OpenAI
        retryAttempts: 3,
        retryDelay: 1000,
        cacheExpiry: 3600000, // 1 hour
        theme: {
            adaptToSite: true,
            primaryColor: null,
            fontFamily: null,
            logo: null
        },
        features: {
            enableQuestions: true,
            enableSearch: true,
            enableAds: true
        }
    };

    // Main Widget Class
    class ProRataWidget {
        constructor(options = {}) {
            this.options = this.mergeOptions(DEFAULTS, options);
            this.widgetId = `prorata-widget-${Date.now()}`;
            this.cache = new Map();
            this.questions = [];
            this.theme = {};
            this.initialized = false;
            
            this.init();
        }

        mergeOptions(defaults, options) {
            return {
                ...defaults,
                ...options,
                theme: { ...defaults.theme, ...options.theme },
                features: { ...defaults.features, ...options.features }
            };
        }

        async init() {
            try {
                // Inject CSS
                await this.injectStyles();
                
                // Detect theme
                if (this.options.theme.adaptToSite) {
                    this.detectTheme();
                }
                
                // Get article content
                this.articleContent = this.extractArticleContent();
                
                // Render widget
                this.render();
                
                // Generate questions if enabled
                if (this.options.features.enableQuestions && this.articleContent) {
                    this.generateQuestions();
                }
                
                // Generate ad if enabled
                if (this.options.features.enableAds && this.articleContent) {
                    this.generateAd();
                }
                
                // Bind events
                this.bindEvents();
                
                this.initialized = true;
                
                // Dispatch initialization event
                this.dispatchEvent('initialized');
                
            } catch (error) {
                console.error('ProRata Widget initialization error:', error);
                this.handleError(error);
            }
        }

        async injectStyles() {
            // Check if styles already injected
            if (document.getElementById('prorata-widget-styles')) {
                return;
            }

            const link = document.createElement('link');
            link.id = 'prorata-widget-styles';
            link.rel = 'stylesheet';
            link.href = '/widget.css'; // Use local CSS file
            document.head.appendChild(link);

            // Wait for styles to load
            return new Promise((resolve) => {
                link.onload = resolve;
                link.onerror = () => {
                    console.warn('Failed to load local styles, using inline styles');
                    this.injectInlineStyles();
                    resolve();
                };
            });
        }

        injectInlineStyles() {
            const style = document.createElement('style');
            style.id = 'prorata-widget-inline-styles';
            style.textContent = `
                .prorata-widget {
                    font-family: var(--prorata-font-family, inherit);
                    background: var(--prorata-bg-color, #ffffff);
                    border: 1px solid var(--prorata-border-color, #e0e0e0);
                    border-radius: var(--prorata-border-radius, 8px);
                    padding: 20px;
                    margin: 20px 0;
                    max-width: 100%;
                }
                
                .prorata-widget__header {
                    font-size: 18px;
                    font-weight: 600;
                    margin-bottom: 16px;
                    color: var(--prorata-text-color, #333);
                }
                
                .prorata-widget__questions {
                    margin-bottom: 20px;
                }
                
                .prorata-widget__question {
                    padding: 12px 16px;
                    margin-bottom: 8px;
                    background: var(--prorata-question-bg, #f5f5f5);
                    border: 1px solid var(--prorata-question-border, #e0e0e0);
                    border-radius: var(--prorata-border-radius, 6px);
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                
                .prorata-widget__question:hover {
                    background: var(--prorata-question-hover-bg, #eeeeee);
                    transform: translateY(-1px);
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                
                .prorata-widget__search {
                    position: relative;
                    margin-bottom: 20px;
                }
                
                .prorata-widget__search-input {
                    width: 100%;
                    padding: 12px 48px 12px 16px;
                    border: 2px solid var(--prorata-input-border, #e0e0e0);
                    border-radius: var(--prorata-border-radius, 24px);
                    font-size: 16px;
                    transition: border-color 0.2s ease;
                }
                
                .prorata-widget__search-input:focus {
                    outline: none;
                    border-color: var(--prorata-primary-color, #007bff);
                }
                
                .prorata-widget__search-button {
                    position: absolute;
                    right: 4px;
                    top: 50%;
                    transform: translateY(-50%);
                    background: var(--prorata-primary-color, #007bff);
                    color: white;
                    border: none;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    cursor: pointer;
                    transition: background 0.2s ease;
                }
                
                .prorata-widget__search-button:hover {
                    background: var(--prorata-primary-hover, #0056b3);
                }
                
                .prorata-widget__ad {
                    padding: 16px;
                    background: var(--prorata-ad-bg, #f9f9f9);
                    border: 1px solid var(--prorata-ad-border, #e0e0e0);
                    border-radius: var(--prorata-border-radius, 6px);
                    position: relative;
                }
                
                .prorata-widget__ad-label {
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    font-size: 11px;
                    color: #666;
                    background: rgba(255,255,255,0.9);
                    padding: 2px 6px;
                    border-radius: 3px;
                }
                
                .prorata-widget__loading {
                    text-align: center;
                    padding: 20px;
                    color: #666;
                }
                
                .prorata-widget__error {
                    background: #fee;
                    border: 1px solid #fcc;
                    color: #c33;
                    padding: 12px;
                    border-radius: 4px;
                    margin: 10px 0;
                }
                
                @media (max-width: 768px) {
                    .prorata-widget {
                        padding: 16px;
                    }
                    
                    .prorata-widget__header {
                        font-size: 16px;
                    }
                    
                    .prorata-widget__search-input {
                        font-size: 14px;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        detectTheme() {
            // Get computed styles from parent element
            const target = document.querySelector(this.options.targetElement);
            if (!target) return;

            const parentStyles = window.getComputedStyle(target.parentElement);
            
            // Detect colors
            this.theme.primaryColor = this.detectPrimaryColor(parentStyles);
            this.theme.backgroundColor = parentStyles.backgroundColor || '#ffffff';
            this.theme.textColor = parentStyles.color || '#333333';
            
            // Detect typography
            this.theme.fontFamily = parentStyles.fontFamily || 'system-ui, -apple-system, sans-serif';
            this.theme.fontSize = parentStyles.fontSize || '16px';
            
            // Detect borders and spacing
            this.theme.borderRadius = this.detectBorderRadius(parentStyles);
            this.theme.borderColor = this.detectBorderColor(parentStyles);
            
            // Detect logo
            if (this.options.theme.logo === null) {
                this.theme.logo = this.detectLogo();
            }
            
            // Apply theme
            this.applyTheme();
        }

        detectPrimaryColor(styles) {
            // Try to find primary color from CSS variables
            const cssVars = ['--primary', '--primary-color', '--brand-color', '--accent-color'];
            for (const varName of cssVars) {
                const value = styles.getPropertyValue(varName);
                if (value) return value;
            }
            
            // Try to find from common link colors
            const link = document.querySelector('a');
            if (link) {
                const linkColor = window.getComputedStyle(link).color;
                if (linkColor && linkColor !== 'rgb(0, 0, 0)') {
                    return linkColor;
                }
            }
            
            return this.options.theme.primaryColor || '#007bff';
        }

        detectBorderRadius(styles) {
            const radius = styles.borderRadius;
            if (radius && radius !== '0px') {
                return radius;
            }
            
            // Check for common card/box elements
            const card = document.querySelector('.card, .box, .panel, article');
            if (card) {
                const cardRadius = window.getComputedStyle(card).borderRadius;
                if (cardRadius && cardRadius !== '0px') {
                    return cardRadius;
                }
            }
            
            return '8px';
        }

        detectBorderColor(styles) {
            const border = styles.borderColor;
            if (border && border !== 'rgb(0, 0, 0)') {
                return border;
            }
            return '#e0e0e0';
        }

        detectLogo() {
            // Common logo selectors
            const logoSelectors = [
                '.logo img',
                '.site-logo img',
                '.navbar-brand img',
                '.header-logo img',
                '#logo img',
                'header img[alt*="logo"]',
                'img[class*="logo"]'
            ];
            
            for (const selector of logoSelectors) {
                const logo = document.querySelector(selector);
                if (logo && logo.src) {
                    return logo.src;
                }
            }
            
            return null;
        }

        applyTheme() {
            const root = document.documentElement;
            
            // Set CSS variables
            root.style.setProperty('--prorata-primary-color', this.theme.primaryColor);
            root.style.setProperty('--prorata-bg-color', this.theme.backgroundColor);
            root.style.setProperty('--prorata-text-color', this.theme.textColor);
            root.style.setProperty('--prorata-font-family', this.theme.fontFamily);
            root.style.setProperty('--prorata-border-radius', this.theme.borderRadius);
            root.style.setProperty('--prorata-border-color', this.theme.borderColor);
            
            // Calculate derivative colors
            const primaryHover = this.adjustColor(this.theme.primaryColor, -20);
            root.style.setProperty('--prorata-primary-hover', primaryHover);
            
            const questionBg = this.adjustColor(this.theme.backgroundColor, -5);
            root.style.setProperty('--prorata-question-bg', questionBg);
            
            const questionHoverBg = this.adjustColor(this.theme.backgroundColor, -10);
            root.style.setProperty('--prorata-question-hover-bg', questionHoverBg);
        }

        adjustColor(color, percent) {
            // Simple color adjustment function
            const num = parseInt(color.replace('#', ''), 16);
            const amt = Math.round(2.55 * percent);
            const R = (num >> 16) + amt;
            const G = (num >> 8 & 0x00FF) + amt;
            const B = (num & 0x0000FF) + amt;
            return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
                (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
                (B < 255 ? B < 1 ? 0 : B : 255))
                .toString(16).slice(1);
        }

        extractArticleContent() {
            // Try to get content from options first
            if (this.options.articleContent) {
                return this.options.articleContent;
            }
            
            // Common article selectors
            const selectors = [
                'article',
                '[role="article"]',
                '.post-content',
                '.entry-content',
                '.article-content',
                '.content-body',
                'main article',
                '.story-body'
            ];
            
            if (this.options.articleSelector) {
                selectors.unshift(this.options.articleSelector);
            }
            
            for (const selector of selectors) {
                const element = document.querySelector(selector);
                if (element) {
                    return element.innerText || element.textContent;
                }
            }
            
            return null;
        }

        render() {
            let target;
            
            if (this.options.targetElement) {
                target = document.querySelector(this.options.targetElement);
                if (!target) {
                    throw new Error(`Target element ${this.options.targetElement} not found`);
                }
            } else {
                // Default behavior: try to find a good place to insert the widget
                // Look for article, main, or body elements
                target = document.querySelector('article') || 
                         document.querySelector('main') || 
                         document.querySelector('.content') ||
                         document.querySelector('#content') ||
                         document.body;
            }
            
            const widget = document.createElement('div');
            widget.className = 'prorata-widget';
            widget.id = this.widgetId;
            
            widget.innerHTML = `
                ${this.options.features.enableQuestions ? `
                <div class="prorata-widget__header">Related questions</div>
                <div class="prorata-widget__questions" id="${this.widgetId}-questions">
                    <div class="prorata-widget__loading">Generating questions...</div>
                </div>
                ` : ''}
                
                ${this.options.features.enableSearch ? `
                <div class="prorata-widget__search">
                    <input 
                        type="text" 
                        class="prorata-widget__search-input" 
                        placeholder="Ask questions about this article..."
                        id="${this.widgetId}-search-input"
                        aria-label="Search for information about this article"
                    >
                    <button 
                        class="prorata-widget__search-button" 
                        id="${this.widgetId}-search-button"
                        aria-label="Search"
                    >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 17C13.4183 17 17 13.4183 17 9C17 4.58172 13.4183 1 9 1C4.58172 1 1 4.58172 1 9C1 13.4183 4.58172 17 9 17Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M19 19L14.65 14.65" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
                ` : ''}
                
                ${this.options.features.enableAds ? `
                <div class="prorata-widget__ad" id="${this.widgetId}-ad">
                    <div class="prorata-widget__ad-label">Ad by ProRata</div>
                    <div class="prorata-widget__loading">Loading advertisement...</div>
                </div>
                ` : ''}
            `;
            
            target.appendChild(widget);
        }

        bindEvents() {
            // Search functionality
            if (this.options.features.enableSearch) {
                const searchInput = document.getElementById(`${this.widgetId}-search-input`);
                const searchButton = document.getElementById(`${this.widgetId}-search-button`);
                
                const handleSearch = () => {
                    const query = searchInput.value.trim();
                    if (query) {
                        this.handleSearch(query);
                    }
                };
                
                searchButton.addEventListener('click', handleSearch);
                searchInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        handleSearch();
                    }
                });
            }
            
            // Question clicks
            if (this.options.features.enableQuestions) {
                const questionsContainer = document.getElementById(`${this.widgetId}-questions`);
                questionsContainer.addEventListener('click', (e) => {
                    const question = e.target.closest('.prorata-widget__question');
                    if (question) {
                        const questionText = question.textContent;
                        this.handleSearch(questionText);
                    }
                });
            }
        }

        async generateQuestions() {
            try {
                // Check cache first
                const cacheKey = `questions-${this.hashContent(this.articleContent)}`;
                const cached = this.getFromCache(cacheKey);
                if (cached) {
                    this.questions = cached;
                    this.renderQuestions();
                    return;
                }
                
                // Generate questions using OpenAI
                const prompt = `Based on the following article content, generate 3 engaging questions that readers might want to know more about. The questions should be diverse and encourage further exploration of the topic.

Article content:
${this.articleContent.slice(0, 2000)}...

Generate exactly 3 questions in JSON format: ["question1", "question2", "question3"]`;

                const response = await this.callOpenAI(prompt);
                
                if (response && response.choices && response.choices[0]) {
                    const content = response.choices[0].message.content;
                    try {
                        this.questions = JSON.parse(content);
                        this.setCache(cacheKey, this.questions);
                        this.renderQuestions();
                    } catch (parseError) {
                        // Try to extract questions from text
                        const questionMatches = content.match(/"([^"]+)"/g);
                        if (questionMatches && questionMatches.length >= 3) {
                            this.questions = questionMatches.slice(0, 3).map(q => q.replace(/"/g, ''));
                            this.setCache(cacheKey, this.questions);
                            this.renderQuestions();
                        } else {
                            throw new Error('Failed to parse questions');
                        }
                    }
                }
            } catch (error) {
                console.error('Error generating questions:', error);
                this.renderQuestionError();
            }
        }

        renderQuestions() {
            const container = document.getElementById(`${this.widgetId}-questions`);
            if (!container) return;
            
            container.innerHTML = this.questions.map(question => `
                <div class="prorata-widget__question" tabindex="0" role="button">
                    ${this.escapeHtml(question)}
                </div>
            `).join('');
        }

        renderQuestionError() {
            const container = document.getElementById(`${this.widgetId}-questions`);
            if (!container) return;
            
            // Fallback questions
            const fallbackQuestions = [
                "What are the key points of this article?",
                "What are the implications of this topic?",
                "How does this relate to current events?"
            ];
            
            this.questions = fallbackQuestions;
            this.renderQuestions();
        }

        async generateAd() {
            try {
                // Generate contextual ad based on article content
                const prompt = `Based on the following article content, generate a single contextual advertisement that would be relevant to readers. The ad should be professional and relevant.

Article content:
${this.articleContent.slice(0, 1000)}...

Generate the ad in JSON format: {"headline": "...", "description": "...", "cta": "Learn More"}`;

                const response = await this.callOpenAI(prompt);
                
                if (response && response.choices && response.choices[0]) {
                    const content = response.choices[0].message.content;
                    try {
                        const ad = JSON.parse(content);
                        this.renderAd(ad);
                    } catch (parseError) {
                        this.renderDefaultAd();
                    }
                } else {
                    this.renderDefaultAd();
                }
            } catch (error) {
                console.error('Error generating ad:', error);
                this.renderDefaultAd();
            }
        }

        renderAd(ad) {
            const container = document.getElementById(`${this.widgetId}-ad`);
            if (!container) return;
            
            container.innerHTML = `
                <div class="prorata-widget__ad-label">Ad by ProRata</div>
                <div class="prorata-widget__ad-content">
                    <h4 style="margin: 0 0 8px 0; color: var(--prorata-text-color);">
                        ${this.escapeHtml(ad.headline)}
                    </h4>
                    <p style="margin: 0 0 12px 0; color: var(--prorata-text-color); opacity: 0.8;">
                        ${this.escapeHtml(ad.description)}
                    </p>
                    <a href="#" style="color: var(--prorata-primary-color); text-decoration: none; font-weight: 500;">
                        ${this.escapeHtml(ad.cta || 'Learn More')} →
                    </a>
                </div>
            `;
        }

        renderDefaultAd() {
            const container = document.getElementById(`${this.widgetId}-ad`);
            if (!container) return;
            
            container.innerHTML = `
                <div class="prorata-widget__ad-label">Ad by ProRata</div>
                <div class="prorata-widget__ad-content">
                    <h4 style="margin: 0 0 8px 0; color: var(--prorata-text-color);">
                        Discover More with ProRata
                    </h4>
                    <p style="margin: 0 0 12px 0; color: var(--prorata-text-color); opacity: 0.8;">
                        Get instant answers and explore topics in depth with our AI-powered search.
                    </p>
                    <a href="https://prorata.ai" style="color: var(--prorata-primary-color); text-decoration: none; font-weight: 500;">
                        Learn More →
                    </a>
                </div>
            `;
        }

        async handleSearch(query) {
            try {
                // Store query and article context
                const searchData = {
                    query: query,
                    articleContent: this.articleContent,
                    articleUrl: window.location.href,
                    timestamp: Date.now()
                };
                
                // Store in session storage for answer page
                sessionStorage.setItem('prorata-search-data', JSON.stringify(searchData));
                
                // Display answer in widget instead of opening external page
                this.displayAnswer(response);
                
                // Track search event
                this.trackEvent('search', { query });
                
            } catch (error) {
                console.error('Search error:', error);
                this.handleError(error);
            }
        }

        async callOpenAI(prompt) {
            const endpoint = this.options.apiEndpoint;
            
            const requestBody = {
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "You are a helpful assistant that generates relevant questions and content based on article text."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 200
            };
            
            try {
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                        // No Authorization header needed - handled by server
                    },
                    body: JSON.stringify(requestBody)
                });
                
                if (!response.ok) {
                    throw new Error(`API error: ${response.status}`);
                }
                
                return await response.json();
                
            } catch (error) {
                // Retry logic
                if (this.retryCount < this.options.retryAttempts) {
                    this.retryCount++;
                    await this.delay(this.options.retryDelay * this.retryCount);
                    return this.callOpenAI(prompt);
                }
                throw error;
            }
        }

        // Utility functions
        hashContent(content) {
            let hash = 0;
            for (let i = 0; i < content.length; i++) {
                const char = content.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash;
            }
            return hash.toString();
        }

        getFromCache(key) {
            const cached = this.cache.get(key);
            if (cached && cached.expiry > Date.now()) {
                return cached.data;
            }
            this.cache.delete(key);
            return null;
        }

        setCache(key, data) {
            this.cache.set(key, {
                data: data,
                expiry: Date.now() + this.options.cacheExpiry
            });
        }

        displayAnswer(response) {
            const widget = document.getElementById(this.widgetId);
            if (!widget) return;
            
            // Remove previous answer if exists
            const existingAnswer = widget.querySelector('.prorata-widget__answer');
            if (existingAnswer) {
                existingAnswer.remove();
            }
            
            // Create answer container
            const answerContainer = document.createElement('div');
            answerContainer.className = 'prorata-widget__answer';
            
            // Extract answer from OpenAI response
            const answer = response.choices && response.choices[0] 
                ? response.choices[0].message.content 
                : 'No answer available';
            
            answerContainer.innerHTML = `
                <h3>Answer:</h3>
                <p>${this.escapeHtml(answer)}</p>
            `;
            
            widget.appendChild(answerContainer);
        }

        escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        trackEvent(eventName, data = {}) {
            try {
                // Send analytics event
                if (window.gtag) {
                    window.gtag('event', `prorata_${eventName}`, {
                        event_category: 'ProRata Widget',
                        ...data
                    });
                }
                
                // Local analytics logging (console for now)
                console.log('ProRata Widget Event:', {
                    event: eventName,
                    widget_id: this.widgetId,
                    url: window.location.href,
                    timestamp: Date.now(),
                    ...data
                });
            } catch (error) {
                // Don't let analytics errors break the widget
            }
        }

        handleError(error) {
            console.error('ProRata Widget Error:', error);
            
            // Display user-friendly error
            const errorContainer = document.createElement('div');
            errorContainer.className = 'prorata-widget__error';
            errorContainer.textContent = 'Something went wrong. Please try again later.';
            
            const widget = document.getElementById(this.widgetId);
            if (widget) {
                widget.appendChild(errorContainer);
            }
            
            // Track error
            this.trackEvent('error', {
                error: error.message,
                stack: error.stack
            });
        }

        dispatchEvent(eventName, detail = {}) {
            const event = new CustomEvent(`prorata:${eventName}`, {
                detail: {
                    widgetId: this.widgetId,
                    ...detail
                }
            });
            window.dispatchEvent(event);
        }

        // Public API methods
        destroy() {
            const widget = document.getElementById(this.widgetId);
            if (widget) {
                widget.remove();
            }
            this.cache.clear();
            this.initialized = false;
            this.dispatchEvent('destroyed');
        }

        refresh() {
            if (this.initialized) {
                this.generateQuestions();
                this.generateAd();
            }
        }

        updateOptions(newOptions) {
            this.options = this.mergeOptions(this.options, newOptions);
            if (this.initialized) {
                this.destroy();
                this.init();
            }
        }
    }

    // Auto-initialization from script tag
    function autoInit() {
        const script = document.currentScript || document.querySelector('script[src*="widget.js"]');
        if (!script) return;

        const target = script.getAttribute('data-target');
        
        if (target) {
            // Wait for DOM ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    new ProRataWidget({
                        targetElement: target
                    });
                });
            } else {
                new ProRataWidget({
                    targetElement: target
                });
            }
        } else {
            // Auto-initialize without specific target
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    new ProRataWidget();
                });
            } else {
                new ProRataWidget();
            }
        }
    }

    // Run auto-initialization
    autoInit();

    // Expose to global scope
    window.ProRataWidget = ProRataWidget;

})(window, document);