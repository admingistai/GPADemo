// News Website Interactive Features
document.addEventListener('DOMContentLoaded', function() {
    // Handle expandable articles
    const expandableArticles = document.querySelectorAll('.expandable');
    
    expandableArticles.forEach(article => {
        article.addEventListener('click', function() {
            const fullContent = this.querySelector('.full-content');
            
            if (fullContent) {
                if (fullContent.style.display === 'none' || fullContent.style.display === '') {
                    // Expand the article
                    fullContent.style.display = 'block';
                    this.classList.add('expanded');
                    
                    // Smooth scroll to the article
                    this.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'start' 
                    });
                } else {
                    // Collapse the article
                    fullContent.style.display = 'none';
                    this.classList.remove('expanded');
                }
            }
        });
        
        // Add keyboard accessibility
        article.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
        
        // Make articles focusable
        article.setAttribute('tabindex', '0');
        article.setAttribute('role', 'button');
        article.setAttribute('aria-expanded', 'false');
    });
    
    // Update aria-expanded when articles are expanded/collapsed
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const target = mutation.target;
                if (target.classList.contains('expandable')) {
                    const isExpanded = target.classList.contains('expanded');
                    target.setAttribute('aria-expanded', isExpanded);
                }
            }
        });
    });
    
    expandableArticles.forEach(article => {
        observer.observe(article, { attributes: true });
    });
    
    // Navigation active state
    const navLinks = document.querySelectorAll('.main-nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            // Add active class to clicked link
            this.classList.add('active');
        });
    });
    
    // Subscribe button functionality
    const subscribeBtn = document.querySelector('.subscribe-btn');
    if (subscribeBtn) {
        subscribeBtn.addEventListener('click', function() {
            alert('Thank you for your interest in subscribing to The Harbor! This is a demo website.');
        });
    }
    
    // Add visual feedback for article interactions
    expandableArticles.forEach(article => {
        article.addEventListener('mouseenter', function() {
            this.style.cursor = 'pointer';
        });
    });
    
    // Smooth scrolling for internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Add loading state for images
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('load', function() {
            this.style.opacity = '1';
        });
        
        img.addEventListener('error', function() {
            this.alt = 'Image unavailable';
            this.style.backgroundColor = '#f0f0f0';
            this.style.color = '#666';
            this.style.display = 'flex';
            this.style.alignItems = 'center';
            this.style.justifyContent = 'center';
            this.style.fontSize = '0.9rem';
        });
    });
    
    // Print functionality
    function printPage() {
        window.print();
    }
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + P for print
        if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
            e.preventDefault();
            printPage();
        }
        
        // Escape to collapse all expanded articles
        if (e.key === 'Escape') {
            expandableArticles.forEach(article => {
                const fullContent = article.querySelector('.full-content');
                if (fullContent && fullContent.style.display !== 'none') {
                    fullContent.style.display = 'none';
                    article.classList.remove('expanded');
                    article.setAttribute('aria-expanded', 'false');
                }
            });
        }
    });
    
    // Update date if needed (though it's hardcoded for this demo)
    const dateElement = document.querySelector('.date');
    if (dateElement) {
        // For a real website, you might want to update this dynamically
        // const today = new Date();
        // const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        // dateElement.textContent = today.toLocaleDateString('en-US', options);
    }
    
    // Add subtle animations on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const fadeInObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Apply fade-in animation to news items
    const newsItems = document.querySelectorAll('.news-item, .featured-story, .headline-item');
    newsItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        fadeInObserver.observe(item);
    });

    // Floating search bar functionality
    const floatingSearchInput = document.getElementById('floating-search-input');
    const floatingSearchSubmit = document.getElementById('floating-search-submit');
    const floatingSuggestions = document.getElementById('floating-suggestions');
    
    if (floatingSearchInput && floatingSearchSubmit && floatingSuggestions) {
        let suggestionsVisible = false;
        
        // Handle search submission
        function handleFloatingSearch(query = null) {
            const searchQuery = query || floatingSearchInput.value.trim();
            if (searchQuery) {
                // Find the ArticleWidget instance and use its fullscreen panel
                const articleWidget = document.querySelector('article-widget');
                if (articleWidget) {
                    // Clear the input and hide suggestions
                    floatingSearchInput.value = '';
                    hideSuggestions();
                    
                    // Set the question on the widget and trigger the fullscreen panel immediately
                    articleWidget.question = searchQuery;
                    articleWidget.openPanel('fullscreen', searchQuery, articleWidget.getLoadingHTML());
                    articleWidget.scrollToLatestQuestion();
                    // Now trigger the API request, which will update the answer when ready
                    (async () => {
                        try {
                            const requestBody = {
                                question: articleWidget.formatQuestionWithPageTitle(searchQuery)
                            };
                            const response = await fetch(`${articleWidget.backendUrl}/api/chat`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(requestBody)
                            });
                            let responseData;
                            if (response.ok) {
                                responseData = await response.json();
                                if (responseData.success) {
                                    articleWidget.conversationHistory[0].answer = responseData.response;
                                    articleWidget.conversationHistory[0].sources = responseData.sources || [];
                                } else {
                                    articleWidget.conversationHistory[0].answer = responseData.message || 'Failed to get response from RAG system.';
                                    articleWidget.conversationHistory[0].sources = [];
                                }
                            } else {
                                articleWidget.conversationHistory[0].answer = 'Sorry, I couldn\'t process your question right now. Please try again.';
                                articleWidget.conversationHistory[0].sources = [];
                            }
                            await articleWidget.updateConversationDisplay();
                            await articleWidget.updateFollowupSuggestions();
                            articleWidget.scrollToLatestQuestion();
                        } catch (error) {
                            console.error('Error asking question:', error);
                            articleWidget.conversationHistory[0].answer = 'There was an error processing your question. Please try again.';
                            articleWidget.conversationHistory[0].sources = [];
                            await articleWidget.updateConversationDisplay();
                            articleWidget.scrollToLatestQuestion();
                        }
                    })();
                } else {
                    // Show error if widget not found instead of trying to navigate to deleted chat.html
                    console.error('ArticleWidget not found on page');
                    alert('Search functionality requires the article widget to be loaded. Please refresh the page and try again.');
                }
            }
        }
        
        // Show suggestions
        function showSuggestions() {
            if (!suggestionsVisible) {
                floatingSuggestions.classList.add('show');
                suggestionsVisible = true;
            }
        }
        
        // Hide suggestions
        function hideSuggestions() {
            if (suggestionsVisible) {
                floatingSuggestions.classList.remove('show');
                suggestionsVisible = false;
            }
        }
        
        // Click handler for submit button
        floatingSearchSubmit.addEventListener('click', handleFloatingSearch);
        
        // Enter key handler for input
        floatingSearchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleFloatingSearch();
            }
            if (e.key === 'Escape') {
                hideSuggestions();
                this.blur();
            }
        });
        
        // Show suggestions on focus and input
        floatingSearchInput.addEventListener('focus', function() {
            this.parentElement.style.boxShadow = '0 6px 25px rgba(0, 0, 0, 0.2)';
            showSuggestions();
        });
        
        floatingSearchInput.addEventListener('input', function() {
            if (this.value.trim() === '') {
                showSuggestions();
            }
        });
        
        // Hide suggestions on blur (with small delay to allow clicking suggestions)
        floatingSearchInput.addEventListener('blur', function() {
            this.parentElement.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
            setTimeout(() => {
                hideSuggestions();
            }, 150);
        });
        
        // Handle suggestion clicks
        const suggestionItems = floatingSuggestions.querySelectorAll('.suggestion-item');
        suggestionItems.forEach(item => {
            item.addEventListener('click', function() {
                const query = this.getAttribute('data-query');
                handleFloatingSearch(query);
            });
            
            // Prevent blur when clicking suggestions
            item.addEventListener('mousedown', function(e) {
                e.preventDefault();
            });
        });
        
        // Hide suggestions when clicking outside
        document.addEventListener('click', function(e) {
            if (!floatingSearchInput.contains(e.target) && 
                !floatingSuggestions.contains(e.target)) {
                hideSuggestions();
            }
        });
    }

    // Dynamically populate floating suggestions from backend
    async function loadFloatingSuggestions() {
        const floatingSuggestions = document.getElementById('floating-suggestions');
        if (!floatingSuggestions) return;
        floatingSuggestions.innerHTML = '<div class="suggestions-header">Related questions about this article</div>';
        try {
            const response = await fetch('http://localhost:8000/api/generate-questions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            let questions = [];
            if (response.ok) {
                const data = await response.json();
                questions = data.questions || [];
            }
            if (!questions.length) {
                questions = [
                    'What are the main economic factors discussed?',
                    'How do current trends affect the future?',
                    'Can you summarize this article?'
                ];
            }
            questions.forEach(q => {
                const item = document.createElement('div');
                item.className = 'suggestion-item';
                item.setAttribute('data-query', q);
                item.innerHTML = `<span class="suggestion-text">${q}</span><span class="suggestion-arrow">→</span>`;
                item.addEventListener('click', function() {
                    handleFloatingSearch(q);
                });
                // Prevent blur when clicking suggestions
                item.addEventListener('mousedown', function(e) { e.preventDefault(); });
                floatingSuggestions.appendChild(item);
            });
        } catch (error) {
            console.error('Error loading floating suggestions:', error);
        }
    }

    // Call this on page load
    window.addEventListener('DOMContentLoaded', loadFloatingSuggestions);
}); 
