(function() {
    // Base64 encoded sparkles icon as fallback
    const sparklesBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAACXBIWXMAAAsTAAALEwEAmpwYAAAF0WlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNy4yLWMwMDAgNzkuMWI2NWE3OWI0LCAyMDIyLzA2LzEzLTIyOjAxOjAxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdEV2dD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlRXZlbnQjIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgMjQuMCAoTWFjaW50b3NoKSIgeG1wOkNyZWF0ZURhdGU9IjIwMjQtMDMtMTlUMTQ6NDc6MTgtMDc6MDAiIHhtcDpNZXRhZGF0YURhdGU9IjIwMjQtMDMtMTlUMTQ6NDc6MTgtMDc6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDI0LTAzLTE5VDE0OjQ3OjE4LTA3OjAwIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjY5ODYzZWJlLTM4ZTAtNDU4Ny1hNmE1LTNiYWM4YzA5ZjFmZiIgeG1wTU06RG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOjY5ODYzZWJlLTM4ZTAtNDU4Ny1hNmE1LTNiYWM4YzA5ZjFmZiIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOjY5ODYzZWJlLTM4ZTAtNDU4Ny1hNmE1LTNiYWM4YzA5ZjFmZiIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiPiA8eG1wTU06SGlzdG9yeT4gPHJkZjpTZXE+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjcmVhdGVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjY5ODYzZWJlLTM4ZTAtNDU4Ny1hNmE1LTNiYWM4YzA5ZjFmZiIgc3RFdnQ6d2hlbj0iMjAyNC0wMy0xOVQxNDo0NzoxOC0wNzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDI0LjAgKE1hY2ludG9zaCkiLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+wZXPWAAAAMNJREFUOI3t1D0KwkAQBeA3/kBEFBULQbS1t7HyHoKVYGHjYbyCnSfwBBaCYOMNxN7OG1gI/o1xJrCIcZNNFkR8MGR3mPftZGeXicgfaozneQ1jzNha2zHGzJVSS2PMSkRqWXVZgLquG4nISkQaWmtzY8xcKbVk5h4AiIgTkXae0WEY9rXWG2PMWCm1SJJkHwTBBQB8IvKyPHjvByLSJqJJkiT7MAyvzrkreW/0RN57PxCRDoCpiJycc1d6704P8JvzuQPwWYTZj8ZKYwAAAABJRU5ErkJggg==';

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
            object-fit: contain;
        }
    `;

    // Create style element and append to head
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    // Create widget HTML
    const widgetHTML = `
        <div class="gist-widget-container">
            <img src="https://www.getaskanything.com/sparkles.png" class="gist-search-icon" alt="sparkles icon" onerror="this.src='${sparklesBase64}'">
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