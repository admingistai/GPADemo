/**
 * ProRata.ai Embedded Widget
 * Version: 1.0.0 - Simplified
 * Copyright (c) 2024 ProRata.ai
 */

(function(window, document) {
    'use strict';

    // Widget Configuration Defaults
    const DEFAULTS = {
        apiEndpoint: '/api/chat',
        retryAttempts: 3,
        retryDelay: 1000,
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
                
                // Render widget
                this.render();
                
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

        injectStyles() {
            // Check if styles already injected
            if (document.getElementById('prorata-widget-styles')) {
                return;
            }

            const style = document.createElement('style');
            style.id = 'prorata-widget-styles';
            style.textContent = `
                .prorata-widget {
                    font-family: var(--prorata-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif);
                    background: var(--prorata-bg-color, #ffffff);
                    border: 1px solid var(--prorata-border-color, #e5e7eb);
                    border-radius: var(--prorata-border-radius, 12px);
                    padding: 24px;
                    margin: 24px 0;
                    max-width: 100%;
                    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
                    transition: box-shadow 0.2s ease;
                    position: relative;
                    overflow: hidden;
                }
                
                .prorata-widget:hover {
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                }
                
                .prorata-widget__search {
                    position: relative;
                    margin-bottom: 20px;
                }
                
                .prorata-widget__search-input {
                    width: 100%;
                    padding: 14px 56px 14px 20px;
                    border: 2px solid var(--prorata-input-border, #e5e7eb);
                    border-radius: 50px;
                    font-size: 16px;
                    font-family: inherit;
                    transition: all 0.2s ease;
                    background: var(--prorata-input-bg, #ffffff);
                    color: var(--prorata-text-color, #111827);
                }
                
                .prorata-widget__search-input::placeholder {
                    color: #9ca3af;
                }
                
                .prorata-widget__search-input:focus {
                    outline: none;
                    border-color: var(--prorata-primary-color, #3b82f6);
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                }
                
                .prorata-widget__search-button {
                    position: absolute;
                    right: 6px;
                    top: 50%;
                    transform: translateY(-50%);
                    background: var(--prorata-primary-color, #3b82f6);
                    color: white;
                    border: none;
                    border-radius: 50%;
                    width: 44px;
                    height: 44px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .prorata-widget__search-button:hover {
                    background: var(--prorata-primary-hover, #2563eb);
                    transform: translateY(-50%) scale(1.05);
                }
                
                .prorata-widget__search-button:active {
                    transform: translateY(-50%) scale(0.95);
                }
                
                .prorata-widget__search-button:focus {
                    outline: none;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
                }
                
                .prorata-widget__search-button svg {
                    width: 20px;
                    height: 20px;
                }
                
                .prorata-widget__answer {
                    padding: 20px;
                    background: var(--prorata-answer-bg, #f0f9ff);
                    border: 1px solid var(--prorata-answer-border, #0ea5e9);
                    border-radius: calc(var(--prorata-border-radius, 12px) - 4px);
                    margin-top: 16px;
                    position: relative;
                    overflow: hidden;
                }
                
                .prorata-widget__answer h3 {
                    font-size: 16px;
                    font-weight: 600;
                    margin-bottom: 12px;
                    color: var(--prorata-primary-color, #0ea5e9);
                }
                
                .prorata-widget__answer p {
                    font-size: 15px;
                    line-height: 1.6;
                    color: var(--prorata-text-color, #374151);
                    margin: 0;
                }
                
                .prorata-widget__loading {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                    color: #6b7280;
                }
                
                .prorata-widget__loading::before {
                    content: '';
                    width: 20px;
                    height: 20px;
                    border: 2px solid #e5e7eb;
                    border-top: 2px solid var(--prorata-primary-color, #3b82f6);
                    border-radius: 50%;
                    animation: prorata-spin 1s linear infinite;
                    margin-right: 8px;
                }
                
                @keyframes prorata-spin {
                    to { transform: rotate(360deg); }
                }
                
                .prorata-widget__error {
                    padding: 16px 20px;
                    background: #fef2f2;
                    border: 1px solid #fecaca;
                    border-radius: calc(var(--prorata-border-radius, 12px) - 4px);
                    color: #dc2626;
                    margin-top: 16px;
                }
                
                @media (max-width: 768px) {
                    .prorata-widget {
                        padding: 16px;
                        margin: 16px 0;
                    }
                    
                    .prorata-widget__search-input {
                        font-size: 16px;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        detectTheme() {
            const computedStyle = getComputedStyle(document.body);
            
            // Detect primary color
            const primaryColor = this.detectPrimaryColor(computedStyle);
            if (primaryColor) {
                document.documentElement.style.setProperty('--prorata-primary-color', primaryColor);
                document.documentElement.style.setProperty('--prorata-primary-hover', this.adjustColor(primaryColor, -10));
            }
            
            // Detect font family
            const fontFamily = computedStyle.fontFamily;
            if (fontFamily && fontFamily !== 'initial') {
                document.documentElement.style.setProperty('--prorata-font-family', fontFamily);
            }
            
            // Detect background color
            const bgColor = computedStyle.backgroundColor;
            if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)') {
                document.documentElement.style.setProperty('--prorata-bg-color', bgColor);
            }
        }

        detectPrimaryColor(styles) {
            // Look for common CSS custom properties that might indicate brand colors
            const possibleVars = [
                '--primary-color', '--brand-color', '--accent-color',
                '--main-color', '--theme-color', '--primary',
                '--color-primary', '--brand-primary'
            ];
            
            for (const varName of possibleVars) {
                const value = getComputedStyle(document.documentElement).getPropertyValue(varName);
                if (value && value.trim()) {
                    return value.trim();
                }
            }
            
            return null;
        }

        adjustColor(color, percent) {
            // Simple color adjustment helper
            const num = parseInt(color.replace("#", ""), 16);
            const amt = Math.round(2.55 * percent);
            const R = (num >> 16) + amt;
            const G = (num >> 8 & 0x00FF) + amt;
            const B = (num & 0x0000FF) + amt;
            return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
                (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
                (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
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
                <div class="prorata-widget__search">
                    <input 
                        type="text" 
                        class="prorata-widget__search-input" 
                        placeholder="Ask a question about this content..."
                        id="${this.widgetId}-search-input"
                        aria-label="Ask a question"
                    >
                    <button 
                        class="prorata-widget__search-button" 
                        id="${this.widgetId}-search-button"
                        aria-label="Submit question"
                    >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 17C13.4183 17 17 13.4183 17 9C17 4.58172 13.4183 1 9 1C4.58172 1 1 4.58172 1 9C1 13.4183 4.58172 17 9 17Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M19 19L14.65 14.65" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
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
        }

        async handleSearch(query) {
            try {
                // Show loading state
                this.showLoading();
                
                // Call OpenAI API
                const response = await this.callOpenAI(query);
                
                // Display answer
                this.displayAnswer(response);
                
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
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 500
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
                // Retry logic
                if (this.retryCount < this.options.retryAttempts) {
                    this.retryCount++;
                    await this.delay(this.options.retryDelay * this.retryCount);
                    return this.callOpenAI(prompt);
                }
                throw error;
            }
        }

        showLoading() {
            const widget = document.getElementById(this.widgetId);
            if (!widget) return;
            
            // Remove previous answer or error
            const existingAnswer = widget.querySelector('.prorata-widget__answer');
            const existingError = widget.querySelector('.prorata-widget__error');
            if (existingAnswer) existingAnswer.remove();
            if (existingError) existingError.remove();
            
            // Show loading
            const loadingContainer = document.createElement('div');
            loadingContainer.className = 'prorata-widget__loading';
            loadingContainer.textContent = 'Thinking...';
            
            widget.appendChild(loadingContainer);
        }

        displayAnswer(response) {
            const widget = document.getElementById(this.widgetId);
            if (!widget) return;
            
            // Remove loading state
            const existingLoading = widget.querySelector('.prorata-widget__loading');
            if (existingLoading) existingLoading.remove();
            
            // Create answer container
            const answerContainer = document.createElement('div');
            answerContainer.className = 'prorata-widget__answer';
            
            // Extract answer from OpenAI response
            const answer = response.choices && response.choices[0] 
                ? response.choices[0].message.content 
                : 'No answer available';
            
            answerContainer.innerHTML = `
                <h3>Answer</h3>
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

        handleError(error) {
            console.error('ProRata Widget Error:', error);
            
            const widget = document.getElementById(this.widgetId);
            if (!widget) return;
            
            // Remove loading state
            const existingLoading = widget.querySelector('.prorata-widget__loading');
            if (existingLoading) existingLoading.remove();
            
            // Display user-friendly error
            const errorContainer = document.createElement('div');
            errorContainer.className = 'prorata-widget__error';
            errorContainer.textContent = 'Something went wrong. Please try again later.';
            
            widget.appendChild(errorContainer);
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
            this.initialized = false;
            this.dispatchEvent('destroyed');
        }

        refresh() {
            if (this.initialized) {
                // Clear any existing answers
                const widget = document.getElementById(this.widgetId);
                if (widget) {
                    const answer = widget.querySelector('.prorata-widget__answer');
                    const error = widget.querySelector('.prorata-widget__error');
                    if (answer) answer.remove();
                    if (error) error.remove();
                }
            }
        }
    }

    // Auto-initialization from script tag
    function autoInit() {
        const script = document.currentScript || document.querySelector('script[src*="widget.js"]');
        const target = script ? script.getAttribute('data-target') : null;
        
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