(function() {
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
            font-style: italic;
        }

        .gist-search-icon {
            width: 24px;
            height: 24px;
            margin-right: 12px;
            opacity: 1;
        }
    `;

    // Create style element and append to head
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    // Create widget HTML
    const widgetHTML = `
        <div class="gist-widget-container">
            <svg class="gist-search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36">
                <path fill="#FF8C42" d="M35.5 16.7l-2.2-1.2-2.1 1.3-1.3-2.1 1.3-2.1-2.2-1.2-1.2 2.2-2.1-1.3 0.3-2.5-2.4-0.6-0.6 2.4-2.5-0.3-1.3-2.1-2.1 1.3-0.3-2.5-2.4 0.6 0.6 2.4-2.5 0.3-2.1-1.3-1.2 2.2 2.2 1.2-1.3 2.1-2.2-1.2-0.6 2.4 2.4 0.6-0.3 2.5-2.4-0.6 0.3 2.5 2.4-0.6 1.3 2.1-2.2 1.2 1.2 2.2 2.1-1.3 2.1 1.3-1.3 2.1 2.2 1.2 1.2-2.2 2.1 1.3-0.3 2.5 2.4 0.6 0.6-2.4 2.5 0.3 1.3 2.1 2.1-1.3 0.3 2.5 2.4-0.6-0.6-2.4 2.5-0.3 2.1 1.3 1.2-2.2-2.2-1.2 1.3-2.1 2.2 1.2 0.6-2.4-2.4-0.6 0.3-2.5 2.4 0.6z" />
                <path fill="#8860D0" d="M14.5 6.7l-1.2-0.6-1.1 0.7-0.7-1.1 0.7-1.1-1.2-0.6-0.6 1.2-1.1-0.7 0.2-1.3-1.3-0.3-0.3 1.3-1.3-0.2-0.7-1.1-1.1 0.7-0.2-1.3-1.3 0.3 0.3 1.3-1.3 0.2-1.1-0.7-0.6 1.2 1.2 0.6-0.7 1.1-1.2-0.6-0.3 1.3 1.3 0.3-0.2 1.3-1.3-0.3 0.2 1.3 1.3-0.3 0.7 1.1-1.2 0.6 0.6 1.2 1.1-0.7 1.1 0.7-0.7 1.1 1.2 0.6 0.6-1.2 1.1 0.7-0.2 1.3 1.3 0.3 0.3-1.3 1.3 0.2 0.7 1.1 1.1-0.7 0.2 1.3 1.3-0.3-0.3-1.3 1.3-0.2 1.1 0.7 0.6-1.2-1.2-0.6 0.7-1.1 1.2 0.6 0.3-1.3-1.3-0.3 0.2-1.3 1.3 0.3z" />
                <path fill="#FF8C42" d="M31.5 26.7l-0.8-0.4-0.7 0.5-0.5-0.7 0.5-0.7-0.8-0.4-0.4 0.8-0.7-0.5 0.1-0.9-0.9-0.2-0.2 0.9-0.9-0.1-0.5-0.7-0.7 0.5-0.1-0.9-0.9 0.2 0.2 0.9-0.9 0.1-0.7-0.5-0.4 0.8 0.8 0.4-0.5 0.7-0.8-0.4-0.2 0.9 0.9 0.2-0.1 0.9-0.9-0.2 0.1 0.9 0.9-0.2 0.5 0.7-0.8 0.4 0.4 0.8 0.7-0.5 0.7 0.5-0.5 0.7 0.8 0.4 0.4-0.8 0.7 0.5-0.1 0.9 0.9 0.2 0.2-0.9 0.9 0.1 0.5 0.7 0.7-0.5 0.1 0.9 0.9-0.2-0.2-0.9 0.9-0.1 0.7 0.5 0.4-0.8-0.8-0.4 0.5-0.7 0.8 0.4 0.2-0.9-0.9-0.2 0.1-0.9 0.9 0.2z" />
            </svg>
            <input type="text" class="gist-search-input" placeholder="Ask anything...">
        </div>
    `;

    // Create container element
    const container = document.createElement('div');
    container.innerHTML = widgetHTML;
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
