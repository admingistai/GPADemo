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
}); 
