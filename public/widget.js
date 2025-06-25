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
            width: 20px;
            height: 20px;
            margin-right: 10px;
            opacity: 0.7;
            color: #666;
        }

        .gist-sparkle-icon {
            width: 24px;
            height: 24px;
            margin-right: 10px;
            opacity: 0.8;
        }
    `;

    // Create style element and append to head
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    // Create widget HTML
    const widgetHTML = `
        <div class="gist-widget-container">
            <svg class="gist-sparkle-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 3L14.5 8.5L20 11L14.5 13.5L12 19L9.5 13.5L4 11L9.5 8.5L12 3Z" fill="#FF8C42"/>
                <path d="M7 4L8 6L10 7L8 8L7 10L6 8L4 7L6 6L7 4Z" fill="#8860D0"/>
                <path d="M17 15L18 17L20 18L18 19L17 21L16 19L14 18L16 17L17 15Z" fill="#4B9FE1"/>
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
