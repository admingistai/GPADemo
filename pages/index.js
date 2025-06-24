import { useState, useEffect } from 'react';
import Head from 'next/head';
import Script from 'next/script';
import Headline from '../components/Headline';
import YouTubeEmbed from '../components/YouTubeEmbed';

export default function Home() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('analytics');

  const handleGetStarted = () => {
    // Redirect to Ask Anything™ website
    window.location.href = 'https://www.getaskanything.com';
  };

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
  };

  return (
    <>
      <Head>
        <title>Ask Anything™ - AI-Powered Reader Engagement Platform</title>
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      </Head>
      
      <Script 
        src="/widget.js" 
        strategy="afterInteractive"
        onLoad={() => {
          console.log('Ask Anything widget loaded');
        }}
      />
      
      <div className="app">
        {/* Header */}
        <header className="header">
          <a href="https://gist.ai" className="logo-section">
            <img src="/Gist G white no background.png" alt="Gist" className="logo" />
            <span className="brand-name">Ask Anything™</span>
          </a>
          <div className="header-actions">
            <a href="https://gist.ai/login" className="login-btn">Log in</a>
            <a href="/dashboard" className="demo-btn">Demo Dashboard</a>
          </div>
        </header>

        {/* Hero Section */}
        <section className="hero section-highlight">
          <Headline className="hero-title" />
          <p className="hero-subtitle">
            Add the Ask Anything™ widget to your site and let visitors get instant AI answers without leaving your&nbsp;page.
          </p>
          
          {/* YouTube Demo Video */}
          <YouTubeEmbed 
            videoId="0vLp7Ri_33M" 
            title="Ask Anything™ Product Demo"
            className="hero-video"
          />
          
          <button className="hero-cta-button" onClick={handleGetStarted}>
            Get an Ask Anything™ Button
          </button>
        </section>

        {/* Trust Section - Moved up for better social proof */}
        <section className="trust-section section-highlight">
          <h2 className="teams-heading">The teams we empower</h2>
          <p className="teams-subtitle">Trusted by leading publishers and media companies worldwide</p>
          <div className="publishers-logos">
            <img src="/publishers-logos.png" alt="Publishers we empower including major news outlets and content creators" />
          </div>
        </section>

        {/* Why Choose Ask Anything Section */}
        <section className="why-choose-section section-highlight">
          <h2 className="section-title">Why choose Ask Anything™</h2>
          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon">🎯</div>
              <h3>Increase engagement 2.3x</h3>
              <p>Keep visitors on your site longer with interactive AI responses that answer their questions instantly, reducing bounce rates and increasing time on&nbsp;page.</p>
            </div>
            
            <div className="benefit-card">
              <div className="benefit-icon">📚</div>
              <h3>Grow users faster than ever</h3>
              <p>Transform casual visitors into loyal users with personalized, helpful interactions that build trust and encourage repeat visits to your&nbsp;site.</p>
            </div>
            
            <div className="benefit-card">
              <div className="benefit-icon">💰</div>
              <h3>Zero upfront cost. Forever</h3>
              <p>Start improving your site immediately with no installation fees, setup costs, or monthly subscriptions. Only pay when you see&nbsp;results.</p>
            </div>
          </div>
        </section>

        {/* Make it yours Section */}
        <section className="make-it-yours-section">
          <div className="make-it-yours-content">
            <h2 className="make-it-yours-title">Make it yours</h2>
            <div className="make-it-yours-grid">
              <div className="customization-card">
                <h3>Choose sources to include</h3>
                <p>Pick pages on your site or add any whitelisted publisher with one&nbsp;click.</p>
              </div>
              <div className="customization-card">
                <h3>Match the design of your brand</h3>
                <p>Customize colors, fonts, avatars, even the answer&nbsp;voice.</p>
              </div>
              <div className="customization-card">
                <h3>Set its mission</h3>
                <p>Drive Search, Sales, Support or whatever matters to&nbsp;you.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Dashboard Preview */}
        <section className="dashboard-preview section-highlight">
          <div className="dashboard-container">
            <div className="dashboard-header">
              <div className="dashboard-tabs">
                <button 
                  className={`tab ${activeTab === 'analytics' ? 'active' : ''}`} 
                  onClick={() => handleTabClick('analytics')}
                >
                  📊 Analytics
                </button>
                <button 
                  className={`tab ${activeTab === 'home' ? 'active' : ''}`} 
                  onClick={() => handleTabClick('home')}
                >
                  🏠 Home
                </button>
              </div>
              <div className="dashboard-controls">
                <span className="date-range">Last 7 days</span>
                <span className="settings">⚙️ Settings</span>
              </div>
            </div>
            
            <div className="dashboard-content">
              {/* Analytics Tab Content */}
              <div className={`tab-content analytics-content ${activeTab === 'analytics' ? 'active' : ''}`}>
                <div className="metrics-row">
                  <div className="metric-card">
                    <h3>Reader Engagement</h3>
                    <div className="metric-value">89.8%</div>
                    <span className="metric-change positive">↑ 12% vs last week</span>
                  </div>
                  
                  <div className="metric-card">
                    <h3>Questions Answered</h3>
                    <div className="metric-value">24.3K</div>
                    <span className="metric-change positive">↑ 8% increase</span>
                  </div>
                  
                  <div className="metric-card">
                    <h3>Time on Site</h3>
                    <div className="metric-value">5:42</div>
                    <span className="metric-change positive">↑ 23% longer</span>
                  </div>
                </div>
                
                <div className="chart-section">
                  <h3>Topic Visibility</h3>
                  <div className="chart-placeholder">
                    <div className="chart-line"></div>
                    <div className="chart-line"></div>
                    <div className="chart-line"></div>
                  </div>
                </div>
                
                <div className="insights-section">
                  <h3>Top Questions</h3>
                  <div className="insight-item">
                    <span className="insight-rank">#1</span>
                    <span className="insight-text">How does AI affect content strategy?</span>
                    <span className="insight-metric">2.1K asks</span>
                  </div>
                  <div className="insight-item">
                    <span className="insight-rank">#2</span>
                    <span className="insight-text">What are the best practices for SEO?</span>
                    <span className="insight-metric">1.8K asks</span>
                  </div>
                  <div className="insight-item">
                    <span className="insight-rank">#3</span>
                    <span className="insight-text">How to increase reader engagement?</span>
                    <span className="insight-metric">1.5K asks</span>
                  </div>
                </div>
              </div>

              {/* Home Tab Content */}
              <div className={`tab-content home-content ${activeTab === 'home' ? 'active' : ''}`}>
                <div className="home-hero">
                  <h2>Skip the noise. Get straight to the point.</h2>
                  <p>Meet Gist: the AI-powered search engine that delivers concise, accurate answers to your questions using only trusted, well-established sources.</p>
                </div>
                
                <div className="gist-features">
                  <div className="feature-item">
                    <h4>🎯 Jump straight to the point</h4>
                    <p>Gist reads, understands, and synthesizes information from trusted sources to give you clear answers—not a pile of links—saving you time and effort.</p>
                  </div>
                  
                  <div className="feature-item">
                    <h4>📚 Credit where credit is due</h4>
                    <p>When we generate an answer, each claim is attributed and linked to its original source—so you can easily verify and continue to explore.</p>
                  </div>
                  
                  <div className="feature-item">
                    <h4>✅ Reality check</h4>
                    <p>AIs hallucinate and often can't separate fact from fiction. That's why we use our proprietary attribution technology to identify and eliminate any unsupported claims.</p>
                  </div>
                  
                  <div className="feature-item">
                    <h4>🤝 Feel good about every search</h4>
                    <p>Gist empowers and rewards creators, ensuring their work is valued and compensated fairly. Together, we're building a sustainable, equitable ecosystem.</p>
                  </div>
                </div>
                
                <div className="quality-section">
                  <h3>Quality in, quality out</h3>
                  <p>Gist uses only vetted, well-established sources to answer every search. We're partnering with 1,000s of top publications, authors, and other content creators to ensure our answers are informed by only trustworthy sources.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Section 1 */}
        <section className="feature-section section-highlight">
          <div className="feature-content">
            <span className="feature-label">Try on your website</span>
            <h2>Experience what it would be like with our Ask Anything™ button simulation</h2>
            <div className="email-input-wrapper">
              <input
                type="email"
                placeholder="yourwebsite.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="email-input"
              />
              <button className="analyze-btn" onClick={handleGetStarted}>
                Try Demo
              </button>
            </div>
          </div>
          
          <div className="feature-visual">
            <div className="analytics-card">
              <h4>Number of Reader Questions</h4>
              <div className="analytics-stats">
                <div className="stat">
                  <span className="stat-value">12.3K</span>
                  <span className="stat-label">Today</span>
                </div>
                <div className="stat">
                  <span className="stat-value">86%</span>
                  <span className="stat-label">Answered</span>
                </div>
                <div className="stat">
                  <span className="stat-value">4.8</span>
                  <span className="stat-label">Satisfaction</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Section 2 */}
        <section className="feature-section reverse section-highlight">
          <div className="feature-visual">
            <div className="card-mockup">
              <div className="card-image">
                <span className="card-logo">Ask Anything™</span>
              </div>
              <div className="card-details">
                <span>Powered by AI</span>
                <span>Enterprise Ready</span>
              </div>
            </div>
          </div>
          
          <div className="feature-content">
            <span className="feature-label">Case Study</span>
            <h2>Read about how TechCrunch boosted reader engagement 7x using Ask&nbsp;Anything™</h2>
            <p>
              TechCrunch used Ask Anything™ to create 
              content-tailored responses specifically for AI search 
              engines, becoming the 5th most visible tech brand in 
              the world in a matter of&nbsp;weeks.
            </p>
            <button className="learn-more-btn">Learn more</button>
          </div>
        </section>

        {/* Insights Section */}
        <section className="insights-feature section-highlight">
          <div className="insights-content">
            <span className="feature-label">Keep Your Readers On-Site</span>
            <h2>Stop losing visitors to ChatGPT</h2>
            <p>
              Your readers have questions. Answer them instantly on YOUR website - not on ChatGPT, Perplexity, or&nbsp;Google.
            </p>
            <p className="retention-highlight">
              When visitors leave to search for answers, 85% never return. Our AI widget provides instant, contextual answers right on your page, keeping readers engaged with YOUR&nbsp;content.
            </p>
            <div className="copy-points">
              <div className="copy-point">✓ Answer questions without losing traffic</div>
              <div className="copy-point">✓ Turn curious visitors into engaged readers</div>
              <div className="copy-point">✓ Reduce ChatGPT abandonment by 85%</div>
            </div>
            <button className="learn-more-btn">View engagement data</button>
          </div>
          
          <div className="insights-dashboard">
            <div className="dashboard-mock">
              <div className="mock-header">
                <span>📊 Retention Impact</span>
                <span>Before vs After</span>
              </div>
              <div className="visibility-chart">
                <h4>Visitor Retention Impact</h4>
                <div className="retention-comparison">
                  <div className="retention-column before-column">
                    <div className="column-header">
                      <h5>Before Ask Anything™</h5>
                      <span className="column-subtitle">Visitors leave to search&nbsp;elsewhere</span>
                    </div>
                    <div className="retention-stack">
                      <div className="retention-segment leaving-segment" style={{height: '85%'}}>
                        <div className="segment-label">
                          <span className="percentage">85%</span>
                          <span className="description">Leave Site</span>
                        </div>
                      </div>
                      <div className="retention-segment staying-segment" style={{height: '15%'}}>
                        <div className="segment-label">
                          <span className="percentage">15%</span>
                          <span className="description">Stay</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="retention-arrow">
                    <div className="arrow-icon">→</div>
                    <span className="improvement-text">47% Reduction in Bounce Rate</span>
                  </div>
                  
                  <div className="retention-column after-column">
                    <div className="column-header">
                      <h5>After Ask Anything™</h5>
                      <span className="column-subtitle">Visitors get answers&nbsp;instantly</span>
                    </div>
                    <div className="retention-stack">
                      <div className="retention-segment staying-segment" style={{height: '62%'}}>
                        <div className="segment-label">
                          <span className="percentage">62%</span>
                          <span className="description">Stay & Engage</span>
                        </div>
                      </div>
                      <div className="retention-segment leaving-segment" style={{height: '38%'}}>
                        <div className="segment-label">
                          <span className="percentage">38%</span>
                          <span className="description">Leave</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="ranking-list">
                <h4>Engagement Metrics</h4>
                <div className="ranking-item">
                  <span className="metric-icon">📉</span>
                  <span>Bounce Rate Reduction</span>
                  <span className="percentage positive">-47%</span>
                </div>
                <div className="ranking-item">
                  <span className="metric-icon">⏱️</span>
                  <span>Time on Site Increase</span>
                  <span className="percentage positive">+89%</span>
                </div>
                <div className="ranking-item">
                  <span className="metric-icon">📄</span>
                  <span>Pages per Session</span>
                  <span className="percentage positive">+76%</span>
                </div>
                <div className="ranking-item">
                  <span className="metric-icon">🔄</span>
                  <span>Return Visitor Rate</span>
                  <span className="percentage positive">+72%</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="final-cta-section section-highlight">
          <div className="final-cta-content">
            <h2>Ready to add Ask Anything™<br />to your website?</h2>
            <button className="waitlist-btn" onClick={handleGetStarted}>Get an Ask Anything™ Button</button>
          </div>
        </section>

        {/* Footer */}
        <footer className="footer">
          <div className="footer-content">
            <div className="footer-section">
              <h4>Product</h4>
              <a href="#analytics">Analytics</a>
              <a href="#insights">AI Insights</a>
              <a href="#integrations">Integrations</a>
              <a href="#api">API</a>
            </div>
            <div className="footer-section">
              <h4>Company</h4>
              <a href="#about">About</a>
              <a href="#blog">Blog</a>
              <a href="#careers">Careers</a>
              <a href="#contact">Contact</a>
            </div>
            <div className="footer-section">
              <h4>Resources</h4>
              <a href="#docs">Documentation</a>
              <a href="#guides">Guides</a>
              <a href="#support">Support</a>
              <a href="#status">Status</a>
            </div>
            <div className="footer-section">
              <h4>Legal</h4>
              <a href="#privacy">Privacy</a>
              <a href="#terms">Terms</a>
              <a href="#security">Security</a>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2025 Ask Anything™ by Gist AI</span>
            <div className="social-links">
              <a href="#twitter">Twitter</a>
              <a href="#linkedin">LinkedIn</a>
            </div>
          </div>
        </footer>

        <style jsx>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          /* Prevent orphan words globally */
          h1, h2, h3, h4, h5, h6, p, .hero-subtitle, .benefit-card p, .customization-card p, .feature-content p, .column-subtitle {
            text-wrap: pretty;
            text-wrap: balance;
          }

          /* Fallback for browsers that don't support text-wrap */
          @supports not (text-wrap: pretty) {
            h1, h2, h3, h4, h5, h6, p {
              word-spacing: 0.1em;
            }
          }

          /* Section highlight effect */
          .section-highlight {
            position: relative;
            overflow: hidden;
          }

          .section-highlight::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(
              ellipse at center,
              rgba(102, 126, 234, 0.06) 0%,
              rgba(102, 126, 234, 0.03) 25%,
              rgba(102, 126, 234, 0.015) 50%,
              transparent 70%
            );
            pointer-events: none;
            z-index: 0;
          }

          /* Ensure content stays above the glow */
          .section-highlight > * {
            position: relative;
            z-index: 1;
          }

          .app {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #000;
            color: #fff;
            min-height: 100vh;
          }

          /* Header */
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.5rem 3rem;
            position: sticky;
            top: 0;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(10px);
            z-index: 100;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          }

          .logo-section {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            text-decoration: none;
            color: inherit;
            transition: opacity 0.2s ease;
          }

          .logo-section:hover {
            opacity: 0.8;
          }

          .logo {
            height: 28px;
            width: auto;
          }

          .brand-name {
            font-size: 1.25rem;
            font-weight: 600;
          }

          .nav {
            display: flex;
            gap: 2.5rem;
          }

          .nav a {
            color: rgba(255, 255, 255, 0.7);
            text-decoration: none;
            font-size: 0.95rem;
            transition: color 0.2s;
          }

          .nav a:hover {
            color: #fff;
          }

          .header-actions {
            display: flex;
            align-items: center;
            gap: 1rem;
          }

          .login-btn {
            color: rgba(255, 255, 255, 0.8);
            text-decoration: none;
            padding: 0.5rem 1rem;
            transition: color 0.2s;
          }

          .login-btn:hover {
            color: #fff;
          }

          .demo-btn {
            background: #fff;
            color: #000;
            border: none;
            padding: 0.6rem 1.5rem;
            border-radius: 8px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            text-decoration: none;
            display: inline-block;
          }

          .demo-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(255, 255, 255, 0.2);
          }

          /* Hero Section - Updated with funnel effect and animation */
          .hero {
            text-align: center;
            padding: 6rem 2rem 2rem;
            max-width: 1000px;
            margin: 0 auto;
          }

          .hero-title {
            font-size: 3.5rem;
            font-weight: 700;
            line-height: 1.2;
            margin-bottom: 1.5rem;
            letter-spacing: -0.02em;
          }

          .hero-emphasis {
            font-size: 3rem;
            display: block;
            margin-top: 0.5rem;
            animation: fadeInUp 0.8s ease-out 0.3s both;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .hero-subtitle {
            font-size: 1.25rem;
            color: rgba(255, 255, 255, 0.7);
            line-height: 1.6;
            margin-bottom: 3rem;
            max-width: 580px;
            margin-left: auto;
            margin-right: auto;
          }

          /* YouTube Video with proper spacing */
          .hero-video {
            margin-bottom: 4rem;
          }

          /* Hero CTA Button */
          .hero-cta-button {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #fff;
            border: none;
            padding: 1rem 3rem;
            border-radius: 50px;
            font-size: 1.125rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
            letter-spacing: 0.5px;
            margin-top: 32px;
            margin-bottom: 6rem;
            min-width: 260px;
            display: block;
            margin-left: auto;
            margin-right: auto;
          }

          .hero-cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 32px rgba(102, 126, 234, 0.4);
            background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
          }

          .hero-cta-button:active {
            transform: translateY(0);
          }

          /* Why Choose Section - New */
          .why-choose-section {
            padding: 4rem 2rem;
            max-width: 1200px;
            margin: 0 auto;
            text-align: center;
          }

          .section-title {
            font-size: 3rem;
            font-weight: 700;
            margin-bottom: 3rem;
            color: #ffffff;
            text-align: center;
            line-height: 1.2;
            letter-spacing: -0.02em;
          }

          .benefits-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 2rem;
          }

          .benefit-card {
            background: #0a0a0a;
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            padding: 2rem;
            transition: all 0.3s ease;
          }

          .benefit-card:hover {
            transform: translateY(-4px);
            border-color: rgba(255, 255, 255, 0.2);
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
          }

          .benefit-icon {
            font-size: 3rem;
            margin-bottom: 1.5rem;
            display: block;
          }

          .benefit-card h3 {
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 1rem;
            color: #fff;
          }

          .benefit-card p {
            font-size: 1rem;
            line-height: 1.6;
            color: rgba(255, 255, 255, 0.7);
            max-width: 95%;
          }

          /* Trust Section */
          .trust-section {
            text-align: center;
            padding: 5rem 2rem;
            background: #0a0a0a;
          }

          .teams-heading {
            font-size: 3rem;
            color: #ffffff;
            margin-bottom: 3rem;
            font-weight: 700;
            text-align: center;
            line-height: 1.2;
            letter-spacing: -0.02em;
          }

          .teams-subtitle {
            color: #9ca3af;
            font-size: 1rem;
            text-align: center;
            margin-bottom: 3rem;
            font-weight: 400;
          }

          .publishers-logos {
            display: flex;
            justify-content: center;
            align-items: center;
            max-width: 1000px;
            margin: 0 auto;
          }

          .publishers-logos img {
            width: 100%;
            max-width: 800px;
            height: auto;
            opacity: 0.8;
            transition: opacity 0.3s ease;
          }

          .publishers-logos img:hover {
            opacity: 1;
          }

          /* Dashboard Preview */
          .dashboard-preview {
            padding: 2rem;
            max-width: 1200px;
            margin: 0 auto 6rem;
          }

          .dashboard-container {
            background: #0a0a0a;
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            overflow: hidden;
          }

          .dashboard-header {
            display: flex;
            justify-content: space-between;
            padding: 1rem 1.5rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          }

          .dashboard-tabs {
            display: flex;
            gap: 1.5rem;
          }

          .tab {
            background: transparent;
            border: none;
            color: rgba(255, 255, 255, 0.5);
            cursor: pointer;
            transition: color 0.2s;
            padding: 0.5rem 1rem;
            border-radius: 6px;
            font-size: 1rem;
          }

          .tab:hover {
            color: rgba(255, 255, 255, 0.8);
            background: rgba(255, 255, 255, 0.05);
          }

          .tab.active {
            color: #fff;
            background: rgba(255, 255, 255, 0.1);
          }

          .dashboard-controls {
            display: flex;
            gap: 1.5rem;
            color: rgba(255, 255, 255, 0.5);
          }

          .dashboard-content {
            padding: 2rem;
          }

          .tab-content {
            display: none;
          }

          .tab-content.active {
            display: block;
            animation: fadeIn 0.3s ease-in-out;
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .home-hero {
            text-align: center;
            margin-bottom: 3rem;
          }

          .home-hero h2 {
            font-size: 2rem;
            font-weight: 600;
            margin-bottom: 1rem;
            color: #fff;
          }

          .home-hero p {
            color: rgba(255, 255, 255, 0.7);
            font-size: 1.1rem;
            line-height: 1.6;
            max-width: 600px;
            margin: 0 auto;
          }

          .gist-features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 2rem;
            margin-bottom: 3rem;
          }

          .feature-item {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 1.5rem;
            transition: all 0.3s ease;
          }

          .feature-item:hover {
            transform: translateY(-2px);
            border-color: rgba(255, 255, 255, 0.2);
          }

          .feature-item h4 {
            font-size: 1.1rem;
            font-weight: 600;
            margin-bottom: 0.75rem;
            color: #fff;
          }

          .feature-item p {
            color: rgba(255, 255, 255, 0.7);
            line-height: 1.5;
            font-size: 0.95rem;
          }

          .quality-section {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 2rem;
            text-align: center;
          }

          .quality-section h3 {
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 1rem;
            color: #fff;
          }

          .quality-section p {
            color: rgba(255, 255, 255, 0.7);
            line-height: 1.6;
            font-size: 1rem;
          }

          .metrics-row {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1.5rem;
            margin-bottom: 2rem;
          }

          .metric-card {
            background: rgba(255, 255, 255, 0.03);
            padding: 1.5rem;
            border-radius: 8px;
            border: 1px solid rgba(255, 255, 255, 0.05);
          }

          .metric-card h3 {
            font-size: 0.875rem;
            color: rgba(255, 255, 255, 0.6);
            margin-bottom: 0.5rem;
            font-weight: 400;
          }

          .metric-value {
            font-size: 2rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
          }

          .metric-change {
            font-size: 0.875rem;
            color: rgba(255, 255, 255, 0.5);
          }

          .metric-change.positive {
            color: #10b981;
          }

          .chart-section {
            background: rgba(255, 255, 255, 0.03);
            padding: 1.5rem;
            border-radius: 8px;
            margin-bottom: 2rem;
            border: 1px solid rgba(255, 255, 255, 0.05);
          }

          .chart-section h3 {
            font-size: 1rem;
            margin-bottom: 1rem;
          }

          .chart-placeholder {
            height: 200px;
            position: relative;
            overflow: hidden;
          }

          .chart-line {
            position: absolute;
            bottom: 0;
            width: 100%;
            height: 40%;
            background: linear-gradient(to top, rgba(102, 126, 234, 0.2), transparent);
            border-top: 2px solid #667eea;
          }

          .chart-line:nth-child(2) {
            height: 60%;
            opacity: 0.6;
          }

          .chart-line:nth-child(3) {
            height: 30%;
            opacity: 0.4;
          }

          .insights-section h3 {
            font-size: 1rem;
            margin-bottom: 1rem;
          }

          .insight-item {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 0.75rem 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          }

          .insight-rank {
            color: #667eea;
            font-weight: 600;
            min-width: 30px;
          }

          .insight-text {
            flex: 1;
            color: rgba(255, 255, 255, 0.8);
          }

          .insight-metric {
            color: rgba(255, 255, 255, 0.5);
            font-size: 0.875rem;
          }

          /* Feature Sections */
          .feature-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 4rem;
            align-items: center;
            padding: 6rem 3rem;
            max-width: 1200px;
            margin: 0 auto;
          }

          .feature-section.reverse {
            direction: rtl;
          }

          .feature-section.reverse > * {
            direction: ltr;
          }

          .feature-label {
            color: #667eea;
            font-size: 0.875rem;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.1em;
          }

          .feature-content h2 {
            font-size: 2.5rem;
            font-weight: 600;
            margin: 1rem 0 1.5rem;
            line-height: 1.2;
          }

          .feature-content p {
            color: rgba(255, 255, 255, 0.7);
            line-height: 1.6;
            margin-bottom: 2rem;
          }

          .email-input-wrapper {
            display: flex;
            gap: 0.5rem;
            max-width: 400px;
          }

          .email-input {
            flex: 1;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: #fff;
            padding: 0.75rem 1rem;
            border-radius: 8px;
            font-size: 1rem;
            outline: none;
            transition: all 0.2s;
          }

          .email-input:focus {
            border-color: rgba(255, 255, 255, 0.3);
            background: rgba(255, 255, 255, 0.08);
          }

          .email-input::placeholder {
            color: rgba(255, 255, 255, 0.4);
          }

          .analyze-btn {
            background: #667eea;
            color: #fff;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
          }

          .analyze-btn:hover {
            background: #5a67d8;
            transform: translateY(-1px);
          }

          .learn-more-btn {
            background: transparent;
            color: #667eea;
            border: none;
            padding: 0;
            font-size: 1rem;
            cursor: pointer;
            text-decoration: underline;
            transition: opacity 0.2s;
          }

          .learn-more-btn:hover {
            opacity: 0.8;
          }

          .feature-visual {
            display: flex;
            justify-content: center;
            align-items: center;
          }

          .analytics-card {
            background: #0a0a0a;
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 2rem;
            width: 100%;
            max-width: 400px;
          }

          .analytics-card h4 {
            font-size: 0.875rem;
            color: rgba(255, 255, 255, 0.6);
            margin-bottom: 1.5rem;
          }

          .analytics-stats {
            display: flex;
            justify-content: space-around;
          }

          .stat {
            text-align: center;
          }

          .stat-value {
            display: block;
            font-size: 2rem;
            font-weight: 600;
            margin-bottom: 0.25rem;
          }

          .stat-label {
            font-size: 0.875rem;
            color: rgba(255, 255, 255, 0.5);
          }

          .card-mockup {
            background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
            border-radius: 16px;
            padding: 2rem;
            width: 300px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
          }

          .card-image {
            background: #000;
            height: 150px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 1.5rem;
          }

          .card-logo {
            font-size: 1.5rem;
            font-weight: 600;
          }

          .card-details {
            display: flex;
            justify-content: space-between;
            color: rgba(255, 255, 255, 0.6);
            font-size: 0.875rem;
          }

          /* Insights Feature */
          .insights-feature {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 4rem;
            align-items: center;
            padding: 6rem 3rem;
            max-width: 1200px;
            margin: 0 auto;
            background: #0a0a0a;
          }

          .retention-highlight {
            color: rgba(255, 255, 255, 0.8);
            font-size: 1.1rem;
            line-height: 1.6;
            margin-bottom: 2rem;
            font-weight: 500;
          }

          .copy-points {
            margin: 2rem 0;
          }

          .copy-point {
            color: #10b981;
            font-size: 1rem;
            margin-bottom: 0.75rem;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .insights-dashboard {
            display: flex;
            justify-content: center;
          }

          .dashboard-mock {
            background: #000;
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 1.5rem;
            width: 100%;
            max-width: 500px;
          }

          .mock-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 1.5rem;
            color: rgba(255, 255, 255, 0.6);
            font-size: 0.875rem;
          }

          .visibility-chart {
            background: rgba(255, 255, 255, 0.03);
            padding: 1.5rem;
            border-radius: 8px;
            margin-bottom: 1.5rem;
          }

          .visibility-chart h4 {
            font-size: 0.875rem;
            margin-bottom: 1rem;
            color: rgba(255, 255, 255, 0.8);
          }

          .chart-bars {
            display: flex;
            align-items: flex-end;
            justify-content: space-around;
            height: 100px;
            gap: 0.5rem;
          }

          .retention-comparison {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 2rem;
            margin-top: 1rem;
          }

          .retention-column {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
          }

          .column-header {
            text-align: center;
            margin-bottom: 1rem;
          }

          .column-header h5 {
            font-size: 1rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
            color: rgba(255, 255, 255, 0.9);
          }

          .column-subtitle {
            font-size: 0.75rem;
            color: rgba(255, 255, 255, 0.6);
            line-height: 1.3;
          }

          .retention-stack {
            width: 80px;
            height: 200px;
            border-radius: 8px;
            overflow: hidden;
            display: flex;
            flex-direction: column-reverse;
            position: relative;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          }

          .retention-segment {
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            transition: all 0.6s ease;
            animation: growUp 1.2s ease-out;
          }

          @keyframes growUp {
            0% {
              height: 0 !important;
            }
            100% {
              height: var(--final-height);
            }
          }

          .leaving-segment {
            background: linear-gradient(to top, #ef4444, #f97316);
            border-bottom: 2px solid rgba(255, 255, 255, 0.1);
          }

          .staying-segment {
            background: linear-gradient(to top, #10b981, #3b82f6);
          }

          .segment-label {
            display: flex;
            flex-direction: column;
            align-items: center;
            color: white;
            font-weight: 600;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
            opacity: 0;
            animation: fadeInLabel 0.8s ease-out 0.6s forwards;
          }

          @keyframes fadeInLabel {
            0% { opacity: 0; transform: translateY(10px); }
            100% { opacity: 1; transform: translateY(0); }
          }

          .segment-label .percentage {
            font-size: 1.1rem;
            font-weight: 700;
            margin-bottom: 2px;
          }

          .segment-label .description {
            font-size: 0.7rem;
            font-weight: 500;
            text-align: center;
            line-height: 1.1;
          }

          .retention-arrow {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
            flex-shrink: 0;
            animation: slideIn 0.8s ease-out 0.4s both;
          }

          @keyframes slideIn {
            0% { opacity: 0; transform: scale(0.8); }
            100% { opacity: 1; transform: scale(1); }
          }

          .arrow-icon {
            font-size: 2rem;
            color: #10b981;
            font-weight: bold;
            text-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);
          }

          .improvement-text {
            font-size: 0.75rem;
            color: #10b981;
            font-weight: 600;
            text-align: center;
            line-height: 1.2;
            max-width: 80px;
          }

          /* Mobile responsive adjustments */
          @media (max-width: 768px) {
            .retention-comparison {
              flex-direction: column;
              gap: 2rem;
            }

            .retention-stack {
              width: 100px;
              height: 150px;
            }

            .retention-arrow {
              transform: rotate(90deg);
            }

            .arrow-icon {
              font-size: 1.5rem;
            }

            .improvement-text {
              transform: rotate(-90deg);
              white-space: nowrap;
            }
          }

          .ranking-list h4 {
            font-size: 0.875rem;
            margin-bottom: 1rem;
            color: rgba(255, 255, 255, 0.8);
          }

          .ranking-item {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.75rem 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            color: rgba(255, 255, 255, 0.7);
          }

          .metric-icon {
            font-size: 1.1rem;
            min-width: 24px;
            text-align: center;
          }

          .ranking-item span:nth-child(2) {
            flex: 1;
          }

          .percentage {
            color: #10b981;
            font-weight: 500;
            min-width: 60px;
            text-align: right;
          }

          .percentage.positive {
            color: #10b981;
          }

          /* Make it yours Section */
          .make-it-yours-section {
            padding: 6rem 2rem;
            background: #000;
          }

          .make-it-yours-content {
            max-width: 1200px;
            margin: 0 auto;
            text-align: center;
          }

          .make-it-yours-title {
            font-size: 3rem;
            font-weight: 700;
            margin-bottom: 3rem;
            color: #ffffff;
            text-align: center;
            line-height: 1.2;
            letter-spacing: -0.02em;
          }

          .make-it-yours-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 3rem;
            margin-top: 2rem;
          }

          .customization-card {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            padding: 2.5rem;
            text-align: left;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
          }

          .customization-card:hover {
            transform: translateY(-8px);
            border-color: rgba(102, 126, 234, 0.3);
            box-shadow: 0 20px 40px rgba(102, 126, 234, 0.1);
          }

          .customization-card h3 {
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 1rem;
            color: #fff;
          }

          .customization-card p {
            color: rgba(255, 255, 255, 0.7);
            line-height: 1.6;
            font-size: 1rem;
            max-width: 95%;
          }

          /* Final CTA Section */
          .final-cta-section {
            text-align: center;
            padding: 6rem 2rem;
            background: #0a0a0a;
          }

          .final-cta-content {
            max-width: 800px;
            margin: 0 auto;
          }

          .final-cta-content h2 {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 3rem;
            color: #fff;
            line-height: 1.2;
          }

          .waitlist-btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #fff;
            border: none;
            padding: 1rem 3rem;
            border-radius: 50px;
            font-size: 1.125rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
            letter-spacing: 0.5px;
          }

          .waitlist-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 32px rgba(102, 126, 234, 0.4);
            background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
          }

          .waitlist-btn:active {
            transform: translateY(0);
          }

          /* Footer */
          .footer {
            background: #000;
            padding: 4rem 3rem 2rem;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
          }

          .footer-content {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 3rem;
            max-width: 1200px;
            margin: 0 auto 3rem;
          }

          .footer-section h4 {
            font-size: 0.875rem;
            margin-bottom: 1rem;
            color: rgba(255, 255, 255, 0.9);
          }

          .footer-section a {
            display: block;
            color: rgba(255, 255, 255, 0.5);
            text-decoration: none;
            font-size: 0.875rem;
            margin-bottom: 0.75rem;
            transition: color 0.2s;
          }

          .footer-section a:hover {
            color: rgba(255, 255, 255, 0.8);
          }

          .footer-bottom {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-top: 2rem;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            color: rgba(255, 255, 255, 0.5);
            font-size: 0.875rem;
          }

          .social-links {
            display: flex;
            gap: 1.5rem;
          }

          .social-links a {
            color: rgba(255, 255, 255, 0.5);
            text-decoration: none;
            transition: color 0.2s;
          }

          .social-links a:hover {
            color: rgba(255, 255, 255, 0.8);
          }

          /* Responsive */
          @media (max-width: 768px) {
            .header {
              padding: 1rem;
            }

            .nav {
              display: none;
            }

            .hero-title {
              font-size: 2.5rem;
            }

            .hero-emphasis {
              font-size: 2rem;
            }

            .hero-subtitle {
              font-size: 1.1rem;
              max-width: 95%;
            }

            /* Enhanced orphan prevention on mobile */
            h1, h2, h3, h4, h5, h6, p {
              text-wrap: pretty;
              hyphens: auto;
              word-spacing: 0.05em;
            }

            .benefit-card p, .customization-card p, .feature-content p {
              max-width: 95%;
            }

            .hero-cta-button {
              min-width: 240px;
              padding: 0.875rem 2.5rem;
              font-size: 1rem;
            }

            .why-choose-section {
              padding: 3rem 1.5rem;
            }

            .section-title, .teams-heading, .make-it-yours-title {
              font-size: 2.25rem;
              margin-bottom: 2.5rem;
            }

            .benefits-grid {
              grid-template-columns: 1fr;
              gap: 1.5rem;
            }

            .metrics-row {
              grid-template-columns: 1fr;
            }

            .logo-grid {
              grid-template-columns: repeat(2, 1fr);
            }

            .feature-section,
            .insights-feature {
              grid-template-columns: 1fr;
              gap: 2rem;
              padding: 3rem 1.5rem;
            }

            .feature-section.reverse {
              direction: ltr;
            }

            .footer-content {
              grid-template-columns: repeat(2, 1fr);
              gap: 2rem;
            }

            .footer-bottom {
              flex-direction: column;
              gap: 1rem;
              text-align: center;
            }

            .make-it-yours-title {
              font-size: 2.5rem;
            }

            .make-it-yours-grid {
              grid-template-columns: 1fr;
              gap: 2rem;
            }

            .customization-card {
              padding: 2rem;
            }

            .final-cta-content h2 {
              font-size: 2rem;
            }

            .waitlist-btn {
              padding: 0.875rem 2.5rem;
              font-size: 1rem;
            }
          }
        `}</style>
      </div>
    </>
  );
}