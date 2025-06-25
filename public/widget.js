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
                transition: all 0.3s ease;
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

            .gist-answer-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                z-index: 1000000;
                display: flex;
                align-items: center;
                justify-content: center;
                backdrop-filter: blur(5px);
            }

            .gist-answer-box {
                background: white;
                border-radius: 20px;
                max-width: 700px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
                animation: slideInUp 0.3s ease-out;
                position: relative;
            }

            @keyframes slideInUp {
                from {
                    opacity: 0;
                    transform: translateY(50px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .gist-answer-header {
                padding: 20px 20px 10px 20px;
                border-bottom: 1px solid #e5e5e5;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .gist-answer-title {
                font-size: 18px;
                font-weight: 600;
                color: #333;
                margin: 0;
                font-family: inherit;
            }

            .gist-close-button {
                background: none;
                border: none;
                font-size: 24px;
                color: #666;
                cursor: pointer;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: background-color 0.2s ease;
            }

            .gist-close-button:hover {
                background-color: #f0f0f0;
            }

            .gist-answer-content {
                padding: 20px;
            }

            .gist-question {
                background: #f8f9fa;
                padding: 15px;
                border-radius: 10px;
                margin-bottom: 20px;
                font-weight: 600;
                color: #333;
                border-left: 4px solid #4B9FE1;
            }

            .gist-answer {
                line-height: 1.6;
                color: #444;
                font-size: 16px;
            }

            .gist-loading {
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 40px;
                color: #666;
            }

            .gist-loading-spinner {
                width: 20px;
                height: 20px;
                border: 2px solid #e3e3e3;
                border-top: 2px solid #4B9FE1;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin-right: 10px;
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

                // Function to show answer modal
                function showAnswerModal(question) {
                    // Create modal HTML
                    const modalHTML = `
                        <div class="gist-answer-modal">
                            <div class="gist-answer-box">
                                <div class="gist-answer-header">
                                    <h3 class="gist-answer-title">Ask Anything™</h3>
                                    <button class="gist-close-button">×</button>
                                </div>
                                <div class="gist-answer-content">
                                    <div class="gist-question">${question}</div>
                                    <div class="gist-loading">
                                        <div class="gist-loading-spinner"></div>
                                        Thinking...
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;

                    // Add modal to page
                    const modalContainer = document.createElement('div');
                    modalContainer.innerHTML = modalHTML;
                    document.body.appendChild(modalContainer.firstElementChild);

                    // Add close functionality
                    const modal = document.querySelector('.gist-answer-modal');
                    const closeButton = modal.querySelector('.gist-close-button');
                    
                    closeButton.addEventListener('click', () => {
                        modal.remove();
                    });

                    // Close on backdrop click
                    modal.addEventListener('click', (e) => {
                        if (e.target === modal) {
                            modal.remove();
                        }
                    });

                    // Close on Escape key
                    document.addEventListener('keydown', function escHandler(e) {
                        if (e.key === 'Escape') {
                            modal.remove();
                            document.removeEventListener('keydown', escHandler);
                        }
                    });

                    // Simulate getting an answer after a delay
                    setTimeout(() => {
                        const loadingDiv = modal.querySelector('.gist-loading');
                        if (loadingDiv) {
                            loadingDiv.innerHTML = `
                                <div class="gist-answer">
                                    <p>I'm a demo AI assistant! In a real implementation, I would search through ${websiteName}'s content and licensed publisher sources to provide you with an accurate, cited answer to: "${question}"</p>
                                    
                                    <p>Here's what would happen:</p>
                                    <ul>
                                        <li>🔍 Search through ${websiteName}'s published content</li>
                                        <li>📚 Query our licensed publisher database</li>
                                        <li>🎯 Find the most relevant, accurate information</li>
                                        <li>📝 Provide a comprehensive answer with citations</li>
                                        <li>🔒 All while maintaining your privacy (no tracking, no cookies)</li>
                                    </ul>
                                    
                                    <p><strong>This is just a demo!</strong> The real Ask Anything™ widget would connect to our AI system to give you actual answers.</p>
                                </div>
                            `;
                        }
                    }, 2000);
                }

                // Function to handle search
                function handleSearch() {
                    const query = searchInput.value.trim();
                    if (query) {
                        showAnswerModal(query);
                        searchInput.value = ''; // Clear input
                        // Show placeholder again
                        const placeholderSpan = searchInput.parentElement.querySelector('.placeholder-span');
                        if (placeholderSpan) {
                            placeholderSpan.style.display = 'block';
                        }
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
        } else {
            console.error('Widget: document.body not available');
        }
    }

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWidget);
    } else {
        // DOM is already ready
        initWidget();
    }
})();