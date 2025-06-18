import { LitElement, html, css } from 'https://cdn.jsdelivr.net/npm/lit@3.1.0/index.js';

class ArticleWidget extends LitElement {
  static styles = css`
    :host {
      display: block;
      width: 100%;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .widget-container {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    /* Related Questions Section */
    .related-questions {
      background: white;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
      overflow: hidden;
    }

    .section-header {
      background: #f9fafb;
      padding: 16px 20px;
      border-bottom: 1px solid #e5e7eb;
      font-size: 16px;
      font-weight: 600;
      color: #1f2937;
    }

    .questions-list {
      padding: 0;
    }

    .question-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 20px;
      border-bottom: 1px solid #f3f4f6;
      cursor: pointer;
      transition: background-color 0.2s;
      text-decoration: none;
      color: #374151;
    }

    .question-item:hover {
      background: #f9fafb;
    }

    .question-item:last-child {
      border-bottom: none;
    }

    .question-text {
      font-size: 14px;
      line-height: 1.4;
    }

    .arrow-icon {
      color: #9ca3af;
      font-size: 18px;
      margin-left: auto;
    }

    /* Ask Input Section */
    .ask-section {
      background: white;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
      overflow: hidden;
    }

    .ask-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 16px 20px;
      background: #8b5cf6;
      color: white;
    }

    .ask-icon {
      width: 20px;
      height: 20px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
    }

    .ask-title {
      font-size: 14px;
      font-weight: 500;
      margin: 0;
    }

    .ask-input-container {
      padding: 16px 20px;
    }

    .ask-input {
      width: 100%;
      padding: 12px 16px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s;
      box-sizing: border-box;
      resize: none;
      font-family: inherit;
      background: #f9fafb;
    }

    .ask-input:focus {
      border-color: #8b5cf6;
      box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
      background: white;
    }

    .ask-input::placeholder {
      color: #9ca3af;
    }

    .ask-buttons {
      display: flex;
      gap: 8px;
      margin-top: 12px;
    }

    .ask-button {
      flex: 1;
      padding: 8px 16px;
      background: #8b5cf6;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .ask-button:hover {
      background: #7c3aed;
    }

    .ask-button:disabled {
      background: #d1d5db;
      cursor: not-allowed;
    }

    .summary-button {
      flex: 1;
      padding: 8px 16px;
      background: #f3f4f6;
      color: #374151;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .summary-button:hover {
      background: #e5e7eb;
    }

    .tabs {
      display: flex;
      gap: 2px;
      margin-top: 12px;
    }

    .tab {
      flex: 1;
      padding: 6px 12px;
      background: #f3f4f6;
      border: none;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 500;
      color: #6b7280;
      cursor: pointer;
      transition: all 0.2s;
    }

    .tab.active {
      background: #8b5cf6;
      color: white;
    }

    .tab:hover:not(.active) {
      background: #e5e7eb;
    }

    /* Response Area */
    .response-area {
      margin-top: 16px;
      padding: 16px;
      background: #f9fafb;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
      font-size: 14px;
      line-height: 1.5;
      color: #374151;
      display: none;
    }

    .response-area.show {
      display: block;
    }

    /* Ad Section */
    .ad-section {
      background: white;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
      overflow: hidden;
    }

    .ad-content {
      padding: 20px;
      text-align: center;
    }

    .ad-title {
      font-size: 14px;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 8px;
    }

    .ad-description {
      font-size: 12px;
      color: #6b7280;
      line-height: 1.4;
      margin-bottom: 12px;
    }

    .ad-button {
      background: #059669;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .ad-button:hover {
      background: #047857;
    }

    /* Powered By */
    .powered-by {
      text-align: center;
      font-size: 12px;
      color: #9ca3af;
      margin-top: 16px;
    }

    .powered-by a {
      color: #8b5cf6;
      text-decoration: none;
      font-weight: 500;
    }

    .powered-by a:hover {
      text-decoration: underline;
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
  `;

  static properties = {
    activeTab: { type: String },
    isLoading: { type: Boolean },
    isLoadingQuestions: { type: Boolean },
    isGeneratingSummary: { type: Boolean },
    response: { type: String },
    question: { type: String },
    relatedQuestions: { type: Array }
  };

  constructor() {
    super();
    this.activeTab = 'Ask';
    this.isLoading = false;
    this.isLoadingQuestions = false;
    this.isGeneratingSummary = false;
    this.response = '';
    this.question = '';
    this.relatedQuestions = [];
    this._generateRelatedQuestions();
  }

