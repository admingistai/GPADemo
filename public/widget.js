(function() {
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
            width: 475px;
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
            font-weight: bold;
            font-family: inherit;
        }

        .gist-search-icon {
            width: 20px;
            height: 20px;
            margin-right: 10px;
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
    `;

    // Create style element and append to head
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

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

    // Create container element
    const container = document.createElement('div');
    container.innerHTML = widgetHTML;
    document.body.appendChild(container.firstElementChild);

    // Add input event listener and setup placeholder
    const searchInput = document.querySelector('.gist-search-input');
    
    // Function to update placeholder with bold website name
    function updatePlaceholder(input) {
        const parts = input.dataset.placeholderParts.split(',');
        const placeholderSpan = document.createElement('span');
        placeholderSpan.style.position = 'absolute';
        placeholderSpan.style.left = '52px'; // Adjust based on icon width + padding
        placeholderSpan.style.top = '50%';
        placeholderSpan.style.transform = 'translateY(-50%)';
        placeholderSpan.style.color = '#666';
        placeholderSpan.style.pointerEvents = 'none';
        
        placeholderSpan.innerHTML = `${parts[0]}<strong>${parts[1]}</strong>${parts[2]}`;
        
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
    updatePlaceholder(searchInput);

    // Handle input changes
    searchInput.addEventListener('input', function() {
        const placeholderSpan = this.parentElement.querySelector('.placeholder-span');
        if (placeholderSpan) {
            placeholderSpan.style.display = this.value ? 'none' : 'block';
        }
    });

    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            // TODO: Handle search query
            console.log('Search query:', e.target.value);
        }
    });
})();