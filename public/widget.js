/**
 * ProRata.ai Embedded Widget
 * Version: 2.0.0
 * Copyright (c) 2024 ProRata.ai
 */

(function(window, document) {
    'use strict';

    // Widget Configuration Defaults
    const DEFAULTS = {
        apiEndpoint: '/api/chat',
        retryAttempts: 3,
        retryDelay: 1000,
        cacheExpiry: 3600000, // 1 hour
        theme: {
            adaptToSite: true,
            primaryColor: null,
            fontFamily: null
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
            this.retryCount = 0;
            
            this.init();
        }

        mergeOptions(defaults, options) {
            return {
                ...defaults,
                ...options,
                theme: { ...defaults.theme, ...options.theme }
            };
        }

        async init() {
            try {
                // Inject CSS
                this.injectStyles();
                
                // Detect theme
                if (this.options.theme.adaptToSite) {
                    this.detectTheme();
                }
                
                // Get article content
                this.articleContent = this.extractArticleContent();
                
                // Render widget
                this.render();
                
                // Generate questions
                if (this.articleContent) {
                    this.generateQuestions();
                }
                
                // Generate ad
                if (this.articleContent) {
                    this.generateAd();
                }
                
                // Bind events
                this.bindEvents();
                
                this.initialized = true;
                this.dispatchEvent('initialized');
                
            } catch (error) {
                console.error('ProRata Widget initialization error:', error);
                this.handleError(error);
            }
        }

        injectStyles() {
            if (document.getElementById('prorata-widget-styles')) {
                return;
            }

            const style = document.createElement('style');
            style.id = 'prorata-widget-styles';
            style.textContent = `
                .prorata-widget {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    width: 320px;
                    font-family: var(--prorata-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
                    background: var(--prorata-bg-color, #ffffff);
                    border-radius: 16px;
                    padding: 20px;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
                    z-index: 9999;
                    max-height: calc(100vh - 40px);
                    overflow-y: auto;
                }
                
                .prorata-widget__header {
                    font-size: 18px;
                    font-weight: 600;
                    margin-bottom: 16px;
                    color: var(--prorata-primary-color, #dc2626);
                    text-align: left;
                }
                
                .prorata-widget__questions {
                    margin-bottom: 20px;
                }
                
                .prorata-widget__question {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 0;
                    border-bottom: 1px solid var(--prorata-border-color, #e5e7eb);
                    cursor: pointer;
                    transition: all 0.2s ease;
                    font-size: 14px;
                    color: var(--prorata-text-color, #374151);
                }
                
                .prorata-widget__question:last-child {
                    border-bottom: none;
                }
                
                .prorata-widget__question:hover {
                    color: var(--prorata-primary-color, #dc2626);
                }
                
                .prorata-widget__question-text {
                    flex: 1;
                    line-height: 1.4;
                }
                
                .prorata-widget__question-arrow {
                    color: #9ca3af;
                    font-size: 16px;
                    margin-left: 8px;
                    flex-shrink: 0;
                }
                
                .prorata-widget__search {
                    position: relative;
                    margin-bottom: 20px;
                }
                
                .prorata-widget__search-input {
                    width: 100%;
                    padding: 12px 48px 12px 16px;
                    border: 2px solid transparent;
                    border-radius: 25px;
                    font-size: 14px;
                    background: linear-gradient(white, white) padding-box,
                               linear-gradient(90deg, #f59e0b 0%, #8b5cf6 100%) border-box;
                    transition: all 0.2s ease;
                    outline: none;
                    color: var(--prorata-text-color, #374151);
                }
                
                .prorata-widget__search-input::placeholder {
                    color: #9ca3af;
                }
                
                .prorata-widget__search-input:focus {
                    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
                }
                
                .prorata-widget__search-button {
                    position: absolute;
                    right: 6px;
                    top: 50%;
                    transform: translateY(-50%);
                    background: #000;
                    color: white;
                    border: none;
                    border-radius: 50%;
                    width: 32px;
                    height: 32px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 16px;
                }
                
                .prorata-widget__search-button:hover {
                    background: #333;
                    transform: translateY(-50%) scale(1.05);
                }
                
                .prorata-widget__ad {
                    background: var(--prorata-ad-bg, #f9fafb);
                    border-radius: 12px;
                    padding: 16px;
                    position: relative;
                }
                
                .prorata-widget__ad-label {
                    position: absolute;
                    top: 8px;
                    right: 12px;
                    font-size: 10px;
                    color: #9ca3af;
                    font-weight: 500;
                }
                
                .prorata-widget__ad-content h4 {
                    font-size: 16px;
                    font-weight: 600;
                    margin-bottom: 8px;
                    color: var(--prorata-text-color, #111827);
                    line-height: 1.3;
                }
                
                .prorata-widget__ad-content p {
                    font-size: 13px;
                    color: var(--prorata-text-color, #374151);
                    margin-bottom: 12px;
                    line-height: 1.4;
                }
                
                .prorata-widget__ad-content a {
                    color: var(--prorata-text-color, #111827);
                    text-decoration: underline;
                    font-size: 13px;
                    font-weight: 500;
                }
                
                .prorata-widget__ad-content a:hover {
                    color: var(--prorata-primary-color, #dc2626);
                }
                
                .prorata-widget__answer {
                    padding: 16px;
                    background: var(--prorata-answer-bg, #f0f9ff);
                    border: 1px solid var(--prorata-answer-border, #0ea5e9);
                    border-radius: 12px;
                    margin-bottom: 16px;
                }
                
                .prorata-widget__answer h3 {
                    font-size: 14px;
                    font-weight: 600;
                    margin-bottom: 8px;
                    color: var(--prorata-primary-color, #0ea5e9);
                }
                
                .prorata-widget__answer p {
                    font-size: 13px;
                    line-height: 1.5;
                    color: var(--prorata-text-color, #374151);
                }
                
                .prorata-widget__loading {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                    color: #9ca3af;
                    font-size: 13px;
                }
                
                .prorata-widget__error {
                    padding: 16px;
                    background: #fef2f2;
                    border: 1px solid #fca5a5;
                    border-radius: 12px;
                    color: #dc2626;
                    font-size: 13px;
                    text-align: center;
                }
                
                @media (max-width: 768px) {
                    .prorata-widget {
                        position: fixed;
                        bottom: 20px;
                        right: 20px;
                        left: 20px;
                        top: auto;
                        width: auto;
                        max-height: 60vh;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        detectTheme() {
            const computedStyle = window.getComputedStyle(document.body);
            
            // Detect primary color from various sources
            this.theme.primaryColor = this.detectPrimaryColor(computedStyle);
            this.theme.textColor = computedStyle.color || '#374151';
            this.theme.backgroundColor = computedStyle.backgroundColor || '#ffffff';
            this.theme.fontFamily = computedStyle.fontFamily || 'inherit';
            
            this.applyTheme();
        }

        detectPrimaryColor(styles) {
            // Try to find primary color from common CSS variables or link colors
            const linkElements = document.querySelectorAll('a');
            if (linkElements.length > 0) {
                const linkStyle = window.getComputedStyle(linkElements[0]);
                return linkStyle.color || '#dc2626';
            }
            return '#dc2626';
        }

        applyTheme() {
            const root = document.documentElement;
            root.style.setProperty('--prorata-primary-color', this.theme.primaryColor);
            root.style.setProperty('--prorata-text-color', this.theme.textColor);
            root.style.setProperty('--prorata-bg-color', this.theme.backgroundColor);
            root.style.setProperty('--prorata-font-family', this.theme.fontFamily);
            root.style.setProperty('--prorata-border-color', '#e5e7eb');
            root.style.setProperty('--prorata-ad-bg', '#f9fafb');
            root.style.setProperty('--prorata-answer-bg', '#f0f9ff');
            root.style.setProperty('--prorata-answer-border', '#0ea5e9');
        }

        extractArticleContent() {
            // Try to extract meaningful content from the page
            const selectors = [
                'article',
                '[role="main"]',
                'main',
                '.content',
                '.post-content',
                '.entry-content',
                '.article-content'
            ];
            
            for (const selector of selectors) {
                const element = document.querySelector(selector);
                if (element) {
                    return element.innerText || element.textContent;
                }
            }
            
            // Fallback to page title and meta description
            const title = document.title || '';
            const description = document.querySelector('meta[name="description"]')?.content || '';
            return title + ' ' + description;
        }

        render() {
            const target = document.body;
            
            const widget = document.createElement('div');
            widget.className = 'prorata-widget';
            widget.id = this.widgetId;
            
            widget.innerHTML = `
                <div class="prorata-widget__header">Related questions</div>
                <div class="prorata-widget__questions" id="${this.widgetId}-questions">
                    <div class="prorata-widget__loading">Generating questions...</div>
                </div>
                
                <div class="prorata-widget__search">
                    <input 
                        type="text" 
                        class="prorata-widget__search-input" 
                        placeholder="✨ Ask The Atlantic..."
                        id="${this.widgetId}-search-input"
                        aria-label="Ask questions about this content"
                    >
                    <button 
                        class="prorata-widget__search-button" 
                        id="${this.widgetId}-search-button"
                        aria-label="Search"
                    >
                        ➤
                    </button>
                </div>
                
                <div class="prorata-widget__ad" id="${this.widgetId}-ad">
                    <div class="prorata-widget__ad-label">Ad by ProRata</div>
                    <div class="prorata-widget__loading">Loading advertisement...</div>
                </div>
            `;
            
            target.appendChild(widget);
        }

        bindEvents() {
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
            
            // Question clicks
            const questionsContainer = document.getElementById(`${this.widgetId}-questions`);
            questionsContainer.addEventListener('click', (e) => {
                const question = e.target.closest('.prorata-widget__question');
                if (question) {
                    const questionText = question.querySelector('.prorata-widget__question-text').textContent;
                    this.handleSearch(questionText);
                }
            });
        }

        async generateQuestions() {
            try {
                const cacheKey = `questions-${this.hashContent(this.articleContent)}`;
                const cached = this.getFromCache(cacheKey);
                if (cached) {
                    this.questions = cached;
                    this.renderQuestions();
                    return;
                }
                
                const prompt = `Based on the following content, generate 3 engaging questions that readers might want to know more about. The questions should be diverse and encourage further exploration.

Content:
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
                    <div class="prorata-widget__question-text">${this.escapeHtml(question)}</div>
                    <div class="prorata-widget__question-arrow">↗</div>
                </div>
            `).join('');
        }

        renderQuestionError() {
            const container = document.getElementById(`${this.widgetId}-questions`);
            if (!container) return;
            
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
                const prompt = `Based on the following content, generate a contextual advertisement that would be relevant to readers. The ad should be professional and relevant.

Content:
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
                    <h4>${this.escapeHtml(ad.headline)}</h4>
                    <p>${this.escapeHtml(ad.description)}</p>
                    <a href="#" onclick="return false;">${this.escapeHtml(ad.cta || 'Learn More')}</a>
                </div>
            `;
        }

        renderDefaultAd() {
            const container = document.getElementById(`${this.widgetId}-ad`);
            if (!container) return;
            
            container.innerHTML = `
                <div class="prorata-widget__ad-label">Ad by ProRata</div>
                <div class="prorata-widget__ad-content">
                    <h4>Discover AI-Powered Content</h4>
                    <p>A heartfelt journey through technology, insights, and the mind of innovation.</p>
                    <a href="#" onclick="return false;">Learn more</a>
                </div>
            `;
        }

        async handleSearch(query) {
            try {
                const response = await this.callOpenAI(`Answer this question based on the article content: ${query}

Article content:
${this.articleContent.slice(0, 1500)}...`);
                
                this.displayAnswer(response);
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
                    },
                    body: JSON.stringify(requestBody)
                });
                
                if (!response.ok) {
                    throw new Error(`API error: ${response.status}`);
                }
                
                return await response.json();
                
            } catch (error) {
                if (this.retryCount < this.options.retryAttempts) {
                    this.retryCount++;
                    await this.delay(this.options.retryDelay * this.retryCount);
                    return this.callOpenAI(prompt);
                }
                throw error;
            }
        }

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
            
            const existingAnswer = widget.querySelector('.prorata-widget__answer');
            if (existingAnswer) {
                existingAnswer.remove();
            }
            
            const answerContainer = document.createElement('div');
            answerContainer.className = 'prorata-widget__answer';
            
            const answer = response.choices && response.choices[0] 
                ? response.choices[0].message.content 
                : 'No answer available';
            
            answerContainer.innerHTML = `
                <h3>Answer:</h3>
                <p>${this.escapeHtml(answer)}</p>
            `;
            
            const searchElement = widget.querySelector('.prorata-widget__search');
            searchElement.parentNode.insertBefore(answerContainer, searchElement.nextSibling);
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
                if (window.gtag) {
                    window.gtag('event', `prorata_${eventName}`, {
                        event_category: 'ProRata Widget',
                        ...data
                    });
                }
                
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
            
            const errorContainer = document.createElement('div');
            errorContainer.className = 'prorata-widget__error';
            errorContainer.textContent = 'Something went wrong. Please try again later.';
            
            const widget = document.getElementById(this.widgetId);
            if (widget) {
                widget.appendChild(errorContainer);
            }
            
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

    // Auto-initialization
    function autoInit() {
        const script = document.currentScript || document.querySelector('script[src*="widget.js"]');
        if (!script) return;

        const target = script.getAttribute('data-target');
        
        if (target) {
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