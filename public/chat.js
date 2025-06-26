// Chat page functionality
document.addEventListener('DOMContentLoaded', function() {
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const chatSendBtn = document.getElementById('chat-send-btn');
    const typingIndicator = document.getElementById('typing-indicator');
    
    // Get initial question from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const initialQuestion = urlParams.get('q');
    const returnUrl = urlParams.get('return') || 'retail-sales-article.html';
    
    // Update return link
    const returnLink = document.getElementById('return-link');
    if (returnLink) {
        returnLink.href = returnUrl;
    }
    
    // Add initial user message if question exists
    if (initialQuestion) {
        addMessage('user', initialQuestion);
        // Simulate AI response after a delay
        setTimeout(() => {
            showTypingIndicator();
            setTimeout(() => {
                hideTypingIndicator();
                addMessage('assistant', generateResponse(initialQuestion));
            }, 2000);
        }, 500);
    }
    
    // Auto-resize textarea
    chatInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';
        
        // Enable/disable send button
        chatSendBtn.disabled = this.value.trim() === '';
    });
    
    // Handle sending messages
    function sendMessage() {
        const message = chatInput.value.trim();
        if (message) {
            addMessage('user', message);
            chatInput.value = '';
            chatInput.style.height = 'auto';
            chatSendBtn.disabled = true;
            
            // Simulate AI response
            setTimeout(() => {
                showTypingIndicator();
                setTimeout(() => {
                    hideTypingIndicator();
                    addMessage('assistant', generateResponse(message));
                }, 1500 + Math.random() * 1000);
            }, 300);
        }
    }
    
    // Send button click handler
    chatSendBtn.addEventListener('click', sendMessage);
    
    // Enter key handler (Shift+Enter for new line)
    chatInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Add message to chat
    function addMessage(type, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = type === 'user' ? 'U' : 'H';
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.textContent = content;
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(messageContent);
        
        chatMessages.appendChild(messageDiv);
        scrollToBottom();
    }
    
    // Show typing indicator
    function showTypingIndicator() {
        typingIndicator.classList.add('show');
        scrollToBottom();
    }
    
    // Hide typing indicator
    function hideTypingIndicator() {
        typingIndicator.classList.remove('show');
    }
    
    // Scroll to bottom of chat
    function scrollToBottom() {
        setTimeout(() => {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 100);
    }
    
    // Generate demo responses based on question
    function generateResponse(question) {
        const responses = {
            'tariff': "Based on the article, tariffs have created significant volatility in retail pricing. The 30% duty on electric vehicles, semiconductors, and steel imports from China led to an 18% jump in container prices over six weeks. However, retailers are adapting through discount strategies and BNPL platforms to maintain consumer engagement.",
            
            'inflation': "The article indicates inflation is cooling, with the consumer price index slowing to 3.1% year-over-year in May. However, core inflation remains elevated at 3.8% due to persistent rent and service costs. This creates a challenging environment where grocery prices flatten but housing costs continue rising.",
            
            'federal reserve': "According to the article, the Federal Reserve kept interest rates unchanged at 5.25% during their June meeting. Fed officials are seeking more data before adjusting monetary policy, aiming for a 'soft landing' scenario with slow, steady growth and declining inflation.",
            
            'consumer': "Consumer behavior is shifting significantly. The article shows spending by the bottom income quartile declined for three consecutive months, while upper-quartile spending increased. Shoppers are gravitating toward discount outlets, BNPL platforms, and loyalty programs as adaptation strategies.",
            
            'retail sales': "May retail sales increased 0.3% seasonally adjusted, recovering from April's revised 0.1% decline. Department stores led the rebound with 1.2% growth, while grocery, apparel, and auto parts also posted gains. However, gas stations and furniture stores continued declining.",
            
            'default': "That's an interesting question about the retail sales situation. Based on the article's analysis, the data suggests cautious optimism but with underlying challenges. The recovery appears modest and fragile, with significant variations across income levels and retail sectors. Would you like me to elaborate on any specific aspect?"
        };
        
        // Simple keyword matching for demo purposes
        const lowerQuestion = question.toLowerCase();
        for (const [keyword, response] of Object.entries(responses)) {
            if (keyword !== 'default' && lowerQuestion.includes(keyword)) {
                return response;
            }
        }
        
        return responses.default;
    }
    
    // Initial setup
    chatSendBtn.disabled = true;
}); 