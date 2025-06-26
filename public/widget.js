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
                    const name = tag.content.replace('@', '');
                    return name === 'Powered Website Search' ? 'Gist' : name;
                }
            }

            // Try to get from structured data
            const structuredData = document.querySelector('script[type="application/ld+json"]');
            if (structuredData) {
                try {
                    const data = JSON.parse(structuredData.textContent);
                    if (data.publisher && data.publisher.name) {
                        return data.publisher.name === 'Powered Website Search' ? 'Gist' : data.publisher.name;
                    }
                    if (data.name) {
                        return data.name === 'Powered Website Search' ? 'Gist' : data.name;
                    }
                } catch (e) {
                    console.error('Error parsing structured data:', e);
                }
            }

            // Fallback to document title or domain
            const titleParts = document.title.split(/[-|]/);
            if (titleParts.length > 1) {
                const name = titleParts[titleParts.length - 1].trim();
                return name === 'Powered Website Search' ? 'Gist' : name;
            }
            
            const fallback = window.location.hostname.replace('www.', '').split('.')[0];
            return fallback === 'Powered Website Search' ? 'Gist' : fallback;
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
                display: block !important;
                width: 100%;
                margin-top: 16px;
            }

            .gist-source-card-vertical {
                display: block !important;
                width: 100% !important;
                margin-bottom: 16px;
                box-sizing: border-box;
            }

            .gist-source-card-vertical:last-child {
                margin-bottom: 0;
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
                100% { transform: rotate(-360deg); }
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
                    // Return only the current page URL as context
                    return window.location.href;
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
                        const currentHost = window.location.protocol + '//' + window.location.host;
                        const apiEndpoint = currentHost + '/api/chat';
                        const requestBody = {
                            question: question,
                            context: getPageContext()
                        };
                        console.log('[Widget] POST', apiEndpoint, requestBody);
                        const response = await fetch(apiEndpoint, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Origin': currentHost
                            },
                            credentials: 'same-origin',
                            body: JSON.stringify(requestBody)
                        });
                        console.log('[Widget] Response status:', response.status);
                        if (!response.ok) {
                            let errorText = '';
                            try {
                                const errorData = await response.json();
                                errorText = JSON.stringify(errorData, null, 2);
                                console.error('[Widget] Error response data:', errorData);
                            } catch (e) {
                                try {
                                    errorText = await response.text();
                                    console.error('[Widget] Error response text:', errorText);
                                } catch (e2) {
                                    console.error('[Widget] Could not read error response:', e2);
                                }
                            }
                            throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`);
                        }
                        const data = await response.json();
                        console.log('[Widget] API response:', data);
                        // Render answer as HTML from markdown
                        function renderMarkdown(md) {
                            // Basic markdown to HTML conversion (bold, italics, headings, lists)
                            let html = md
                                .replace(/^### (.*$)/gim, '<h3>$1</h3>')
                                .replace(/^## (.*$)/gim, '<h2>$1</h2>')
                                .replace(/^# (.*$)/gim, '<h1>$1</h1>')
                                .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
                                .replace(/\*(.*?)\*/gim, '<em>$1</em>')
                                .replace(/\n\n/g, '<br><br>')
                                .replace(/\n/g, '<br>')
                                .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank">$1</a>')
                                .replace(/^\s*\* (.*)$/gim, '<li>$1</li>');
                            // Wrap <li> in <ul> if any
                            if (/<li>/.test(html)) {
                                html = html.replace(/(<li>.*<\/li>)/gims, '<ul>$1</ul>');
                            }
                            return html;
                        }
                        // Remove bracketed numbers like [1], [23] from the answer before rendering
                        const cleanedAnswer = data.answer.replace(/\s*\[\d+\]\s*/g, '');
                        // Attribution bar and sources
                        const sources = [];
                        const colors = ['#4B9FE1', '#8860D0', '#FF8C42', '#10B981', '#F59E0B', '#EF4444'];
                        if (data.attributions && data.attributions.domain_credit_dist) {
                            let colorIndex = 0;
                            for (const [domain, percentage] of Object.entries(data.attributions.domain_credit_dist)) {
                                if (percentage > 0) {
                                    sources.push({
                                        name: domain,
                                        percentage: percentage, // Use raw percentage (0.42 for 42%)
                                        color: colors[colorIndex % colors.length],
                                        description: `Content from ${domain}`,
                                        logo: '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/></svg>'
                                    });
                                    colorIndex++;
                                }
                            }
                        }
                        if (sources.length === 0) {
                            sources.push({
                                name: 'Current Page',
                                percentage: 1,
                                color: '#4B9FE1',
                                description: 'Content extracted from the current webpage you\'re viewing',
                                logo: '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M4 4h16v16H4z"/><path d="M9 8h6m-6 4h6m-6 4h6"/></svg>'
                            });
                        }
                        const attributionHTML = `
                            <div class="gist-attribution">
                                <div class="gist-attribution-title">Answer sources:</div>
                                <div class="gist-attribution-bar">
                                    ${sources.map(source => 
                                        `<div class="gist-attribution-segment" style="width: ${(source.percentage * 100).toFixed(1)}%; background: ${source.color};"></div>`
                                    ).join('')}
                                </div>
                                <div class="gist-attribution-legend">
                                    ${sources.map(source => `
                                        <div class="gist-attribution-source">
                                            <div class="gist-attribution-dot" style="background: ${source.color};"></div>
                                            ${source.name} (${(source.percentage).toFixed(1)}%)
                                        </div>
                                    `).join('')}
                                </div>
                                <div class="gist-source-cards">
                                    ${generateSourceCards(data.citations, sources)}
                                </div>
                            </div>
                        `;
                        answerContainer.innerHTML = `
                            <div class="gist-answer">${renderMarkdown(cleanedAnswer)}</div>
                            ${attributionHTML}
                        `;
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
                                    const sourceCards = sourceCardsElement.querySelectorAll('.gist-source-card[data-url]');
                                    sourceCards.forEach(card => {
                                        card.style.cursor = 'pointer';
                                        card.addEventListener('click', () => {
                                            const url = card.getAttribute('data-url');
                                            if (url) {
                                                window.open(url, '_blank');
                                            }
                                        });
                                    });
                                }, 600);
                            }
                        });
                    } catch (error) {
                        console.error('[Widget] Error getting answer:', error);
                        answerContainer.innerHTML = `
                            <div class="gist-answer" style="color: #e74c3c;">
                                Sorry, I couldn't get an answer at this time. Please try again later.<br><small style="opacity: 0.7; font-size: 12px;">Error: ${error.message}</small>
                            </div>
                        `;
                        requestAnimationFrame(() => {
                            const answerElement = answerContainer.querySelector('.gist-answer');
                            if (answerElement) {
                                answerElement.classList.add('visible');
                            }
                        });
                    }
                }

                // Function to generate source cards from citations
                function generateSourceCards(citations, sources) {
                    if (!citations || !Array.isArray(citations) || citations.length === 0) {
                        // Fallback to attribution-based cards
                        return sources.map(source => {
                            // Try to construct a valid URL from the domain name if not already a URL
                            let url = '';
                            if (source.name.startsWith('http')) {
                                url = source.name;
                            } else if (source.name.includes('.')) {
                                url = 'https://' + source.name.replace(/^https?:\/\//, '');
                            }
                            return `
                                <div class="gist-source-card gist-source-card-vertical" data-url="${url}">
                                    <div class="gist-source-card-header">
                                        <div class="gist-source-logo" style="background: ${source.color}">
                                            ${source.logo}
                                        </div>
                                        <div class="gist-source-name">${source.name}</div>
                                    </div>
                                    <div class="gist-source-description">${source.description}</div>
                                </div>
                            `;
                        }).join('');
                    }
                    return citations.slice(0, 6).map((citation, index) => {
                        const sourceColor = sources.find(s => s.name === citation.domain)?.color || '#4B9FE1';
                        const favicon = citation.favicon || citation.favicon24 || citation.favicon40;
                        return `
                            <div class="gist-source-card gist-source-card-vertical" data-url="${citation.url}">
                                <div class="gist-source-card-header">
                                    <div class="gist-source-logo" style="background: ${sourceColor}">
                                        ${favicon ? 
                                            `<img src="${favicon}" alt="${citation.source}" style="width: 16px; height: 16px; border-radius: 2px;">` : 
                                            `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" style="width: 16px; height: 16px;"><path d="M12 2L2 7l10 5 10-5-10-5z"/></svg>`
                                        }
                                    </div>
                                    <div class="gist-source-name">${citation.source || citation.domain}</div>
                                    ${citation.date ? `<div class="gist-source-date">${formatDate(citation.date)}</div>` : ''}
                                </div>
                                <div class="gist-source-title">${citation.title || 'Untitled'}</div>
                                <div class="gist-source-description">${citation.first_words ? citation.first_words.substring(0, 120) + '...' : 'No description available'}</div>
                            </div>
                        `;
                    }).join('');
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