  render() {
    return html`
      <div class="widget-container">
        <!-- Related Questions Section -->
        <div class="related-questions">
          <div class="section-header">Related questions</div>
          <div class="questions-list">
            ${this.isLoadingQuestions ? html`
              <div class="questions-loading">
                <div class="loading">
                  <div class="spinner"></div>
                  Generating questions...
                </div>
              </div>
            ` : this.relatedQuestions.map(question => html`
              <div class="question-item" @click=${() => this._askQuestion(question)}>
                <span class="question-text">${question}</span>
                <span class="arrow-icon">→</span>
              </div>
            `)}
          </div>
        </div>

        <!-- Ask Input Section -->
        <div class="ask-section">
          <div class="ask-header">
            <span class="ask-icon">?</span>
            <span class="ask-title">Ask The Harbor</span>
          </div>
          <div class="ask-input-container">
            <textarea 
              class="ask-input"
              placeholder="Ask about this article..."
              .value=${this.question}
              @input=${this._handleInput}
              rows="3"
            ></textarea>
            
            <div class="ask-buttons">
              <button 
                class="ask-button"
                @click=${this._handleAsk}
                ?disabled=${this.isLoading}
              >
                ${this.isLoading ? html`
                  <div class="loading">
                    <div class="spinner"></div>
                    Asking...
                  </div>
                ` : 'Ask Question'}
              </button>
              
              <button 
                class="summary-button"
                @click=${this._generateSummary}
                ?disabled=${this.isGeneratingSummary}
              >
                ${this.isGeneratingSummary ? html`
                  <div class="loading">
                    <div class="spinner"></div>
                    Summarizing...
                  </div>
                ` : 'Summary'}
              </button>
            </div>
            
            <div class="tabs">
              ${['Ask', 'Gist', 'Remix', 'Share'].map(tab => html`
                <button 
                  class="tab ${tab === this.activeTab ? 'active' : ''}"
                  @click=${() => this._setActiveTab(tab)}
                >
                  ${tab}
                </button>
              `)}
            </div>
            
            ${this.response ? html`
              <div class="response-area show">
                ${this.response}
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Ad Section -->
        <div class="ad-section">
          <div class="ad-content">
            <div class="ad-title">Dive into Brian Wilson's latest book.</div>
            <div class="ad-description">A heartfelt journey through music, memories, and the mind of a true genius.</div>
            <button class="ad-button">Learn more</button>
          </div>
        </div>

        <div class="powered-by">
          Powered by <a href="#" target="_blank">Gist AI</a>
        </div>
      </div>
    `;
  }

  _handleInput(e) {
    this.question = e.target.value;
  }

  _setActiveTab(tab) {
    this.activeTab = tab;
    this.response = '';
    
    // Update placeholder and default question based on tab
    switch(tab) {
      case 'Ask':
        this.question = '';
        break;
      case 'Gist':
        this.question = 'Can you provide a summary of this article?';
        break;
      case 'Remix':
        this.question = 'Rewrite this article in a different style';
        break;
      case 'Share':
        this.question = 'Share this article with insights';
        break;
    }
  }

  _askQuestion(question) {
    this.question = question;
    this._handleAsk();
  }

  async _generateRelatedQuestions() {
    this.isLoadingQuestions = true;
    
    try {
      const context = this._getArticleContext();
      
      const requestBody = {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `Generate exactly 3 related questions about this article. The questions should be insightful and encourage deeper thinking about the topic. Return only the questions, one per line, without numbers or bullets.

Article Title: ${context.title}
Article Content: ${context.content}`
          },
          {
            role: "user",
            content: "Generate 3 related questions about this article."
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
        this.relatedQuestions = questionsText
          .split('\n')
          .filter(q => q.trim())
          .slice(0, 3)
          .map(q => q.replace(/^\d+\.?\s*/, '').trim());
      } else {
        this.relatedQuestions = [
          'Who is Maria Benitez?',
          'What are the main factors affecting retail sales?',
          'How do tariffs impact consumer spending?'
        ];
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      this.relatedQuestions = [
        'Who is Maria Benitez?',
        'What are the main factors affecting retail sales?',
        'How do tariffs impact consumer spending?'
      ];
    } finally {
      this.isLoadingQuestions = false;
    }
  }

  async _generateSummary() {
    this.isGeneratingSummary = true;
    this.response = '';
    
    try {
      const context = this._getArticleContext();
      
      const requestBody = {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a helpful AI assistant that creates concise summaries of articles. Provide a clear, informative summary in 2-3 sentences.

Article Title: ${context.title}
Article Content: ${context.content}`
          },
          {
            role: "user",
            content: "Please provide a concise summary of this article."
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
        this.response = data.response || data.message || data.choices?.[0]?.message?.content || 'Unable to generate summary.';
      } else {
        this.response = 'Sorry, I couldn\'t generate a summary right now. Please try again.';
      }
    } catch (error) {
      console.error('Error generating summary:', error);
      this.response = 'There was an error generating the summary. Please try again.';
    } finally {
      this.isGeneratingSummary = false;
    }
  }

  async _handleAsk() {
    if (!this.question.trim()) return;
    
    this.isLoading = true;
    this.response = '';
    
    try {
      const context = this._getArticleContext();
      
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
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      if (response.ok) {
        const data = await response.json();
        this.response = data.response || data.message || data.choices?.[0]?.message?.content || 'I received your question but couldn\'t generate a response.';
      } else {
        this.response = 'Sorry, I couldn\'t process your question right now. Please try again.';
      }
    } catch (error) {
      console.error('Error asking question:', error);
      this.response = 'There was an error processing your question. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }

  _getArticleContext() {
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