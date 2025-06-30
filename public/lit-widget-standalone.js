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
          color: #4a5568;
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
          border-top: 2px solid #4a5568;
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
          border-left: 3px solid #4a5568;
        }

        .source-link {
          color: #4a5568;
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

        .harbor-sources-section {
          margin-top: 16px;
          padding-top: 12px;
          border-top: 1px solid #e5e7eb;
          height: 60px;
          display: flex;
          flex-direction: column;
          margin-bottom: 40px;
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
            <button class="ask-submit-btn" id="ask-submit-btn">
              <img src="arrow.svg" alt="Send" width="14" height="14" style="filter: brightness(0) invert(1);">
            </button>
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

  createPanel(mode = 'side') {
    // Remove existing panel if it exists
    const existingPanels = [
      document.getElementById('harbor-side-panel-overlay'),
      document.getElementById('harbor-fullscreen-panel-overlay')
    ];
    existingPanels.forEach(panel => {
      if (panel) {
        panel.remove();
      }
    });

    // Panel CSS tweaks for fullscreen mode
    const isFullscreen = mode === 'fullscreen';
    const panelId = isFullscreen ? 'harbor-fullscreen-panel' : 'harbor-side-panel';
    const overlayId = isFullscreen ? 'harbor-fullscreen-panel-overlay' : 'harbor-side-panel-overlay';
    const panelStyles = `
      <style>
        #${overlayId} {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.3);
          z-index: 99998;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.3s ease, visibility 0.3s ease;
        }
        #${overlayId}.show {
          opacity: 1;
          visibility: visible;
        }
        #${panelId} {
          position: fixed;
          top: 0;
          right: 0;
          width: ${isFullscreen ? '100vw' : '40vw'};
          min-width: ${isFullscreen ? '100vw' : '400px'};
          height: 100vh;
          background: white;
          z-index: 99999;
          transform: translateX(${isFullscreen ? '0' : '100%'});
          transition: transform 0.3s ease;
          box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
          display: flex;
          flex-direction: column;
          font-family: Georgia, 'Times New Roman', serif;
        }
        #${panelId}.show {
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
          background: #f8f9fa;
          border: 1px solid #e9ecef;
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
        .harbor-sources-section {
          margin-top: 16px;
          padding-top: 12px;
          border-top: 1px solid #e5e7eb;
          height: 60px;
          display: flex;
          flex-direction: column;
          margin-bottom: 40px;
        }
        .harbor-sources-title {
          font-size: 0.8rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 8px;
          flex-shrink: 0;
        }
        .harbor-sources-container {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          align-items: flex-start;
          flex: 1;
        }
        .harbor-source-item {
          flex: 1;
          min-width: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .harbor-source-link {
          color: #374151;
          text-decoration: none;
          font-size: 0.75rem;
          font-weight: 500;
          padding: 6px 12px;
          border: 1px solid #e5e7eb;
          border-radius: 20px;
          background: #ffffff;
          display: block;
          text-align: center;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          width: 100%;
          transition: all 0.2s ease;
        }
        .harbor-source-link:hover {
          background: #f9fafb;
          border-color: #d1d5db;
          text-decoration: none;
        }
        .harbor-loading-container {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #6b7280;
          font-size: 0.9rem;
          margin: 16px 0;
        }
        .harbor-loading-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid #e5e7eb;
          border-top: 2px solid #4a5568;
          border-radius: 50%;
          animation: harbor-spin 1s linear infinite;
        }
        .harbor-loading-text {
          font-weight: 500;
        }
        @keyframes harbor-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .harbor-followup-section {
          border-top: 1px solid #e5e7eb;
          padding: 12px 16px;
          background: #f9fafb;
        }
        .harbor-followup-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          margin-top: 8px;
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
          gap: 8px;
          padding: 8px 0;
          border-bottom: 1px solid #e5e7eb;
          cursor: pointer;
          transition: background-color 0.2s;
          text-decoration: none;
          color: #374151;
        }
        .harbor-suggestion-item:hover {
          background: #f8f9fa;
        }
        .harbor-suggestion-item:last-child {
          border-bottom: none;
        }
        .harbor-suggestion-text {
          font-size: 0.8rem;
          line-height: 1.3;
          flex: 1;
          font-weight: 500;
        }
        .harbor-suggestion-arrow {
          color: #9ca3af;
          font-size: 16px;
          margin-left: auto;
        }
        @media (max-width: 1024px) {
          #${panelId} {
            width: ${isFullscreen ? '100vw' : '50vw'};
            min-width: ${isFullscreen ? '100vw' : '350px'};
          }
        }
        @media (max-width: 768px) {
          #${panelId} {
            width: 100vw;
            min-width: 100vw;
          }
        }
      </style>
    `;
    const panelHTML = `
      ${panelStyles}
      <div id="${panelId}">
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
            <button class="harbor-followup-submit" id="harbor-followup-submit">
              <img src="arrow.svg" alt="Send" width="14" height="14" style="filter: brightness(0) invert(1);">
            </button>
          </div>
        </div>
      </div>
    `;

    // Create overlay element
    const overlay = document.createElement('div');
    overlay.id = overlayId;
    overlay.innerHTML = panelHTML;

    // Add to document body
    document.body.appendChild(overlay);

    // Add event listeners
    const panelClose = document.getElementById('harbor-panel-close');
    panelClose.addEventListener('click', () => this.closePanel(mode));
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        this.closePanel(mode);
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

  async openPanel(mode, question, answer) {
    const overlay = this.createPanel(mode);
    const panel = document.getElementById(mode === 'fullscreen' ? 'harbor-fullscreen-panel' : 'harbor-side-panel');
    // Initialize conversation history with the first Q&A
    this.conversationHistory = [{ question, answer, sources: [] }];
    overlay.offsetHeight;
    overlay.classList.add('show');
    panel.classList.add('show');
    // Now update content and suggestions
    await this.updateConversationDisplay();
    await this.updateFollowupSuggestions();
    this.scrollToLatestQuestion();
  }

  async handleAsk() {
    if (!this.question.trim()) return;
    if (window.innerWidth <= 1200) {
      // Mobile: open fullscreen overlay
      await this.openPanel('fullscreen', this.question, this.getLoadingHTML());
    } else {
      // Desktop: open side panel
      await this.openPanel('side', this.question, this.getLoadingHTML());
    }
    this.scrollToLatestQuestion();
    try {
      const requestBody = {
        question: this.formatQuestionWithPageTitle(this.question)
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
      await this.updateConversationDisplay();
      await this.updateFollowupSuggestions();
      this.scrollToLatestQuestion();
    } catch (error) {
      console.error('Error asking question:', error);
      this.conversationHistory[0].answer = 'There was an error processing your question. Please try again.';
      this.conversationHistory[0].sources = [];
      await this.updateConversationDisplay();
      this.scrollToLatestQuestion();
    }
  }

  async updateConversationDisplay() {
    const content = document.getElementById('harbor-panel-content');
    if (!content) return;
    
    // Extract titles for all sources asynchronously
    const conversationWithTitles = await Promise.all(
      this.conversationHistory.map(async (item) => {
        if (item.sources && item.sources.length > 0) {
          const sourcesWithTitles = await Promise.all(
            item.sources.map(async (source) => ({
              ...source,
              title: await this.extractPageTitle(source.url)
            }))
          );
          return { ...item, sources: sourcesWithTitles };
        }
        return item;
      })
    );
    
    content.innerHTML = conversationWithTitles.map((item, index) => `
      <div class="conversation-item" id="conversation-item-${index}">
        <div class="harbor-question-display">
          <div class="harbor-question-text-display">${item.question}</div>
        </div>
        <div class="harbor-answer-content">
          ${item.answer}
          ${item.sources && item.sources.length > 0 ? `
            <div class="harbor-sources-section">
              <div class="harbor-sources-title">Sources:</div>
              <div class="harbor-sources-container">
                ${item.sources.map(source => `
                  <div class="harbor-source-item">
                    <a href="${source.url}" target="_blank" class="harbor-source-link">
                      ${source.title || source.url}
                    </a>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `).join('');

    // Remove any existing spacer
    const oldSpacer = document.getElementById('harbor-bottom-spacer');
    if (oldSpacer && oldSpacer.parentNode) {
      oldSpacer.parentNode.removeChild(oldSpacer);
    }

    // Add a spacer below the latest answer if needed to keep the latest question at the top
    const items = content.querySelectorAll('.conversation-item');
    if (items.length > 0) {
      const latestItem = items[items.length - 1];
      const panel = document.getElementById('harbor-panel-content');
      if (latestItem && panel) {
        // Calculate the total height of the latest question+answer
        const latestRect = latestItem.getBoundingClientRect();
        const panelRect = panel.getBoundingClientRect();
        const totalHeight = latestItem.offsetHeight;
        const panelHeight = panel.clientHeight;
        if (totalHeight < panelHeight) {
          const spacer = document.createElement('div');
          spacer.id = 'harbor-bottom-spacer';
          spacer.style.height = (panelHeight - totalHeight) + 'px';
          spacer.style.width = '100%';
          spacer.style.background = '#fff';
          spacer.style.pointerEvents = 'none';
          latestItem.insertAdjacentElement('afterend', spacer);
        }
      }
    }
  }

  scrollToLatestQuestion() {
    const content = document.getElementById('harbor-panel-content');
    if (!content) return;
    const items = content.querySelectorAll('.conversation-item');
    if (items.length > 1) {
      const latestItem = items[items.length - 1];
      latestItem.scrollIntoView({ behavior: 'auto', block: 'start' });
    }
  }

  getCurrentPageTitle() {
    // Get the current page title
    return document.title || document.querySelector('h1')?.textContent || 'Unknown Page';
  }

  formatQuestionWithPageTitle(question) {
    // Format question with page title appended
    const pageTitle = this.getCurrentPageTitle();
    return `${question}\n${pageTitle}`;
  }

  getLoadingHTML() {
    // Return HTML for loading state with spinner
    return `
      <div class="harbor-loading-container">
        <div class="harbor-loading-spinner"></div>
        <span class="harbor-loading-text">Getting answer...</span>
      </div>
    `;
  }

  async extractPageTitle(url) {
    try {
      // If it's a relative URL, make it absolute
      const fullUrl = url.startsWith('/') ? window.location.origin + url : url;
      
      const response = await fetch(fullUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch page');
      }
      
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const title = doc.querySelector('title')?.textContent || 
                   doc.querySelector('h1')?.textContent || 
                   url;
      
      // Truncate title if too long
      return title.length > 60 ? title.substring(0, 60) + '...' : title;
    } catch (error) {
      console.error('Error extracting page title:', error);
      // Fallback to URL path or domain
      try {
        const urlObj = new URL(url.startsWith('/') ? window.location.origin + url : url);
        return urlObj.pathname || urlObj.hostname;
      } catch {
        return url;
      }
    }
  }

  closePanel(mode) {
    const overlayId = mode === 'fullscreen' ? 'harbor-fullscreen-panel-overlay' : 'harbor-side-panel-overlay';
    const panelId = mode === 'fullscreen' ? 'harbor-fullscreen-panel' : 'harbor-side-panel';
    const overlay = document.getElementById(overlayId);
    const panel = document.getElementById(panelId);
    if (overlay && panel) {
      overlay.classList.remove('show');
      panel.classList.remove('show');
      setTimeout(() => {
        if (overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
      }, 300);
    }
  }

  async updateFollowupSuggestions() {
    const suggestionsContainer = document.getElementById('harbor-suggestions');
    if (!suggestionsContainer) return;
    // Fetch new followup questions from backend
    let questions = [];
    try {
      const response = await fetch(`${this.backendUrl}/api/generate-questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
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
    } catch (error) {
      console.error('Error generating followup questions:', error);
      questions = [
        'What are the main economic factors discussed?',
        'How do current trends affect the future?',
        'Can you summarize this article?'
      ];
    }
    // Use the first 2 questions as suggestions
    const suggestions = questions.slice(0, 2);
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
    this.conversationHistory.push({ question, answer: this.getLoadingHTML(), sources: [] });
    await this.updateConversationDisplay();
    this.scrollToLatestQuestion();
    try {
      const requestBody = {
        question: this.formatQuestionWithPageTitle(question)
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
      await this.updateConversationDisplay();
      await this.updateFollowupSuggestions();
      this.scrollToLatestQuestion();
    } catch (error) {
      console.error('Error asking followup question:', error);
      this.conversationHistory[this.conversationHistory.length - 1].answer = 'There was an error processing your question. Please try again.';
      this.conversationHistory[this.conversationHistory.length - 1].sources = [];
      await this.updateConversationDisplay();
      this.scrollToLatestQuestion();
    }
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