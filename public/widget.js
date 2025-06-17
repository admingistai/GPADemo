/**
 * ProRata.ai Simple Widget - No Tools
 * Version: 3.0.0
 * Copyright (c) 2024 ProRata.ai
 */

(function() {
    'use strict';

    function createSimpleWidget() {
        // Basic styling only
        const styles = `
            <style>
                .prorata-simple-widget {
                    position: fixed;
                    bottom: 24px;
                    right: 24px;
                    width: 200px;
                    height: 60px;
                    background: #ffffff;
                    border-radius: 30px;
                    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    font-size: 14px;
                    font-weight: 500;
                    color: #374151;
                    z-index: 9999;
                    opacity: 0;
                    transform: translateY(10px);
                    transition: all 0.3s ease;
                }
                
                .prorata-simple-widget.loaded {
                    opacity: 1;
                    transform: translateY(0);
                }
                
                @media (max-width: 768px) {
                    .prorata-simple-widget {
                        bottom: 20px;
                        right: 20px;
                        left: 20px;
                        width: auto;
                    }
                }
            </style>
        `;
        
        // Simple widget HTML
        const widgetHTML = `
            ${styles}
            <div class="prorata-simple-widget" id="prorata-simple-widget">
                ProRata Widget
            </div>
        `;
        
        // Create shadow DOM container
        const container = document.createElement('div');
        container.id = 'prorata-widget-container';
        const shadowRoot = container.attachShadow({ mode: 'open' });
        shadowRoot.innerHTML = widgetHTML;
        
        // Add to page
        document.body.appendChild(container);
        
        // Show widget
        setTimeout(() => {
            const widget = shadowRoot.getElementById('prorata-simple-widget');
            if (widget) {
                widget.classList.add('loaded');
            }
        }, 150);
        
        return container;
    }

    // Initialize widget when DOM is ready
    function initWidget() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', createSimpleWidget);
        } else {
            createSimpleWidget();
        }
    }

    // Start initialization
    initWidget();
    
})();