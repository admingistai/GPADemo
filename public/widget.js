(function() {
    // Function to safely append widget when DOM is ready
    function initWidget() {
        // Function to get website name
        function getWebsiteName() {
            // Try to get from meta tags first
            const metaTags = [
                document.querySelector('meta[property="og:site_name"]'),
                document.querySelector('meta[name="application-name"]'),
                document.querySelector('meta[name="twitter:site"]')
            ];
            
            for (const tag of metaTags) {
                if (tag && tag.content) {
                    return tag.content.replace('@', '');
                }
            }

            // Try to get from structured data
            const structuredData = document.querySelector('script[type="application/ld+json"]');
            if (structuredData) {
                try {
                    const data = JSON.parse(structuredData.textContent);
                    if (data.publisher && data.publisher.name) {
                        return data.publisher.name;
                    }
                    if (data.name) {
                        return data.name;
                    }
                } catch (e) {
                    console.error('Error parsing structured data:', e);
                }
            }

            // Fallback to document title or domain
            const titleParts = document.title.split(/[-|]/);
            if (titleParts.length > 1) {
                return titleParts[titleParts.length - 1].trim();
            }
            
            return window.location.hostname.replace('www.', '').split('.')[0];
        }

        // Create and inject styles
        const styles = `
            .gist-widget-container {
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 999999;
                width: 220px;
                max-width: 90%;
                background: white;
                border-radius: 50px;
                padding: 8px 16px;
                box-sizing: border-box;
                display: flex;
                align-items: center;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                border: 2px solid transparent;
                background-image: linear-gradient(white, white), 
                                linear-gradient(60deg, #FF8C42, #4B9FE1, #8860D0);
                background-origin: border-box;
                background-clip: padding-box, border-box;
                white-space: nowrap;
                overflow: hidden;
            }

            .gist-widget-container:hover,
            .gist-widget-container.expanded {
                width: 475px;
                padding: 12px 24px;
                transform: translateX(-50%) translateY(-2px);
            }

            .gist-widget-container:not(:hover):not(.expanded) .gist-website-name {
                opacity: 0;
                visibility: hidden;
                max-width: 0;
                margin: 0;
            }

            .placeholder-span {
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                max-width: 100%;
            }

            .gist-website-name {
                font-weight: bold;
                font-family: inherit;
                transition: all 0.3s ease;
                opacity: 1;
                visibility: visible;
                max-width: 200px;
                margin: 0 1px;
            }

            .gist-search-input {
                flex: 1;
                border: none;
                outline: none;
                font-size: 16px;
                padding: 8px 8px 8px 0;
                background: transparent;
                color: #333;
                font-family: inherit;
                text-indent: 0;
                width: 100%;
                transition: all 0.3s ease;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .gist-search-input::placeholder {
                color: #666;
                transition: all 0.3s ease;
            }

            .gist-search-icon {
                width: 28px;
                height: 28px;
                margin-right: 10px;
                margin-left: -4px;
                opacity: 0.7;
                object-fit: contain;
            }

            .gist-arrow-icon {
                width: 18px;
                height: 18px;
                stroke: white;
                stroke-width: 2;
                fill: none;
            }

            .gist-arrow-button {
                width: 32px;
                height: 32px;
                background: #666666;
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

            .gist-answer-container {
                position: fixed;
                bottom: 90px;
                left: 50%;
                transform: translateX(-50%) translateY(20px);
                z-index: 999998;
                width: 475px;
                max-width: 90%;
                background: white;
                border-radius: 20px;
                padding: 20px;
                box-sizing: border-box;
                box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                opacity: 0;
                pointer-events: none;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                max-height: 60vh;
                overflow-y: auto;
                border: 2px solid transparent;
                background-image: linear-gradient(white, white), 
                                linear-gradient(60deg, #FF8C42, #4B9FE1, #8860D0);
                background-origin: border-box;
                background-clip: padding-box, border-box;
            }

            .gist-attribution {
                margin-top: 20px;
                padding-top: 15px;
                border-top: 1px solid #eee;
                opacity: 0;
                transform: translateY(10px);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .gist-attribution.visible {
                opacity: 1;
                transform: translateY(0);
            }

            .gist-attribution-title {
                font-size: 12px;
                color: #666;
                margin-bottom: 8px;
            }

            .gist-attribution-bar {
                height: 6px;
                background: #f0f0f0;
                border-radius: 3px;
                overflow: hidden;
                display: flex;
            }

            .gist-attribution-segment {
                height: 100%;
                transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .gist-attribution-legend {
                display: flex;
                flex-wrap: wrap;
                gap: 12px;
                margin-top: 8px;
                margin-bottom: 15px;
                font-size: 12px;
            }

            .gist-attribution-source {
                display: flex;
                align-items: center;
                gap: 6px;
                color: #666;
            }

            .gist-attribution-dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
            }

            .gist-source-cards {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 10px;
                margin-top: 15px;
                opacity: 0;
                transform: translateY(10px);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .gist-source-cards.visible {
                opacity: 1;
                transform: translateY(0);
            }

            .gist-source-card {
                background: #f8f9fa;
                border-radius: 8px;
                padding: 12px;
                display: flex;
                flex-direction: column;
                gap: 8px;
                border: 1px solid #eee;
                transition: transform 0.2s ease;
            }

            .gist-source-card:hover {
                transform: translateY(-2px);
            }

            .gist-source-card-header {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .gist-source-logo {
                width: 20px;
                height: 20px;
                border-radius: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .gist-source-logo svg {
                width: 16px;
                height: 16px;
            }

            .gist-source-name {
                font-size: 13px;
                font-weight: 600;
                color: #333;
            }

            .gist-source-description {
                font-size: 12px;
                color: #666;
                line-height: 1.4;
            }

            .gist-answer-container.visible {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
                pointer-events: all;
            }

            .gist-answer-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
                padding-bottom: 10px;
                border-bottom: 1px solid #eee;
            }

            .gist-answer-title {
                font-size: 16px;
                font-weight: 600;
                color: #333;
                margin: 0;
            }

            .gist-close-button {
                background: none;
                border: none;
                font-size: 20px;
                color: #666;
                cursor: pointer;
                padding: 5px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                width: 30px;
                height: 30px;
                transition: background-color 0.2s ease;
            }

            .gist-close-button:hover {
                background-color: #f0f0f0;
            }

            .gist-question {
                background: #f8f9fa;
                padding: 15px;
                border-radius: 10px;
                margin-bottom: 15px;
                font-weight: 500;
                color: #333;
                border-left: 4px solid #4B9FE1;
            }

            .gist-answer {
                line-height: 1.6;
                color: #333;
                font-size: 15px;
                white-space: pre-wrap;
                opacity: 0;
                transform: translateY(10px);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .gist-answer.visible {
                opacity: 1;
                transform: translateY(0);
            }

            .gist-loading {
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
                color: #666;
                gap: 10px;
                opacity: 0;
                transform: translateY(10px);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .gist-loading.visible {
                opacity: 1;
                transform: translateY(0);
            }

            .gist-loading-spinner {
                width: 20px;
                height: 20px;
                border: 2px solid #e3e3e3;
                border-top: 2px solid #4B9FE1;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;

        // Create style element and append to head (with safety check)
        if (document.head) {
            const styleSheet = document.createElement('style');
            styleSheet.textContent = styles;
            document.head.appendChild(styleSheet);
        }

        // Get website name
        const websiteName = getWebsiteName();

        // Create widget HTML using GitHub raw URL for sparkles.png
        const widgetHTML = `
            <div class="gist-widget-container">
                <img src="https://raw.githubusercontent.com/admingistai/GPADemo/main/public/sparkles.png" class="gist-search-icon" alt="sparkles icon" onerror="this.style.display='none'">
                <input type="text" class="gist-search-input" data-placeholder-parts="Ask ,${websiteName}, anything...">
                <button class="gist-arrow-button">
                    <svg class="gist-arrow-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 17L17 7M17 7H10M17 7V14" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
            </div>
        `;

        // Create container element and append to body (with safety check)
        if (document.body) {
            const container = document.createElement('div');
            container.innerHTML = widgetHTML;
            document.body.appendChild(container.firstElementChild);

            // Add input event listener and setup placeholder
            const searchInput = document.querySelector('.gist-search-input');
            
            if (searchInput) {
                // Function to update placeholder with bold website name
                function updatePlaceholder(input, isExpanded = false) {
                    const parts = input.dataset.placeholderParts.split(',');
                    const placeholderSpan = document.createElement('span');
                    placeholderSpan.style.position = 'absolute';
                    placeholderSpan.style.left = '57px'; // Adjust based on icon width + padding
                    placeholderSpan.style.top = '50%';
                    placeholderSpan.style.transform = 'translateY(-50%)';
                    placeholderSpan.style.color = '#666';
                    placeholderSpan.style.pointerEvents = 'none';
                    placeholderSpan.style.transition = 'all 0.3s ease';
                    
                    placeholderSpan.innerHTML = isExpanded ? 
                        `${parts[0]}<strong>${parts[1]}</strong>${parts[2]}` :
                        'Ask anything...';
                    
                    // Remove any existing placeholder span
                    const existingSpan = input.parentElement.querySelector('.placeholder-span');
                    if (existingSpan) {
                        existingSpan.remove();
                    }
                    
                    // Only show if input is empty
                    placeholderSpan.className = 'placeholder-span';
                    if (!input.value) {
                        input.parentElement.appendChild(placeholderSpan);
                    }
                }

                // Initial setup
                updatePlaceholder(searchInput, false);

                // Handle hover state
                const widgetContainer = searchInput.closest('.gist-widget-container');
                
                widgetContainer.addEventListener('mouseenter', function() {
                    updatePlaceholder(searchInput, true);
                });

                widgetContainer.addEventListener('mouseleave', function() {
                    if (!widgetContainer.classList.contains('expanded')) {
                        updatePlaceholder(searchInput, false);
                    }
                });

                // Handle input changes and focus
                searchInput.addEventListener('input', function() {
                    const placeholderSpan = this.parentElement.querySelector('.placeholder-span');
                    if (placeholderSpan) {
                        placeholderSpan.style.display = this.value ? 'none' : 'block';
                    }
                });

                searchInput.addEventListener('focus', function() {
                    widgetContainer.classList.add('expanded');
                    updatePlaceholder(searchInput, true);
                    if (!this.value) {
                        setTimeout(() => {
                            this.setSelectionRange(0, 0);
                        }, 0);
                    }
                });

                searchInput.addEventListener('blur', function() {
                    if (!this.value) {
                        widgetContainer.classList.remove('expanded');
                        updatePlaceholder(searchInput, false);
                    }
                });

                // Function to gather page context
                function getPageContext() {
                    // Get main content
                    const mainContent = document.querySelector('main, article, .main-content, #main-content');
                    let content = '';

                    if (mainContent) {
                        content = mainContent.textContent;
                    } else {
                        // Fallback to body content
                        const bodyText = document.body.textContent;
                        // Remove script contents
                        content = bodyText.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
                    }

                    // Clean up the content
                    content = content
                        .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
                        .replace(/[\r\n]+/g, ' ')  // Remove newlines
                        .trim();

                    // Get meta description
                    const metaDesc = document.querySelector('meta[name="description"]')?.content || '';
                    
                    // Get page title
                    const title = document.title;

                    // Combine context
                    return `Page Title: ${title}\\n\\nMeta Description: ${metaDesc}\\n\\nPage Content: ${content.substring(0, 2000)}`;
                }

                // Function to minimize widget
                function minimizeWidget() {
                    const widgetContainer = document.querySelector('.gist-widget-container');
                    const answerContainer = document.querySelector('.gist-answer-container');
                    const searchInput = document.querySelector('.gist-search-input');
                    
                    if (widgetContainer) {
                        widgetContainer.classList.remove('expanded');
                        // Update placeholder if needed
                        if (searchInput && !searchInput.value) {
                            updatePlaceholder(searchInput, false);
                        }
                    }
                    
                    if (answerContainer) {
                        answerContainer.classList.remove('visible');
                        setTimeout(() => {
                            answerContainer.remove();
                        }, 300);
                    }
                }

                // Function to show answer container
                async function showAnswerContainer(question) {
                    // Remove any existing answer container
                    const existingContainer = document.querySelector('.gist-answer-container');
                    if (existingContainer) {
                        existingContainer.remove();
                    }

                    // Create answer container with loading state
                    const answerContainerHTML = `
                        <div class="gist-answer-container">
                            <div class="gist-loading">
                                <div class="gist-loading-spinner"></div>
                                Getting answer...
                            </div>
                        </div>
                    `;

                    // Add container to page
                    const container = document.createElement('div');
                    container.innerHTML = answerContainerHTML;
                    document.body.appendChild(container.firstElementChild);

                    // Show container with animation
                    const answerContainer = document.querySelector('.gist-answer-container');
                    const loadingElement = answerContainer.querySelector('.gist-loading');
                    
                    requestAnimationFrame(() => {
                        answerContainer.classList.add('visible');
                        loadingElement.classList.add('visible');
                    });

                    try {
                        // Get page context
                        const pageContext = getPageContext();

                        // Make API call
                        // Get the script's source URL to determine the API endpoint
                        const scriptElement = document.currentScript || (function() {
                            const scripts = document.getElementsByTagName('script');
                            for (let i = scripts.length - 1; i >= 0; i--) {
                                const script = scripts[i];
                                if (script.src && script.src.includes('widget.js')) {
                                    return script;
                                }
                            }
                            return scripts[scripts.length - 1];
                        })();

                        if (!scriptElement || !scriptElement.src) {
                            throw new Error('Could not determine widget script location');
                        }

                        const scriptSrc = scriptElement.src;
                        const scriptUrl = new URL(scriptSrc);
                        const apiUrl = `${scriptUrl.protocol}//${scriptUrl.host}/api/proxy`;
                        
                        console.log('Widget script location:', scriptSrc);
                        console.log('Making API request to:', apiUrl);
                        
                        const response = await fetch(apiUrl, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                url: 'https://theatlantic.com/api/chat',
                                question,
                                pageContext
                            })
                        });

                        if (!response.ok) {
                            const errorText = await response.text();
                            console.error('API response not ok:', {
                                status: response.status,
                                statusText: response.statusText,
                                errorText
                            });
                            throw new Error(`API call failed: ${response.status} ${response.statusText}`);
                        }

                        const data = await response.json();
                        console.log('API response received:', data);

                        // Generate mock attribution data
                        const sources = [
                            { 
                                name: 'Current Page',
                                percentage: 45,
                                color: '#4B9FE1',
                                description: 'Content extracted from the current webpage you\'re viewing',
                                logo: '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M4 4h16v16H4z"/><path d="M9 8h6m-6 4h6m-6 4h6"/></svg>'
                            },
                            { 
                                name: 'Documentation',
                                percentage: 30,
                                color: '#8860D0',
                                description: 'Official documentation and technical references',
                                logo: '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M12 6v12m-6-6h12"/></svg>'
                            },
                            { 
                                name: 'Knowledge Base',
                                percentage: 25,
                                color: '#FF8C42',
                                description: 'Curated knowledge from verified sources',
                                logo: '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>'
                            }
                        ];

                        // Create attribution bar HTML
                        const attributionHTML = `
                            <div class="gist-attribution">
                                <div class="gist-attribution-title">Answer sources:</div>
                                <div class="gist-attribution-bar">
                                    ${sources.map(source => 
                                        `<div class="gist-attribution-segment" style="width: ${source.percentage}%; background: ${source.color};"></div>`
                                    ).join('')}
                                </div>
                                <div class="gist-attribution-legend">
                                    ${sources.map(source => `
                                        <div class="gist-attribution-source">
                                            <div class="gist-attribution-dot" style="background: ${source.color};"></div>
                                            ${source.name} (${source.percentage}%)
                                        </div>
                                    `).join('')}
                                </div>
                                <div class="gist-source-cards">
                                    ${sources.map(source => `
                                        <div class="gist-source-card">
                                            <div class="gist-source-card-header">
                                                <div class="gist-source-logo" style="background: ${source.color}">
                                                    ${source.logo}
                                                </div>
                                                <div class="gist-source-name">${source.name}</div>
                                            </div>
                                            <div class="gist-source-description">${source.description}</div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        `;

                        // Update container with answer and attribution
                        answerContainer.innerHTML = `
                            <div class="gist-answer">${data.answer}</div>
                            ${attributionHTML}
                        `;

                        // Animate the answer and attribution in
                        requestAnimationFrame(() => {
                            const answerElement = answerContainer.querySelector('.gist-answer');
                            const attributionElement = answerContainer.querySelector('.gist-attribution');
                            const sourceCardsElement = answerContainer.querySelector('.gist-source-cards');
                            if (answerElement) {
                                answerElement.classList.add('visible');
                            }
                            if (attributionElement) {
                                setTimeout(() => {
                                    attributionElement.classList.add('visible');
                                }, 300);
                            }
                            if (sourceCardsElement) {
                                setTimeout(() => {
                                    sourceCardsElement.classList.add('visible');
                                }, 600);
                            }
                        });

                    } catch (error) {
                        console.error('Error getting answer:', error);
                        let errorMessage = 'Sorry, I couldn\'t get an answer at this time. Please try again later.';
                        
                        if (error.message.includes('404')) {
                            errorMessage = 'Sorry, the API endpoint could not be found. This might be a configuration issue.';
                        } else if (error.message.includes('Failed to fetch')) {
                            errorMessage = 'Sorry, there was a network error. Please check your internet connection and try again.';
                        } else if (error.message.includes('Could not determine widget script location')) {
                            errorMessage = 'Sorry, there was an error initializing the widget. Please check the installation instructions.';
                        }
                        
                        answerContainer.innerHTML = `
                            <div class="gist-answer" style="color: #e74c3c;">
                                ${errorMessage}
                            </div>
                        `;
                        
                        // Animate the error message in
                        requestAnimationFrame(() => {
                            const answerElement = answerContainer.querySelector('.gist-answer');
                            if (answerElement) {
                                answerElement.classList.add('visible');
                            }
                        });
                    }
                }

                // Function to handle search
                function handleSearch() {
                    const query = searchInput.value.trim();
                    if (query) {
                        showAnswerContainer(query);
                    }
                }

                searchInput.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') {
                        handleSearch();
                    }
                });

                // Add click handler to arrow button
                const arrowButton = document.querySelector('.gist-arrow-button');
                if (arrowButton) {
                    arrowButton.addEventListener('click', handleSearch);
                }
            }

            // Add click-outside handler
            document.addEventListener('click', function(e) {
                const widgetContainer = document.querySelector('.gist-widget-container');
                const answerContainer = document.querySelector('.gist-answer-container');
                
                // Check if click is outside both containers
                if (widgetContainer && !widgetContainer.contains(e.target) && 
                    (!answerContainer || !answerContainer.contains(e.target))) {
                    minimizeWidget();
                }
            });

            // Prevent clicks inside the widget from triggering the document click handler
            document.querySelector('.gist-widget-container').addEventListener('click', function(e) {
                e.stopPropagation();
            });
        } else {
            console.error('Widget: document.body not available');
        }
    }

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initWidget();
            initDemoBannerDismiss();
        });
    } else {
        // DOM is already ready
        initWidget();
        initDemoBannerDismiss();
    }

    // Function to handle demo banner dismissal
    function initDemoBannerDismiss() {
        const demoBanner = document.getElementById('demo-banner');
        if (demoBanner) {
            demoBanner.style.cursor = 'pointer';
            demoBanner.addEventListener('click', function() {
                demoBanner.style.transition = 'all 0.3s ease';
                demoBanner.style.height = '0';
                demoBanner.style.padding = '0';
                demoBanner.style.opacity = '0';
                
                // Remove margin from body
                document.body.style.marginTop = '0';
                
                // Remove banner after animation
                setTimeout(() => {
                    demoBanner.remove();
                }, 300);
            });
        }
    }
})();