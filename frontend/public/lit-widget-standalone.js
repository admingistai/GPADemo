class ArticleWidget extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.isLoadingQuestions = false;
    this.response = '';
    this.question = '';
    this.relatedQuestions = [];
    this.conversationHistory = [];
    this.backendUrl = 'http://localhost:8000'; // RAG backend URL
    this.render();
    this.attachEventListeners();
    this.generateRelatedQuestions();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          max-width: 320px;
          font-family: Georgia, 'Times New Roman', serif;
        }

        .widget-container {
          background: #f8f8f8;
          border: none;
          border-radius: 8px;
          overflow: hidden;
        }

        .section-header {
          padding: 12px 12px;
          margin: 0 12px;
          border-bottom: 1px solid #d1d5db;
          font-size: 0.9rem;
          font-weight: 700;
          color: #dc2626;
          text-align: center;
          letter-spacing: 0.5px;
        }

        .questions-list {
          padding: 0;
        }

        .question-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 12px;
          margin: 0 12px;
          border-bottom: 1px solid #d1d5db;
          cursor: pointer;
          transition: background-color 0.2s;
          text-decoration: none;
          color: #000;
          white-space: nowrap;
          overflow: hidden;
        }

        .question-item:hover {
          background: #fafafa;
        }

        .question-item:last-child {
          border-bottom: none;
        }

        .question-item:first-child {
          margin-top: 0;
        }

        .question-text {
          font-size: 0.8rem;
          line-height: 1.3;
          text-overflow: ellipsis;
          overflow: hidden;
          flex: 1;
          font-weight: 600;
        }

        .arrow-icon {
          color: #666;
          font-size: 14px;
          margin-left: auto;
        }

        .ask-input-container {
          padding: 12px 12px 4px 12px;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          border: 2px solid transparent;
          background: linear-gradient(white, white) padding-box, 
                     linear-gradient(90deg, #ffb300 0%, #ff0066 50%, #4228ff 100%) border-box;
          border-radius: 26px;
          padding: 0;
        }

        .ask-input {
          width: 100%;
          padding: 10px 14px 10px 14px;
          padding-right: 44px;
          border: none;
          border-radius: 24px;
          font-size: 0.8rem;
          outline: none;
          transition: border-color 0.2s;
          box-sizing: border-box;
          resize: none;
          font-family: inherit;
          background: transparent;
        }

        .ask-input:focus {
          outline: none;
        }

        .ask-input::placeholder {
          color: #9ca3af;
        }

        .ask-submit-btn {
          position: absolute;
          right: 8px;
          width: 30px;
          height: 30px;
          background: #000;
          border: none;
          border-radius: 50%;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 900;
          line-height: 1;
          padding: 0;
        }

        .ask-submit-btn:hover {
          background: #333;
        }

        /* Powered By */
        .powered-by {
          text-align: right;
          font-size: 0.7rem;
          color: #666;
          padding: 4px 12px 8px 12px;
          margin: 0 12px;
          border-bottom: 1px solid #d1d5db;
          margin-bottom: 0;
        }

        .gist-brand {
          font-weight: 600;
          color: #8b5cf6;
        }

        .ad-content {
          padding: 12px 12px;
          text-align: left;
          position: relative;
        }

        .ad-title {
          font-size: 0.9rem;
          font-weight: 700;
          color: #000;
          margin-bottom: 0;
          line-height: 1.1;
        }

        .ad-description {
          font-size: 0.75rem;
          color: #333;
          line-height: 1.3;
          margin-bottom: 0;
        }

        .ad-link {
          color: #000;
          text-decoration: none;
          font-size: 0.75rem;
          font-weight: 600;
          display: inline-block;
          margin-top: 0;
          border-bottom: 1px solid #000;
          padding-bottom: 1px;
        }

        .ad-link:hover {
          background-color: #f0f0f0;
        }

        .ad-attribution {
          position: absolute;
          right: 8px;
          bottom: 4px;
          font-size: 0.65rem;
          color: #666;
        }

        /* Loading States */
        .loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: #6b7280;
          font-size: 12px;
        }

        .spinner {
          width: 14px;
          height: 14px;
          border: 2px solid #e5e7eb;
          border-top: 2px solid #8b5cf6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .questions-loading {
          padding: 20px;
          text-align: center;
          color: #6b7280;
          font-size: 14px;
        }

        /* Sources styling */
        .sources-section {
          margin-top: 16px;
          padding-top: 12px;
          border-top: 1px solid #e5e7eb;
        }

        .sources-title {
          font-size: 0.8rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 8px;
        }

        .source-item {
          margin-bottom: 8px;
          padding: 8px 12px;
          background: #f9fafb;
          border-radius: 6px;
          border-left: 3px solid #8b5cf6;
        }

        .source-link {
          color: #8b5cf6;
          text-decoration: none;
          font-size: 0.75rem;
          font-weight: 600;
          display: block;
          margin-bottom: 4px;
        }

        .source-link:hover {
          text-decoration: underline;
        }

        .source-snippet {
          font-size: 0.7rem;
          color: #6b7280;
          line-height: 1.3;
        }

        .source-score {
          font-size: 0.65rem;
          color: #9ca3af;
          float: right;
        }
      </style>
      
      <div class="widget-container">
        <div class="section-header">Related questions</div>
        <div class="questions-list" id="questions-list">
          <div class="questions-loading">
            <div class="loading">
              <div class="spinner"></div>
              Generating questions...
            </div>
          </div>
        </div>

        <div class="ask-input-container">
          <div class="input-wrapper">
            <input 
              class="ask-input"
              placeholder="✦ Ask The Harbor..."
              id="ask-input"
            />
            <button class="ask-submit-btn" id="ask-submit-btn">🡩</button>
          </div>
        </div>

        <div class="powered-by">
          Powered by <span class="gist-brand">Gist RAG</span>
        </div>

        <div class="ad-content">
          <div class="ad-title">How Rising Interest Rates Reshape Consumer Behavior</div>
          <div class="ad-description">Federal policy changes drive new spending patterns across demographics.</div>
          <a href="#" class="ad-link">Read the analysis</a>
          <span class="ad-attribution">Ad by ProRata</span>
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    const input = this.shadowRoot.querySelector('#ask-input');
    const askSubmitBtn = this.shadowRoot.querySelector('#ask-submit-btn');

    // Set initial question
    input.value = this.question;

    // Input handling
    input.addEventListener('input', (e) => {
      this.question = e.target.value;
    });

    // Enter key handling
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.handleAsk();
      }
    });

    // Ask button handling
    askSubmitBtn.addEventListener('click', () => this.handleAsk());
  }

  askQuestion(question) {
    this.question = question;
    const input = this.shadowRoot.querySelector('#ask-input');
    input.value = this.question;
    this.handleAsk();
  }

  async generateRelatedQuestions() {
    console.log('Generating related questions...');
    this.isLoadingQuestions = true;
    
    try {
      // Try to get questions from the new RAG backend
      const response = await fetch(`${this.backendUrl}/api/generate-questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        this.relatedQuestions = data.questions || [
          'What are the main economic factors discussed?',
          'How do current trends affect the future?',
          'Can you summarize this article?'
        ];
      } else {
        // Fallback questions
        this.relatedQuestions = [
          'What are the main economic factors discussed?',
          'How do current trends affect the future?',
          'Can you summarize this article?'
        ];
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      this.relatedQuestions = [
        'What are the main economic factors discussed?',
        'How do current trends affect the future?',
        'Can you summarize this article?'
      ];
    } finally {
      this.isLoadingQuestions = false;
      this.updateQuestionsDisplay();
    }
  }

  updateQuestionsDisplay() {
    const questionsList = this.shadowRoot.querySelector('#questions-list');
    
    if (this.isLoadingQuestions) {
      questionsList.innerHTML = `
        <div class="questions-loading">
          <div class="loading">
            <div class="spinner"></div>
            Generating questions...
          </div>
        </div>
      `;
    } else {
      questionsList.innerHTML = this.relatedQuestions.map(question => `
        <div class="question-item" data-question="${question}">
          <span class="question-text">${question}</span>
          <span class="arrow-icon">→</span>
        </div>
      `).join('');
      
      // Add click handlers to questions
      questionsList.querySelectorAll('.question-item').forEach(item => {
        item.addEventListener('click', () => {
          const question = item.getAttribute('data-question');
          this.askQuestion(question);
        });
      });
    }
  }

  async handleAsk() {
    if (!this.question.trim()) return;
    
    const askSubmitBtn = this.shadowRoot.querySelector('#ask-submit-btn');
    
    // Open side panel with loading state
    this.openSidePanel(this.question, 'Loading...');
    
    try {
      // Call the new RAG backend
      const requestBody = {
        question: this.question
      };
      
      const response = await fetch(`${this.backendUrl}/api/chat`, {
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
          // Update the first conversation item with the response including sources
          this.conversationHistory[0].answer = responseData.response;
          this.conversationHistory[0].sources = responseData.sources || [];
        } else {
          this.conversationHistory[0].answer = responseData.message || 'Failed to get response from RAG system.';
          this.conversationHistory[0].sources = [];
        }
      } else {
        this.conversationHistory[0].answer = 'Sorry, I couldn\'t process your question right now. Please try again.';
        this.conversationHistory[0].sources = [];
      }
      
      this.updateConversationDisplay();
      this.updateFollowupSuggestions();
      
    } catch (error) {
      console.error('Error asking question:', error);
      this.conversationHistory[0].answer = 'There was an error processing your question. Please try again.';
      this.conversationHistory[0].sources = [];
      this.updateConversationDisplay();
    }
  }

  createSidePanel() {
    // Remove existing panel if it exists
    const existingPanel = document.getElementById('harbor-side-panel-overlay');
    if (existingPanel) {
      existingPanel.remove();
    }

    // Create panel HTML (keeping most of the existing styles but adding sources display)
    const panelHTML = `
      <style>
        #harbor-side-panel-overlay {
          position: fixed;
          top: 0;
          right: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.3);
          z-index: 99998;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.3s ease, visibility 0.3s ease;
        }

        #harbor-side-panel-overlay.show {
          opacity: 1;
          visibility: visible;
        }

        #harbor-side-panel {
          position: fixed;
          top: 0;
          right: 0;
          width: 40vw;
          min-width: 400px;
          height: 100vh;
          background: white;
          z-index: 99999;
          transform: translateX(100%);
          transition: transform 0.3s ease;
          box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
          display: flex;
          flex-direction: column;
          font-family: Georgia, 'Times New Roman', serif;
        }

        #harbor-side-panel.show {
          transform: translateX(0);
        }

        .harbor-panel-header {
          padding: 20px;
          border-bottom: 1px solid #e5e7eb;
          background: #f9fafb;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .harbor-panel-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: #000;
          margin: 0;
        }

        .harbor-panel-close {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #666;
          padding: 4px;
          line-height: 1;
        }

        .harbor-panel-close:hover {
          color: #000;
        }

        .harbor-panel-content {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
          font-size: 0.9rem;
          line-height: 1.6;
          color: #333;
          padding-bottom: 0;
        }

        .harbor-question-display {
          background: #f0f0f0;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 20px;
          margin-left: auto;
          margin-right: 0;
          max-width: 85%;
          text-align: left;
        }

        .harbor-question-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }

        .harbor-question-text-display {
          font-size: 0.9rem;
          color: #000;
          font-weight: 600;
        }

        .harbor-answer-content {
          font-family: Georgia, 'Times New Roman', serif;
          text-align: left;
          margin-left: 0;
          margin-right: auto;
          max-width: 85%;
        }

        .conversation-item {
          margin-bottom: 24px;
        }

        .conversation-item:last-child {
          margin-bottom: 0;
        }

        /* Sources styling for side panel */
        .harbor-sources-section {
          margin-top: 16px;
          padding-top: 12px;
          border-top: 1px solid #e5e7eb;
        }

        .harbor-sources-title {
          font-size: 0.8rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 8px;
        }

        .harbor-source-item {
          margin-bottom: 12px;
          padding: 10px 12px;
          background: #f8fafc;
          border-radius: 6px;
          border-left: 3px solid #8b5cf6;
        }

        .harbor-source-link {
          color: #8b5cf6;
          text-decoration: none;
          font-size: 0.8rem;
          font-weight: 600;
          display: block;
          margin-bottom: 6px;
        }

        .harbor-source-link:hover {
          text-decoration: underline;
        }

        .harbor-source-snippet {
          font-size: 0.75rem;
          color: #6b7280;
          line-height: 1.4;
        }

        .harbor-source-score {
          font-size: 0.7rem;
          color: #9ca3af;
          float: right;
          margin-top: -20px;
        }

        .harbor-followup-section {
          border-top: 1px solid #e5e7eb;
          padding: 20px;
          background: #f9fafb;
        }

        .harbor-followup-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          margin-top: 16px;
        }

        .harbor-followup-input {
          width: 100%;
          padding: 12px 16px;
          padding-right: 50px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 0.9rem;
          outline: none;
          background: white;
          font-family: Georgia, 'Times New Roman', serif;
        }

        .harbor-followup-input:focus {
          border-color: #000;
          box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
        }

        .harbor-followup-input::placeholder {
          color: #9ca3af;
        }

        .harbor-followup-submit {
          position: absolute;
          right: 8px;
          width: 32px;
          height: 32px;
          background: #000;
          border: none;
          border-radius: 50%;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 900;
          line-height: 1;
          padding: 0;
        }

        .harbor-followup-submit:hover {
          background: #333;
        }

        .harbor-suggestion-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          margin-bottom: 8px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          cursor: pointer;
          transition: background-color 0.2s;
          text-decoration: none;
          color: #374151;
        }

        .harbor-suggestion-item:hover {
          background: #f3f4f6;
        }

        .harbor-suggestion-item:last-child {
          margin-bottom: 0;
        }

        .harbor-suggestion-text {
          font-size: 0.85rem;
          line-height: 1.4;
          flex: 1;
          font-weight: 500;
        }

        .harbor-suggestion-arrow {
          color: #9ca3af;
          font-size: 16px;
          margin-left: auto;
        }

        @media (max-width: 1024px) {
          #harbor-side-panel {
            width: 50vw;
            min-width: 350px;
          }
        }

        @media (max-width: 768px) {
          #harbor-side-panel {
            width: 100vw;
            min-width: 100vw;
          }
        }
      </style>
      <div id="harbor-side-panel">
        <div class="harbor-panel-header">
          <h3 class="harbor-panel-title">Ask The Harbor</h3>
          <button class="harbor-panel-close" id="harbor-panel-close">×</button>
        </div>
        <div class="harbor-panel-content" id="harbor-panel-content">
          <!-- Question and answer will appear here -->
        </div>
        <div class="harbor-followup-section" id="harbor-followup-section">
          <div id="harbor-suggestions">
            <!-- Suggestions will be populated here -->
          </div>
          <div class="harbor-followup-input-wrapper">
            <input 
              class="harbor-followup-input"
              placeholder="Ask anything..."
              id="harbor-followup-input"
            />
            <button class="harbor-followup-submit" id="harbor-followup-submit">🡩</button>
          </div>
        </div>
      </div>
    `;

    // Create overlay element
    const overlay = document.createElement('div');
    overlay.id = 'harbor-side-panel-overlay';
    overlay.innerHTML = panelHTML;

    // Add to document body
    document.body.appendChild(overlay);

    // Add event listeners
    const panelClose = document.getElementById('harbor-panel-close');
    panelClose.addEventListener('click', () => this.closeSidePanel());
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        this.closeSidePanel();
      }
    });

    // Add followup input event listeners
    const followupInput = document.getElementById('harbor-followup-input');
    const followupSubmit = document.getElementById('harbor-followup-submit');
    
    followupInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.handleFollowupQuestion();
      }
    });
    
    followupSubmit.addEventListener('click', () => this.handleFollowupQuestion());

    return overlay;
  }

  openSidePanel(question, answer) {
    const overlay = this.createSidePanel();
    const panel = document.getElementById('harbor-side-panel');
    
    // Initialize conversation history with the first Q&A
    this.conversationHistory = [{ question, answer, sources: [] }];
    this.updateConversationDisplay();
    
    // Populate suggestions with the first 2 related questions
    this.updateFollowupSuggestions();
    
    // Force reflow to ensure element is rendered
    overlay.offsetHeight;
    
    overlay.classList.add('show');
    panel.classList.add('show');
  }

  updateConversationDisplay() {
    const content = document.getElementById('harbor-panel-content');
    if (!content) return;
    
    content.innerHTML = this.conversationHistory.map((item, index) => `
      <div class="conversation-item">
        <div class="harbor-question-display">
          <div class="harbor-question-label">Your Question</div>
          <div class="harbor-question-text-display">${item.question}</div>
        </div>
        <div class="harbor-answer-content">
          ${item.answer}
          ${item.sources && item.sources.length > 0 ? `
            <div class="harbor-sources-section">
              <div class="harbor-sources-title">Sources:</div>
              ${item.sources.map(source => `
                <div class="harbor-source-item">
                  <a href="${source.url}" target="_blank" class="harbor-source-link">
                    ${this.extractDomainFromUrl(source.url)}
                  </a>
                  <div class="harbor-source-snippet">${source.text_snippet}</div>
                  ${source.score ? `<div class="harbor-source-score">Score: ${source.score.toFixed(2)}</div>` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    `).join('');
  }

  extractDomainFromUrl(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname || urlObj.hostname;
    } catch {
      return url;
    }
  }

  closeSidePanel() {
    const overlay = document.getElementById('harbor-side-panel-overlay');
    const panel = document.getElementById('harbor-side-panel');
    
    if (overlay && panel) {
      overlay.classList.remove('show');
      panel.classList.remove('show');
      
      // Remove panel after animation completes
      setTimeout(() => {
        if (overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
      }, 300);
    }
  }

  updateFollowupSuggestions() {
    const suggestionsContainer = document.getElementById('harbor-suggestions');
    if (!suggestionsContainer) return;
    
    // Use the first 2 related questions as suggestions
    const suggestions = this.relatedQuestions.slice(0, 2);
    
    suggestionsContainer.innerHTML = suggestions.map(question => `
      <div class="harbor-suggestion-item" data-question="${question}">
        <span class="harbor-suggestion-text">${question}</span>
        <span class="harbor-suggestion-arrow">→</span>
      </div>
    `).join('');
    
    // Add click handlers to suggestions
    suggestionsContainer.querySelectorAll('.harbor-suggestion-item').forEach(item => {
      item.addEventListener('click', () => {
        const question = item.getAttribute('data-question');
        this.askFollowupQuestion(question);
      });
    });
  }

  async handleFollowupQuestion() {
    const followupInput = document.getElementById('harbor-followup-input');
    const question = followupInput.value.trim();
    
    if (!question) return;
    
    // Clear input
    followupInput.value = '';
    
    this.askFollowupQuestion(question);
  }

  async askFollowupQuestion(question) {
    // Add loading state to conversation
    this.conversationHistory.push({ question, answer: 'Loading...', sources: [] });
    this.updateConversationDisplay();
    
    try {
      const requestBody = {
        question: question
      };
      
      const response = await fetch(`${this.backendUrl}/api/chat`, {
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
          // Update the last item in conversation history with the response
          this.conversationHistory[this.conversationHistory.length - 1].answer = responseData.response;
          this.conversationHistory[this.conversationHistory.length - 1].sources = responseData.sources || [];
        } else {
          this.conversationHistory[this.conversationHistory.length - 1].answer = responseData.message || 'Failed to get response from RAG system.';
          this.conversationHistory[this.conversationHistory.length - 1].sources = [];
        }
      } else {
        this.conversationHistory[this.conversationHistory.length - 1].answer = 'Sorry, I couldn\'t process your question right now. Please try again.';
        this.conversationHistory[this.conversationHistory.length - 1].sources = [];
      }
      
      this.updateConversationDisplay();
      
    } catch (error) {
      console.error('Error asking followup question:', error);
      this.conversationHistory[this.conversationHistory.length - 1].answer = 'There was an error processing your question. Please try again.';
      this.conversationHistory[this.conversationHistory.length - 1].sources = [];
      this.updateConversationDisplay();
    }
  }

  getArticleContext() {
    // Extract article content for context (kept for potential future use)
    const articleContent = document.querySelector('.article-content');
    const articleTitle = document.querySelector('.article-title');
    const articleByline = document.querySelector('.article-byline');
    
    return {
      title: articleTitle?.textContent || '',
      author: articleByline?.textContent || '',
      content: articleContent?.textContent?.substring(0, 2000) || '',
      url: window.location.href
    };
  }
}

// Define the custom element
customElements.define('article-widget', ArticleWidget);

// Initialize the widget when the page loads
function initializeWidget() {
  console.log('Initializing widget...');
  const widgetPanel = document.querySelector('.widget-panel');
  console.log('Widget panel found:', widgetPanel);
  
  if (widgetPanel) {
    // Clear any existing content
    widgetPanel.innerHTML = '';
    
    // Create and append the widget
    const widget = document.createElement('article-widget');
    widgetPanel.appendChild(widget);
    console.log('Widget created and appended');
  } else {
    console.error('Widget panel not found');
  }
}

// Try multiple initialization strategies
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeWidget);
} else {
  // DOM is already loaded
  initializeWidget();
}

// Fallback initialization after a short delay
setTimeout(() => {
  if (!document.querySelector('article-widget')) {
    console.log('Widget not found, trying fallback initialization...');
    initializeWidget();
  }
}, 1000); 