class ArticleWidget extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.isLoadingQuestions = false;
    this.response = '';
    this.question = '';
    this.relatedQuestions = [];
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
            <button class="ask-submit-btn" id="ask-submit-btn">↗</button>
          </div>
        </div>

        <div class="powered-by">
          Powered by <span class="gist-brand">Gist</span>
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
      const context = this.getArticleContext();
      
      const requestBody = {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `Generate exactly 2 related questions about this article. The questions should be insightful and encourage deeper thinking about the topic. Return only the questions, one per line, without numbers or bullets.

Article Title: ${context.title}
Article Content: ${context.content}`
          },
          {
            role: "user",
            content: "Generate 2 related questions about this article."
          }
        ],
        max_tokens: 200
      };
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      if (response.ok) {
        const data = await response.json();
        const questionsText = data.response || data.message || data.choices?.[0]?.message?.content || '';
        const generatedQuestions = questionsText
          .split('\n')
          .filter(q => q.trim())
          .slice(0, 2)
          .map(q => q.replace(/^\d+\.?\s*/, '').trim());
        
        // Always include the summary question as the third question
        this.relatedQuestions = [
          ...generatedQuestions,
          'Can you summarize this article?'
        ];
      } else {
        this.relatedQuestions = [
          'Who is Maria Benitez?',
          'What are the main factors affecting retail sales?',
          'Can you summarize this article?'
        ];
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      this.relatedQuestions = [
        'Who is Maria Benitez?',
        'What are the main factors affecting retail sales?',
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
          <span class="arrow-icon">↗</span>
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
      const context = this.getArticleContext();
      
      // Format the request in OpenAI-compatible format
      const requestBody = {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a helpful AI assistant. You have access to the content of the current webpage the user is viewing. Use this context to provide relevant and accurate answers about the content, but you can also answer general questions beyond the page content.

Page Title: ${context.title}

Page Content:
${context.content}

Instructions:
- When users ask questions related to the page content, reference it directly
- For questions about specific details in the article, cite the relevant information
- You can also answer general questions that go beyond the page content
- Keep responses concise but informative
- If asked about sources or citations, explain that you're drawing from the current webpage content`
          },
          {
            role: "user",
            content: this.question
          }
        ],
        max_tokens: 500
      };
      
      // Call the chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      let responseText;
      if (response.ok) {
        const data = await response.json();
        responseText = data.response || data.message || data.choices?.[0]?.message?.content || 'I received your question but couldn\'t generate a response.';
      } else {
        responseText = 'Sorry, I couldn\'t process your question right now. Please try again.';
      }
      
      // Update side panel with response
      this.updateSidePanelContent(this.question, responseText);
      
    } catch (error) {
      console.error('Error asking question:', error);
      this.updateSidePanelContent(this.question, 'There was an error processing your question. Please try again.');
    }
  }

  createSidePanel() {
    // Remove existing panel if it exists
    const existingPanel = document.getElementById('harbor-side-panel-overlay');
    if (existingPanel) {
      existingPanel.remove();
    }

    // Create panel HTML
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
        }

        .harbor-question-display {
          background: #f0f0f0;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 20px;
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

    return overlay;
  }

  openSidePanel(question, answer) {
    const overlay = this.createSidePanel();
    const panel = document.getElementById('harbor-side-panel');
    const content = document.getElementById('harbor-panel-content');
    
    content.innerHTML = `
      <div class="harbor-question-display">
        <div class="harbor-question-label">Your Question</div>
        <div class="harbor-question-text-display">${question}</div>
      </div>
      <div class="harbor-answer-content">${answer}</div>
    `;
    
    // Force reflow to ensure element is rendered
    overlay.offsetHeight;
    
    overlay.classList.add('show');
    panel.classList.add('show');
  }

  updateSidePanelContent(question, answer) {
    const content = document.getElementById('harbor-panel-content');
    if (content) {
      content.innerHTML = `
        <div class="harbor-question-display">
          <div class="harbor-question-label">Your Question</div>
          <div class="harbor-question-text-display">${question}</div>
        </div>
        <div class="harbor-answer-content">${answer}</div>
      `;
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

  getArticleContext() {
    // Extract article content for context
    const articleContent = document.querySelector('.article-content');
    const articleTitle = document.querySelector('.article-title');
    const articleByline = document.querySelector('.article-byline');
    
    return {
      title: articleTitle?.textContent || '',
      author: articleByline?.textContent || '',
      content: articleContent?.textContent?.substring(0, 2000) || '', // Limit context size
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