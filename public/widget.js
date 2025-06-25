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
            margin-right: 10px;
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
            <img class="gist-search-icon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAAF8WlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNy4yLWMwMDAgNzkuMWI2NWE3OWI0LCAyMDIyLzA2LzEzLTIyOjAxOjAxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdEV2dD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlRXZlbnQjIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgMjQuMCAoTWFjaW50b3NoKSIgeG1wOkNyZWF0ZURhdGU9IjIwMjQtMDMtMjBUMTQ6NDc6NDctMDQ6MDAiIHhtcDpNZXRhZGF0YURhdGU9IjIwMjQtMDMtMjBUMTQ6NDc6NDctMDQ6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDI0LTAzLTIwVDE0OjQ3OjQ3LTA0OjAwIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjY5ZDM4ZmM1LTM2ZTAtNDM5ZS1hOWJkLTBmODNlZTBhMzE5YyIgeG1wTU06RG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOjY5ZDM4ZmM1LTM2ZTAtNDM5ZS1h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" alt="Search Icon">
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
